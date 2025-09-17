from langchain.tools import tool
from langchain.prompts import PromptTemplate
from app.llm_handler.llm_handler import ChatCompletionHandler
from app.models.candidate_assessment import CandidateFinalScore
from app.models.score_result import CVScore
from app.models.social_media_score import SocialMediaScore
from app.models.world_check import WorldCheck
from typing import Optional

from ag_ui.core import (
    RunStartedEvent,
    RunFinishedEvent,
    RunErrorEvent,
    StepStartedEvent,
    StepFinishedEvent,
    TextMessageContentEvent,
    EventType
)


from langgraph.config import get_stream_writer

@tool
def candiate_assessment_process(candidate_cv_score: CVScore,
                                candidate_social_score: Optional[SocialMediaScore] | None,
                                candidate_world_check_score: Optional[WorldCheck] | None
                                ) -> CandidateFinalScore:
    
    """Generates a final assessment score based on the candidate's CV score and social media screening results.
    
    Args:
        candidate_cv_score (CVScore): Candidate's CV score.
        candidate_social_score (Optional[list[str]] | None): Candidate's social media screening results.
    
    Returns:
        CandidateFinalScore: Final assessment score for the candidate.
    """
    writer = get_stream_writer()
    writer(StepStartedEvent(type=EventType.STEP_STARTED, step_name="1 - candidate_assessment - Generating candidate final assessment score..."))  
    system_message = open("app/knowledge_base/scoring_process/system_message.txt").read()
    user_message = open("app/knowledge_base/scoring_process/candidate_assessment_template.txt").read()

    # Create LangChain PromptTemplate
    user_prompt = PromptTemplate.from_template(user_message)

    # Format user prompt with variables
    formatted_user_message = user_prompt.format(
        output_model_structure=CandidateFinalScore.model_json_schema(),
        cv_score=candidate_cv_score,
        social_media_score=candidate_social_score,
        world_check_score=candidate_world_check_score
    )

    handler = ChatCompletionHandler()
    result =  handler.run_chain(system_message,formatted_user_message,output_model=CandidateFinalScore, node_id="candidate_assessment")

    writer(StepFinishedEvent(type=EventType.STEP_FINISHED, step_name="1 - candidate_assessment - Generating CV score completed successfully"))  
    return result