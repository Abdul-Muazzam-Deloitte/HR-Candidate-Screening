from pydantic import BaseModel, Field, ConfigDict
from app.models.social_media_score import SocialMediaScore
from app.models.score_result import CVScore
from typing import Optional

class JobDescription(BaseModel):
    
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(description="Id of job description")
    title: str = Field(description="Title of the job position")
    department: str = Field(description="Department of the job position")
    description: str = Field(description="Detailed description of the job position")
    experience: str = Field(description="Experience level required for the job position")
    skills: list[str] = Field(description="List of required skills for the job position")
    requirements: Optional[list[str]] = Field(description="List of requirements for the job position")