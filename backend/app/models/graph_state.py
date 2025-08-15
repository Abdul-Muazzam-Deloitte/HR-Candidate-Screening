
from typing_extensions import TypedDict
from app.models.candidate_info import Candidate
from app.models.score_result import CVScore
from app.models.social_media_score import SocialMediaScore
from app.models.candidate_assessment import CandidateFinalScore
from app.models.interview_questions import InterviewQAs
from typing import List, Optional, Any
from typing import Annotated
import operator

# State definition for the graph
class CVProcessingState(TypedDict):
    pdf_path: str
    job_description: str
    cv_data: Candidate
    cv_score: CVScore
    social_media_score: Optional[SocialMediaScore]
    candidate_final_score: CandidateFinalScore
    interview_questions: InterviewQAs
    messages: List[Any]
    error: Annotated[str,operator.add]