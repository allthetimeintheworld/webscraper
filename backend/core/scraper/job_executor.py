import asyncio
import aiohttp
from typing import Dict, List, Any, Optional
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time
import random
from dataclasses import dataclass
from enum import Enum

class JobStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"

@dataclass
class ScrapingResult:
    url: str
    data: Dict[str, Any]
    timestamp: float
    success: bool
    error: Optional[str] = None

def validate_url(url: str) -> str:
    """Validate and fix URL format"""
    if not url:
        raise ValueError("URL cannot be empty")
    
    # Add protocol if missing
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    # Validate URL format
    parsed = urlparse(url)
    if not parsed.netloc:
        raise ValueError(f"Invalid URL format: {url}")
    
    return url

class JobExecutor:
    def __init__(self):
        self.running_jobs: Dict[int, asyncio.Task] = {}
        self.job_status: Dict[int, JobStatus] = {}
        self.job_progress: Dict[int, Dict[str, Any]] = {}
    
    async def start_job(self, job_id: int, job_config: Dict[str, Any]) -> bool:
        """Start executing a scraping job"""
        if job_id in self.running_jobs:
            return False  # Job already running
        
        # Create and start the scraping task
        task = asyncio.create_task(self._execute_job(job_id, job_config))
        self.running_jobs[job_id] = task
        self.job_status[job_id] = JobStatus.RUNNING
        self.job_progress[job_id] = {
            "pages_scraped": 0,
            "total_pages": 0,
            "progress_percentage": 0,
            "start_time": time.time(),
            "results": []
        }
        
        return True
    
    async def stop_job(self, job_id: int) -> bool:
        """Stop a running job"""
        if job_id not in self.running_jobs:
            return False
        
        task = self.running_jobs[job_id]
        task.cancel()
        
        try:
            await task
        except asyncio.CancelledError:
            pass
        
        del self.running_jobs[job_id]
        self.job_status[job_id] = JobStatus.PAUSED
        
        return True
    
    def get_job_status(self, job_id: int) -> Optional[JobStatus]:
        """Get the current status of a job"""
        return self.job_status.get(job_id)
    
    def get_job_progress(self, job_id: int) -> Optional[Dict[str, Any]]:
        """Get the current progress of a job"""
        return self.job_progress.get(job_id)
    
    async def _execute_job(self, job_id: int, job_config: Dict[str, Any]):
        """Execute the actual scraping job"""
        try:
            urls = job_config.get("urls", [])
            scraping_rules = job_config.get("scraping_rules", {})
            settings = job_config.get("settings", {})
            
            # Initialize progress
            self.job_progress[job_id]["total_pages"] = len(urls)
            
            # Create HTTP session with custom settings
            timeout = aiohttp.ClientTimeout(total=30)
            headers = {
                "User-Agent": self._get_user_agent(settings.get("userAgent", "default"))
            }
            
            async with aiohttp.ClientSession(timeout=timeout, headers=headers) as session:
                for i, url in enumerate(urls):
                    try:
                        # Validate and fix URL format
                        validated_url = validate_url(url)
                        
                        # Apply delay between requests
                        if i > 0:
                            delay = settings.get("delay", 2)
                            await asyncio.sleep(delay + random.uniform(0, 1))
                        
                        # Scrape the page
                        result = await self._scrape_page(session, validated_url, scraping_rules, settings)
                        
                        # Store result
                        self.job_progress[job_id]["results"].append(result)
                        self.job_progress[job_id]["pages_scraped"] = i + 1
                        self.job_progress[job_id]["progress_percentage"] = ((i + 1) / len(urls)) * 100
                        
                        if result.success:
                            print(f"Job {job_id}: Scraped {validated_url} - {len(result.data)} fields extracted")
                        else:
                            print(f"Job {job_id}: Failed to scrape {validated_url} - {result.error}")
                        
                    except ValueError as e:
                        # URL validation error
                        error_result = ScrapingResult(
                            url=url,
                            data={},
                            timestamp=time.time(),
                            success=False,
                            error=f"Invalid URL: {str(e)}"
                        )
                        self.job_progress[job_id]["results"].append(error_result)
                        self.job_progress[job_id]["pages_scraped"] = i + 1
                        self.job_progress[job_id]["progress_percentage"] = ((i + 1) / len(urls)) * 100
                        print(f"Job {job_id}: URL validation failed for {url}: {str(e)}")
                        continue
                        
                    except Exception as e:
                        # Other errors
                        error_result = ScrapingResult(
                            url=url,
                            data={},
                            timestamp=time.time(),
                            success=False,
                            error=f"Scraping error: {str(e)}"
                        )
                        self.job_progress[job_id]["results"].append(error_result)
                        self.job_progress[job_id]["pages_scraped"] = i + 1
                        self.job_progress[job_id]["progress_percentage"] = ((i + 1) / len(urls)) * 100
                        print(f"Job {job_id}: Error scraping {url}: {str(e)}")
                        continue
            
            # Job completed successfully
            self.job_status[job_id] = JobStatus.COMPLETED
            self.job_progress[job_id]["end_time"] = time.time()
            
            # Clean up the running job
            if job_id in self.running_jobs:
                del self.running_jobs[job_id]
                
        except asyncio.CancelledError:
            self.job_status[job_id] = JobStatus.PAUSED
            raise
        except Exception as e:
            self.job_status[job_id] = JobStatus.FAILED
            self.job_progress[job_id]["error"] = str(e)
            print(f"Job {job_id} failed: {str(e)}")
            
            # Clean up the running job
            if job_id in self.running_jobs:
                del self.running_jobs[job_id]
    
    async def _scrape_page(self, session: aiohttp.ClientSession, url: str, 
                          scraping_rules: Dict[str, Any], settings: Dict[str, Any]) -> ScrapingResult:
        """Scrape a single page"""
        try:
            async with session.get(url) as response:
                if response.status != 200:
                    return ScrapingResult(
                        url=url,
                        data={},
                        timestamp=time.time(),
                        success=False,
                        error=f"HTTP {response.status}"
                    )
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                # Extract data based on scraping rules
                extracted_data = {}
                
                # Extract predefined fields
                for field_name, rule in scraping_rules.items():
                    if field_name == "custom":
                        continue  # Handle custom fields separately
                    
                    if isinstance(rule, dict) and "selector" in rule:
                        selector = rule["selector"]
                        attribute = rule.get("attribute", "text")
                        
                        value = self._extract_field(soup, selector, attribute, url)
                        extracted_data[field_name] = value
                        
                        # Debug info
                        if not value:
                            print(f"Warning: No data found for field '{field_name}' with selector '{selector}' on {url}")
                
                # Extract custom fields
                custom_fields = scraping_rules.get("custom", [])
                for custom_field in custom_fields:
                    if isinstance(custom_field, dict):
                        field_name = custom_field.get("name", "")
                        selector = custom_field.get("selector", "")
                        attribute = custom_field.get("attribute", "text")
                        
                        if field_name and selector:
                            value = self._extract_field(soup, selector, attribute, url)
                            extracted_data[field_name] = value
                            
                            # Debug info
                            if not value:
                                print(f"Warning: No data found for custom field '{field_name}' with selector '{selector}' on {url}")
                
                success = True
                error_msg = None
                
                # Check if we extracted any data
                if not any(extracted_data.values()):
                    error_msg = f"No data extracted - check your CSS selectors. Available selectors found: {len(soup.find_all())} elements"
                    print(f"Warning: {error_msg} for {url}")
                
                return ScrapingResult(
                    url=url,
                    data=extracted_data,
                    timestamp=time.time(),
                    success=success,
                    error=error_msg
                )
                
        except Exception as e:
            return ScrapingResult(
                url=url,
                data={},
                timestamp=time.time(),
                success=False,
                error=str(e)
            )
    
    def _extract_field(self, soup: BeautifulSoup, selector: str, attribute: str, base_url: str) -> str:
        """Extract a field from the HTML using CSS selector"""
        try:
            elements = soup.select(selector)
            if not elements:
                return ""
            
            element = elements[0]  # Take the first match
            
            if attribute == "text":
                return element.get_text(strip=True)
            elif attribute == "href":
                href = element.get("href", "")
                return urljoin(base_url, href) if href else ""
            elif attribute == "src":
                src = element.get("src", "")
                return urljoin(base_url, src) if src else ""
            else:
                return element.get(attribute, "")
                
        except Exception as e:
            print(f"Error extracting field with selector '{selector}': {str(e)}")
            return ""
    
    def _get_user_agent(self, user_agent_type: str) -> str:
        """Get user agent string based on type"""
        user_agents = {
            "default": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "chrome": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "firefox": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
            "safari": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15"
        }
        return user_agents.get(user_agent_type, user_agents["default"])

# Global job executor instance
job_executor = JobExecutor()
