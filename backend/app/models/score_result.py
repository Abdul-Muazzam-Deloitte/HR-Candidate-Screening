from app.models.job_description import JobDescription
from pydantic import BaseModel, Field, ConfigDict

class JobScoreDetail(BaseModel):
    """Individual scoring detail with score and notes"""
    model_config = ConfigDict(extra="ignore") 

    score: int = Field(description="Score out of 5", ge=1, le=5)
    notes: str = Field(description="Detailed notes explaining the score")

class JobPostingScore(BaseModel):
    """CV scoring result matching the detailed template"""
    model_config = ConfigDict(extra="ignore")

    technical_skills: JobScoreDetail = Field(description="Technical skills assessment")
    experience_relevance: JobScoreDetail = Field(description="Experience relevance to the role")
    years_experience: JobScoreDetail = Field(description="Years of experience evaluation")
    project_fit: JobScoreDetail = Field(description="Project and domain fit assessment")
    soft_skills: JobScoreDetail = Field(description="Soft skills and interpersonal abilities")
    education_certifications: JobScoreDetail = Field(description="Education and certifications evaluation")
    communication: JobScoreDetail = Field(description="Communication skills based on CV presentation")
    overall_recommendation: str = Field(
        description="Overall recommendation based on different criteria",
        pattern="^(Strong Fit|Good Fit|Moderate Fit|Poor Fit)$"
    )

class JobPostings(BaseModel):    
    """CV scoring result matching the detailed template"""
    model_config = ConfigDict(extra="ignore")

    job_posting: JobDescription = Field(description="Job posting details and descriptions")
    job_posting_score: JobPostingScore = Field(description="Scoring result matching the detailed template and job posting")