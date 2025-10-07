from pydantic import BaseModel, Field, ConfigDict
from app.models.score_result import JobScoreDetail

class SocialMediaScore(BaseModel):
    """Social media screening result"""
    model_config = ConfigDict(extra="ignore")

    social_media_platform: str = Field(description="Name of Social media platform reviewed")
    professional_presence: JobScoreDetail = Field(description="Professional online presence assessment")
    content_quality: JobScoreDetail = Field(description="Quality and appropriateness of shared content")
    industry_engagement: JobScoreDetail = Field(description="Engagement with industry-related topics and discussions")
    communication_style: JobScoreDetail = Field(description="Online communication style and professionalism")
    red_flags: JobScoreDetail = Field(description="Any concerning content or behavior (1=Many Issues, 5=No Issues)")
    overall_social_score: int = Field(description="Overall social media score out of 5", ge=1, le=5)
    screening_recommendation: str = Field(description="Social screening recommendation: Inconclusive, Clear, Concern, or Major Red Flag")