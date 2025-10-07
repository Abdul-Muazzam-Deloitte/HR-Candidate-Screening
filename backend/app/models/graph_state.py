
from typing_extensions import TypedDict
from app.models.candidate_info import Candidate
from app.models.score_result import JobPostings
from app.models.social_media_score import SocialMediaScore
from app.models.candidate_assessment import CandidateFinalScore
from app.models.interview_questions import InterviewQAs
from app.models.job_description import JobDescription
from app.models.project_info import ProjectInfo
from app.models.world_check import WorldCheck
from typing import List, Optional, Any
from typing import Annotated
import operator

# State definition for the graph
class CVProcessingState(TypedDict):
    pdf_path: str
    job_description: Optional[List[JobDescription]]
    candidate_cv_data: Candidate
    job_postings_matched: Optional[List[JobPostings]]
    social_media_score: Optional[SocialMediaScore]
    project_info: Optional[ProjectInfo]
    world_check: Optional[WorldCheck]
    candidate_final_score: CandidateFinalScore
    interview_questions: InterviewQAs
    messages: List[Any]
    error: Annotated[str,operator.add]