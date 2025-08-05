from pydantic import BaseModel, Field
from models.social_media_score import SocialMediaScore
from models.score_result import CVScore
from typing import Optional

class CandidateFinalScore(BaseModel):
    """Final merged scoring result combining CV and social media screening"""
    cv_assessment: CVScore = Field(description="CV scoring results")
    social_media_assessment: Optional[SocialMediaScore] = Field(description="Social media screening results")
    final_recommendation: str = Field(description="Final hiring recommendation: Highly Recommended, Recommended, Not Recommended")
    proceed_to_interview: str = Field(description="Decision to proceed to interview questions", pattern="^(Yes|No)$")