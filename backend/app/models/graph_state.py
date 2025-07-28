
from typing_extensions import TypedDict
from models.candidate_info import Candidate
from models.score_result import CVScore
from typing import List, Optional, Any

# State definition for the graph
class CVProcessingState(TypedDict):
    pdf_path: str
    cv_data: Candidate
    score: Optional[CVScore]
    messages: List[Any]
    error: Optional[str]