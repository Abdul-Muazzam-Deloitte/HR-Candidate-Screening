from langchain.tools import tool
from langchain.prompts import PromptTemplate
from app.llm_handler.llm_handler import ChatCompletionHandler
from app.models.candidate_report import CandidateReport
from app.models.candidate_assessment import CandidateFinalScore

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
def generate_candidate_report(candidate_cv_data: str, candidate_final_score: CandidateFinalScore):
    """Generate a candidate report based on CV data and final score.

    Args:
        candidate_cv_data (str): The markdown representation of the candidate's CV.
        candidate_final_score (CandidateFinalScore): The final assessment score of the candidate.

    Returns:
        CandidateReport: The generated candidate report.
    """
    writer = get_stream_writer()
    writer(StepStartedEvent(type=EventType.STEP_STARTED, step_name="1 - report_generation - Generating candidate's report..."))  
    system_message = open("app/knowledge_base/scoring_process/system_message.txt").read()
    user_message = open("app/knowledge_base/scoring_process/candidate_report_template.txt").read()

    # Create LangChain PromptTemplate
    user_prompt = PromptTemplate.from_template(user_message)

    # Format user prompt with variables
    formatted_user_message = user_prompt.format(
        output_model_structure=CandidateReport.model_json_schema(),
        candidate_cv_data = candidate_cv_data,
        candidate_final_score=candidate_final_score
    )

    handler = ChatCompletionHandler()
    result =  handler.run_chain(system_message,formatted_user_message,output_model=CandidateReport,node_id="report_generation")
    print (result)

    writer(StepFinishedEvent(type=EventType.STEP_FINISHED, step_name="1 - report_generation - Generating candidate's report completed successfully"))  
    return result