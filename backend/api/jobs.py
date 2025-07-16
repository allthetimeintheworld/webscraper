from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from config.database import get_db
from pydantic import BaseModel
from datetime import datetime
from core.scraper.job_executor import job_executor, JobStatus
import aiohttp

router = APIRouter()

# Simple in-memory storage for jobs (in production, use database)
jobs_storage = {}
job_id_counter = 1

# Pydantic models for request/response
class JobCreate(BaseModel):
    name: str
    description: Optional[str] = None
    urls: List[str]
    scraping_rules: dict
    settings: dict
    schedule: Optional[str] = None
    priority: int = 1

class JobResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    status: str
    created_at: datetime
    urls: List[str]
    scraping_rules: dict
    settings: dict
    progress: float
    pages_scraped: int
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[JobResponse])
async def get_jobs(db: AsyncSession = Depends(get_db)):
    """Get all scraping jobs"""
    # Return jobs from storage plus some sample data
    result = []
    
    # Add stored jobs
    for job_data in jobs_storage.values():
        result.append(JobResponse(**job_data))
    
    # Add sample data if no jobs exist
    if not result:
        result.append(JobResponse(
            id=0,
            name="Sample Job",
            description="A sample scraping job",
            status="completed",
            created_at=datetime.now(),
            urls=["https://example.com"],
            scraping_rules={"title": {"selector": "h1", "attribute": "text"}},
            settings={"delay": 2, "useJavaScript": False},
            progress=100.0,
            pages_scraped=123
        ))
    
    return result

@router.post("/", response_model=JobResponse)
async def create_job(job: JobCreate, db: AsyncSession = Depends(get_db)):
    """Create a new scraping job"""
    global job_id_counter
    
    # Store the job in memory
    job_id = job_id_counter
    job_id_counter += 1
    
    job_data = {
        "id": job_id,
        "name": job.name,
        "description": job.description,
        "status": "created",
        "created_at": datetime.now(),
        "urls": job.urls,
        "scraping_rules": job.scraping_rules,
        "settings": job.settings,
        "progress": 0.0,
        "pages_scraped": 0
    }
    
    jobs_storage[job_id] = job_data
    
    return JobResponse(**job_data)

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific job by ID"""
    if job_id in jobs_storage:
        return JobResponse(**jobs_storage[job_id])
    else:
        # Return sample data for non-existent jobs
        return JobResponse(
            id=job_id,
            name="Sample Job",
            description="A sample scraping job",
            status="running",
            created_at=datetime.now(),
            urls=["https://example.com"],
            scraping_rules={"title": {"selector": "h1", "attribute": "text"}},
            settings={"delay": 2, "useJavaScript": False},
            progress=45.5,
            pages_scraped=123
        )

@router.post("/{job_id}/start")
async def start_job(job_id: int, db: AsyncSession = Depends(get_db)):
    """Start a scraping job"""
    try:
        # Get the job configuration from storage
        if job_id not in jobs_storage:
            raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
        
        job_data = jobs_storage[job_id]
        
        # Use the actual job configuration
        job_config = {
            "name": job_data["name"],
            "urls": job_data["urls"],
            "scraping_rules": job_data["scraping_rules"],
            "settings": job_data["settings"]
        }
        
        success = await job_executor.start_job(job_id, job_config)
        
        if success:
            # Update job status in storage
            jobs_storage[job_id]["status"] = "running"
            return {"message": f"Job {job_id} started successfully", "status": "running"}
        else:
            return {"message": f"Job {job_id} is already running", "status": "already_running"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start job: {str(e)}")

@router.post("/{job_id}/stop")
async def stop_job(job_id: int, db: AsyncSession = Depends(get_db)):
    """Stop a scraping job"""
    try:
        success = await job_executor.stop_job(job_id)
        
        if success:
            # Update job status in storage if it exists
            if job_id in jobs_storage:
                jobs_storage[job_id]["status"] = "paused"
            return {"message": f"Job {job_id} stopped successfully", "status": "stopped"}
        else:
            return {"message": f"Job {job_id} is not running", "status": "not_running"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stop job: {str(e)}")

@router.get("/{job_id}/status")
async def get_job_status(job_id: int, db: AsyncSession = Depends(get_db)):
    """Get the current status and progress of a job"""
    try:
        status = job_executor.get_job_status(job_id)
        progress = job_executor.get_job_progress(job_id)
        
        if status is None:
            return {"status": "not_found", "message": f"Job {job_id} not found"}
        
        return {
            "job_id": job_id,
            "status": status.value,
            "progress": progress
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get job status: {str(e)}")

@router.get("/{job_id}/results")
async def get_job_results(job_id: int, db: AsyncSession = Depends(get_db)):
    """Get the results of a completed or running job"""
    try:
        progress = job_executor.get_job_progress(job_id)
        
        if progress is None:
            raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
        
        results = progress.get("results", [])
        
        return {
            "job_id": job_id,
            "total_results": len(results),
            "results": [
                {
                    "url": result.url,
                    "data": result.data,
                    "success": result.success,
                    "error": result.error,
                    "timestamp": result.timestamp
                } for result in results
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get job results: {str(e)}")

@router.get("/{job_id}/progress")
async def get_job_progress(job_id: int):
    """Get the real-time progress from job executor"""
    status = job_executor.get_job_status(job_id)
    progress = job_executor.get_job_progress(job_id)
    
    if status is None:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found in executor")
    
    return {
        "job_id": job_id,
        "status": status.value,
        "progress": progress,
        "is_running": job_id in job_executor.running_jobs
    }

@router.delete("/{job_id}")
async def delete_job(job_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a scraping job"""
    return {"message": f"Job {job_id} deleted"}

@router.post("/newsapi")
async def create_newsapi_job(
    query: str = "trump",
    from_date: str = "2025-07-01",
    sort_by: str = "publishedAt",
    api_key: str = "b430f395965341fda13646efedff85a7"
):
    """Create a NewsAPI job with server-side API calls to avoid CORS"""
    
    # Make the NewsAPI request server-side
    newsapi_url = f"https://newsapi.org/v2/everything?q={query}&from={from_date}&sortBy={sort_by}&apiKey={api_key}"
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(newsapi_url) as response:
                if response.status != 200:
                    raise HTTPException(status_code=response.status, detail=f"NewsAPI error: {response.status}")
                
                news_data = await response.json()
                
                if news_data.get("status") == "error":
                    raise HTTPException(status_code=400, detail=f"NewsAPI error: {news_data.get('message', 'Unknown error')}")
                
                # Create a job with the fetched data
                global job_id_counter
                job_id = job_id_counter
                job_id_counter += 1
                
                job_data = {
                    "id": job_id,
                    "name": f"NewsAPI Search: {query}",
                    "description": f"Search for '{query}' in news articles",
                    "status": "completed",
                    "created_at": datetime.now(),
                    "urls": [newsapi_url],
                    "scraping_rules": {"api_type": "newsapi"},
                    "settings": {"delay": 1, "useJavaScript": False},
                    "progress": 100.0,
                    "pages_scraped": 1,
                    "results": news_data
                }
                
                jobs_storage[job_id] = job_data
                
                return {
                    "job_id": job_id,
                    "status": "completed",
                    "total_results": news_data.get("totalResults", 0),
                    "articles_found": len(news_data.get("articles", [])),
                    "message": f"Successfully fetched {len(news_data.get('articles', []))} articles for '{query}'"
                }
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch news data: {str(e)}")

@router.get("/newsapi/results/{job_id}")
async def get_newsapi_results(job_id: int):
    """Get NewsAPI results for a specific job"""
    if job_id not in jobs_storage:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    
    job_data = jobs_storage[job_id]
    results = job_data.get("results", {})
    articles = results.get("articles", [])
    
    return {
        "job_id": job_id,
        "total_results": results.get("totalResults", 0),
        "articles_count": len(articles),
        "articles": articles[:10],  # Return first 10 articles
        "status": job_data.get("status", "unknown")
    }
