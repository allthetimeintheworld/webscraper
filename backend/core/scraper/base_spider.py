import asyncio
import time
import random
import logging
from typing import Dict, List, Optional, Any
from urllib.parse import urljoin, urlparse
import requests
from fake_useragent import UserAgent
from urllib.robotparser import RobotFileParser

logger = logging.getLogger(__name__)

class RateLimiter:
    """Intelligent rate limiter with adaptive delays"""
    
    def __init__(self, min_delay: float = 1.0, max_delay: float = 5.0):
        self.min_delay = min_delay
        self.max_delay = max_delay
        self.last_request_time = 0
        self.consecutive_errors = 0
        self.domain_delays = {}  # Per-domain delay tracking
        
    async def wait(self, domain: str) -> None:
        """Wait appropriate time before next request"""
        current_time = time.time()
        
        # Calculate base delay with randomization
        base_delay = random.uniform(self.min_delay, self.max_delay)
        
        # Increase delay if we've had consecutive errors
        if self.consecutive_errors > 0:
            error_multiplier = min(2 ** self.consecutive_errors, 10)
            base_delay *= error_multiplier
            logger.warning(f"Increased delay to {base_delay:.2f}s due to {self.consecutive_errors} consecutive errors")
        
        # Per-domain tracking
        if domain in self.domain_delays:
            time_since_last = current_time - self.domain_delays[domain]
            if time_since_last < base_delay:
                sleep_time = base_delay - time_since_last
                logger.debug(f"Rate limiting: sleeping {sleep_time:.2f}s for domain {domain}")
                await asyncio.sleep(sleep_time)
        
        self.domain_delays[domain] = time.time()
    
    def record_success(self):
        """Record successful request"""
        self.consecutive_errors = 0
    
    def record_error(self, status_code: Optional[int] = None):
        """Record failed request"""
        self.consecutive_errors += 1
        if status_code == 429:  # Too Many Requests
            self.consecutive_errors += 2  # Penalize rate limiting heavily
        logger.warning(f"Recorded error (status: {status_code}), consecutive errors: {self.consecutive_errors}")

class RobotsTxtChecker:
    """Intelligent robots.txt handling with override capabilities"""
    
    def __init__(self):
        self.robots_cache = {}  # Cache robots.txt parsers
        self.cache_duration = 3600  # 1 hour cache
    
    def get_robots_parser(self, domain: str) -> Optional[RobotFileParser]:
        """Get cached robots.txt parser or fetch new one"""
        cache_key = domain
        current_time = time.time()
        
        # Check cache
        if cache_key in self.robots_cache:
            parser, cached_time = self.robots_cache[cache_key]
            if current_time - cached_time < self.cache_duration:
                return parser
        
        # Fetch new robots.txt
        try:
            robots_url = f"https://{domain}/robots.txt"
            rp = RobotFileParser()
            rp.set_url(robots_url)
            rp.read()
            
            self.robots_cache[cache_key] = (rp, current_time)
            logger.info(f"Fetched robots.txt for {domain}")
            return rp
            
        except Exception as e:
            logger.warning(f"Failed to fetch robots.txt for {domain}: {e}")
            # Cache empty parser to avoid repeated requests
            empty_parser = RobotFileParser()
            self.robots_cache[cache_key] = (empty_parser, current_time)
            return empty_parser
    
    def can_fetch(self, url: str, user_agent: str = "*", respect_robots: bool = True) -> Dict[str, Any]:
        """
        Check if URL can be fetched according to robots.txt
        Returns dict with decision and metadata
        """
        domain = urlparse(url).netloc
        
        if not respect_robots:
            return {
                "allowed": True,
                "reason": "robots.txt compliance disabled",
                "risk_level": "medium",
                "recommendation": "Consider respecting robots.txt for ethical scraping"
            }
        
        try:
            parser = self.get_robots_parser(domain)
            if not parser:
                return {
                    "allowed": True,
                    "reason": "robots.txt not found or inaccessible",
                    "risk_level": "low",
                    "recommendation": "Proceed with caution and respect rate limits"
                }
            
            allowed = parser.can_fetch(user_agent, url)
            
            if not allowed:
                # Check if alternative user agents are allowed
                alternative_agents = ["Googlebot", "bingbot", "*"]
                for alt_agent in alternative_agents:
                    if parser.can_fetch(alt_agent, url):
                        return {
                            "allowed": False,
                            "reason": f"Blocked for {user_agent} but allowed for {alt_agent}",
                            "risk_level": "high",
                            "recommendation": f"Consider using {alt_agent} user agent or find alternative data source",
                            "alternative_agent": alt_agent
                        }
                
                return {
                    "allowed": False,
                    "reason": "Blocked by robots.txt",
                    "risk_level": "high",
                    "recommendation": "Find alternative data source or contact website owner"
                }
            
            return {
                "allowed": True,
                "reason": "Allowed by robots.txt",
                "risk_level": "low",
                "recommendation": "Proceed with normal scraping"
            }
            
        except Exception as e:
            logger.error(f"Error checking robots.txt for {url}: {e}")
            return {
                "allowed": True,
                "reason": f"Error checking robots.txt: {e}",
                "risk_level": "medium",
                "recommendation": "Proceed with extra caution"
            }

class UserAgentRotator:
    """Intelligent user agent rotation"""
    
    def __init__(self):
        self.ua = UserAgent()
        self.used_agents = []
        self.max_history = 50
    
    def get_random_user_agent(self) -> str:
        """Get a random user agent, avoiding recently used ones"""
        for _ in range(10):  # Try up to 10 times
            agent = self.ua.random
            if agent not in self.used_agents[-10:]:  # Avoid last 10 used
                self.used_agents.append(agent)
                if len(self.used_agents) > self.max_history:
                    self.used_agents.pop(0)
                return agent
        
        # Fallback to random if we can't find unused one
        agent = self.ua.random
        self.used_agents.append(agent)
        return agent
    
    def get_realistic_headers(self, user_agent: Optional[str] = None) -> Dict[str, str]:
        """Generate realistic browser headers"""
        if not user_agent:
            user_agent = self.get_random_user_agent()
        
        headers = {
            "User-Agent": user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Cache-Control": "max-age=0",
        }
        
        # Randomly add some optional headers
        if random.random() < 0.3:
            headers["Referer"] = "https://www.google.com/"
        
        if random.random() < 0.2:
            headers["X-Forwarded-For"] = f"{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}"
        
        return headers

class BaseScraper:
    """Base scraper class with intelligent features"""
    
    def __init__(self, 
                 respect_robots_txt: bool = True,
                 min_delay: float = 1.0,
                 max_delay: float = 5.0,
                 use_proxy: bool = False):
        
        self.rate_limiter = RateLimiter(min_delay, max_delay)
        self.robots_checker = RobotsTxtChecker()
        self.ua_rotator = UserAgentRotator()
        self.respect_robots_txt = respect_robots_txt
        self.use_proxy = use_proxy
        self.session = requests.Session()
        
        # Statistics
        self.stats = {
            "requests_made": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "robots_blocked": 0,
            "rate_limited": 0
        }
    
    async def fetch_url(self, url: str, **kwargs) -> Dict[str, Any]:
        """
        Fetch URL with intelligent rate limiting and robots.txt checking
        """
        domain = urlparse(url).netloc
        
        # Check robots.txt
        user_agent = self.ua_rotator.get_random_user_agent()
        robots_check = self.robots_checker.can_fetch(url, user_agent, self.respect_robots_txt)
        
        if not robots_check["allowed"] and self.respect_robots_txt:
            self.stats["robots_blocked"] += 1
            logger.warning(f"Robots.txt blocked: {url}")
            return {
                "success": False,
                "error": "blocked_by_robots",
                "robots_info": robots_check,
                "url": url
            }
        
        # Rate limiting
        await self.rate_limiter.wait(domain)
        
        # Prepare headers
        headers = self.ua_rotator.get_realistic_headers(user_agent)
        headers.update(kwargs.get("headers", {}))
        
        try:
            self.stats["requests_made"] += 1
            
            # Make request
            response = self.session.get(
                url,
                headers=headers,
                timeout=30,
                **{k: v for k, v in kwargs.items() if k != "headers"}
            )
            
            # Check response
            if response.status_code == 429:
                self.stats["rate_limited"] += 1
                self.rate_limiter.record_error(429)
                logger.warning(f"Rate limited: {url}")
                return {
                    "success": False,
                    "error": "rate_limited",
                    "status_code": 429,
                    "url": url
                }
            
            if response.status_code >= 400:
                self.rate_limiter.record_error(response.status_code)
                self.stats["failed_requests"] += 1
                return {
                    "success": False,
                    "error": "http_error",
                    "status_code": response.status_code,
                    "url": url
                }
            
            # Success
            self.rate_limiter.record_success()
            self.stats["successful_requests"] += 1
            
            return {
                "success": True,
                "content": response.text,
                "status_code": response.status_code,
                "headers": dict(response.headers),
                "url": url,
                "final_url": response.url,
                "robots_info": robots_check,
                "user_agent": user_agent,
                "response_time": response.elapsed.total_seconds()
            }
            
        except Exception as e:
            self.rate_limiter.record_error()
            self.stats["failed_requests"] += 1
            logger.error(f"Error fetching {url}: {e}")
            return {
                "success": False,
                "error": "request_exception",
                "exception": str(e),
                "url": url
            }
    
    def get_stats(self) -> Dict[str, Any]:
        """Get scraping statistics"""
        total_requests = self.stats["requests_made"]
        success_rate = (self.stats["successful_requests"] / total_requests * 100) if total_requests > 0 else 0
        
        return {
            **self.stats,
            "success_rate": round(success_rate, 2),
            "robots_compliance": self.respect_robots_txt
        }
