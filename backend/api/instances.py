from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from config.database import get_db
from pydantic import BaseModel

router = APIRouter()

class InstanceStatus(BaseModel):
    id: str
    region: str
    status: str
    cpu_usage: float
    memory_usage: float
    active_jobs: int
    cost_per_hour: float

@router.get("/", response_model=List[InstanceStatus])
async def get_instances(db: AsyncSession = Depends(get_db)):
    """Get all EC2 instances status"""
    # Placeholder implementation
    return [
        InstanceStatus(
            id="i-1234567890abcdef0",
            region="us-east-1",
            status="running",
            cpu_usage=45.2,
            memory_usage=67.8,
            active_jobs=3,
            cost_per_hour=0.096
        ),
        InstanceStatus(
            id="i-0987654321fedcba0",
            region="us-west-2",
            status="running",
            cpu_usage=23.1,
            memory_usage=34.5,
            active_jobs=1,
            cost_per_hour=0.096
        )
    ]

@router.post("/scale")
async def scale_instances(target_count: int, db: AsyncSession = Depends(get_db)):
    """Scale EC2 instances up or down"""
    return {"message": f"Scaling to {target_count} instances"}

@router.post("/{instance_id}/stop")
async def stop_instance(instance_id: str, db: AsyncSession = Depends(get_db)):
    """Stop a specific EC2 instance"""
    return {"message": f"Instance {instance_id} stopped"}

@router.post("/{instance_id}/start")
async def start_instance(instance_id: str, db: AsyncSession = Depends(get_db)):
    """Start a specific EC2 instance"""
    return {"message": f"Instance {instance_id} started"}
