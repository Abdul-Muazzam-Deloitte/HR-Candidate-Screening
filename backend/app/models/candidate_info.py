from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any

class Experience(BaseModel):
    """Work experience entry"""
    company: str = Field(description="Company name")
    position: str = Field(description="Job position/title") 
    duration: str = Field(description="Duration of employment")
    responsibilities: List[str] = Field(description="Key responsibilities and achievements")

class Education(BaseModel):
    """Education entry"""
    institution: str = Field(description="Educational institution")
    degree: str = Field(description="Degree or qualification")
    field: str = Field(description="Field of study")
    year: Optional[str] = Field(description="Graduation year or duration")

class Candidate(BaseModel):

    name: str = Field(description="the full name of the candidate")
    email: EmailStr = Field(description="the email of the candidate")
    phone: str | None = Field(default=None, description="The candidate's phone number")
    address: str | None = Field(default=None, description="The candidate's address")
    summary: Optional[str] = Field(description="Professional summary or objective")
    skills: List[str] = Field(description="Technical and soft skills")
    experience: List[Experience] = Field(description="Work experience")
    education: List[Education] = Field(description="Educational background")
    linkedin_url: str | None = Field(default=None, description="URL to the candidate's LinkedIn profile")
    github_url: str | None = Field(default=None, description="URL to the candidate's Github profile")
    x_url: str | None = Field(default=None, description="URL to the candidate's X/Twitter profile")
    markdown: str = Field(description="full contents of pdf in markdown")
