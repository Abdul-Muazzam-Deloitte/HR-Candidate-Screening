from pydantic import BaseModel, Field, ConfigDict

class CandidateFinalScore(BaseModel):
    """Final merged scoring result combining CV and social media screening"""
    model_config = ConfigDict(extra="ignore")
    
    candidate_cv: str = Field(description="Brief summary of recommendation based on CV score results")
    social_media: str= Field(description="Brief summary of recommendation based on social media screening results")
    world_check: str = Field(description="Brief summary of recommendation based on world check morality results")
    final_recommendation: str = Field(description="Final hiring recommendation: Highly Recommended, Recommended, Not Recommended")
    proceed_to_interview: str = Field(description="Decision to proceed to interview questions", pattern="^(Yes|No)$")