from langchain.tools import tool
from langchain.prompts import PromptTemplate
from app.llm_handler.llm_handler import ChatCompletionHandler
from app.models.score_result import CVScore
from app.models.job_description import JobDescription

from ag_ui.core import (
    RunStartedEvent,
    RunFinishedEvent,
    RunErrorEvent,
    StepStartedEvent,
    StepFinishedEvent,
    TextMessageContentEvent,
    TextMessageStartEvent,
    TextMessageEndEvent,
    EventType
)


from langgraph.config import get_stream_writer

import uuid

@tool
def score_cv_against_jd(cv_data: str, job_description: JobDescription) -> CVScore:
    """Score a CV against a job description using an LLM.

    Args:
        cv_data (str): The markdown representation of the candidate's CV.

    Returns:
        CVScore: The score result object containing the CV score.
    """  

    writer = get_stream_writer()
    writer(StepStartedEvent(type=EventType.STEP_STARTED, step_name="1 - cv_scoring - Generating CV score..."))  
    # Load prompt templates
    system_message = open("app/knowledge_base/scoring_process/system_message.txt").read()
    user_message = open("app/knowledge_base/scoring_process/cv_scoring_template.txt").read()

    user_prompt = PromptTemplate.from_template(user_message)
    formatted_user_message = user_prompt.format(
        output_model_structure=CVScore.model_json_schema(),
        job_description=job_description.model_dump_json(exclude={"job_postings_vector"}),
        candidate_cv_content=cv_data
    )

    handler = ChatCompletionHandler()

    # Run LLM chain with streaming
    result =  handler.run_chain(
        system_message=system_message,
        user_message=formatted_user_message,
        output_model=CVScore,
        node_id="cv_scoring"
    )

    writer(StepFinishedEvent(type=EventType.STEP_FINISHED, step_name="1 - cv_scoring - Generating CV score completed successfully"))  
    return result
    


    