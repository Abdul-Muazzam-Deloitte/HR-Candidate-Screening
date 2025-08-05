from langchain.tools import tool
from langchain.prompts import PromptTemplate
from llm_handler.llm_handler import ChatCompletionHandler
from models.candidate_assessment import CandidateFinalScore
from models.score_result import CVScore
from typing import Optional, Dict, Any

@tool
def candiate_assessment_process(candidate_cv_score: CVScore
                                , candidate_social_score: Optional[str] | None
                                ) -> CandidateFinalScore:
    
    """Generates a final assessment score based on the candidate's CV score and social media screening results.
    
    Args:
        candidate_cv_score (CVScore): Candidate's CV score.
        candidate_social_score (Optional[list[str]] | None): Candidate's social media screening results.
    
    Returns:
        CandidateFinalScore: Final assessment score for the candidate.
    """
    print(f"Candidate CV Score: {candidate_cv_score}")
    system_message = open("app/knowledge_base/scoring_process/system_message.txt").read()
    user_message = open("app/knowledge_base/scoring_process/candidate_assessment_template.txt").read()

    # Create LangChain PromptTemplate
    user_prompt = PromptTemplate.from_template(user_message)

    # Format user prompt with variables
    formatted_user_message = user_prompt.format(
        output_model_structure=CandidateFinalScore.model_json_schema(),
        cv_score=candidate_cv_score,
        social_media_score=candidate_social_score
    )

    handler = ChatCompletionHandler()
    return handler.run_chain(system_message,formatted_user_message,output_model=CandidateFinalScore)