
from typing_extensions import TypedDict
from models.candidate_info import Candidate
from models.score_result import CVScore
from models.social_media_score import SocialMediaScore
from typing import List, Optional, Any
from typing import Annotated
import operator
# from langgraph.graph import add_multiple

# State definition for the graph
class CVProcessingState(TypedDict):
    pdf_path: str
    cv_data: Candidate
    cv_score: CVScore
    social_media_score: Optional[SocialMediaScore]
    proceed_interview: str
    messages: List[Any]
    error: Annotated[str,operator.add]