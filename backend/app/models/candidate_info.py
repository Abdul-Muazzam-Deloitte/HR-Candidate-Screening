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

class SocialLinks(BaseModel):
    """Social media links"""
    platform: Optional[str] = Field(description="Name of the social media platform in candidate's profile")
    url: Optional[str] = Field(description="Url to the candidate's social profile on the platform")

class Candidate(BaseModel):

    name: str = Field(description="the full name of the candidate")
    email: EmailStr = Field(description="the email of the candidate")
    phone: Optional[str] = Field(default=None, description="The candidate's phone number")
    address: Optional[str]= Field(default=None, description="The candidate's address")
    summary: Optional[str] = Field(description="Professional summary or objective")
    skills: List[str] = Field(description="Technical and soft skills")
    experience: List[Experience] = Field(description="Work experience")
    education: List[Education] = Field(description="Educational background")
    linkedin_url: Optional[str] = Field(default=None, description="URL to the candidate's LinkedIn profile")
    github_url: Optional[str] = Field(default=None, description="URL to the candidate's Github profile")
    x_url: Optional[str] = Field(default=None, description="URL to the candidate's X/Twitter profile")
    social_links:Optional[List[SocialLinks]] = Field(description="Social media links pertaining to the candidate")
    markdown: str = Field(description="full contents of pdf in markdown")
