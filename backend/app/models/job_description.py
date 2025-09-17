from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from app.models.social_media_score import SocialMediaScore
from app.models.score_result import CVScore
from typing import List, Optional

class JobDescriptionCreate(BaseModel):
    """Model for creating a Job Description (from frontend input)."""
    model_config = ConfigDict(extra="ignore")
    
    title: str = Field(description="Title of the job position")
    department: str = Field(description="Department of the job position")
    description: str = Field(description="Detailed description of the job position")
    experience: str = Field(description="Experience level required for the job position")
    skills: List[str] = Field(description="List of required skills for the job position")
    requirements: List[str] = Field(description="List of requirements for the job position")


class JobDescription(JobDescriptionCreate):
    """Model for returning a Job Description (backend response)."""
    id: str = Field(description="Id of job description")
    createdAt: datetime = Field(description="Timestamp when the job description was created")
    updatedAt: Optional[datetime] = Field(description="Timestamp when the job description was last updated")
    job_postings_vector: Optional[str] = Field(description="vector of Job posting")