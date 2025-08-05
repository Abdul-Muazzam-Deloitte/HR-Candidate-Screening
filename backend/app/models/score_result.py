from pydantic import BaseModel, Field

class ScoreDetail(BaseModel):
    """Individual scoring detail with score and notes"""
    score: int = Field(description="Score out of 5", ge=1, le=5)
    notes: str = Field(description="Detailed notes explaining the score")

class CVScore(BaseModel):
    """CV scoring result matching the detailed template"""
    technical_skills: ScoreDetail = Field(description="Technical skills assessment")
    experience_relevance: ScoreDetail = Field(description="Experience relevance to the role")
    years_experience: ScoreDetail = Field(description="Years of experience evaluation")
    project_fit: ScoreDetail = Field(description="Project and domain fit assessment")
    soft_skills: ScoreDetail = Field(description="Soft skills and interpersonal abilities")
    education_certifications: ScoreDetail = Field(description="Education and certifications evaluation")
    communication: ScoreDetail = Field(description="Communication skills based on CV presentation")
    overall_recommendation: str = Field(
        description="Overall recommendation based on different criteria",
        pattern="^(Strong Fit|Good Fit|Moderate Fit|Poor Fit)$"
    )