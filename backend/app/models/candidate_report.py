from pydantic import BaseModel, Field, ConfigDict 

class CandidateReport(BaseModel):    
    """Model representing a report generated from the candidate assessment process"""
    model_config = ConfigDict(extra="ignore")

    candidate_name: str = Field(description="Name of the candidate")
    summary: str = Field(description="Summary of candidate performance in assessments and reasons whether to proceed to the next step or not")
    recommendation: str = Field(description="Final hiring recommendation based on assessments")