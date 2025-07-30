from langchain.tools import tool
from langchain.schema.runnable import Runnable
from langchain.prompts import PromptTemplate
from typing import Dict, Any
from llm_handler.llm_handler import ChatCompletionHandler
from models.score_result import CVScore

@tool
def score_cv_against_jd(cv_data: str) -> CVScore:
    """
    Scores a CV against a job description.
    """
    
    job_description_text = open("app/knowledge_base/scoring_process/job_description.txt").read()
    system_message = open("app/knowledge_base/scoring_process/system_message.txt").read()
    user_message = open("app/knowledge_base/scoring_process/user_message.txt").read()

    # Create LangChain PromptTemplate
    user_prompt = PromptTemplate.from_template(user_message)

    # Format user prompt with variables
    formatted_user_message = user_prompt.format(
        scoring_json_format=CVScore.model_json_schema(),
        job_description=job_description_text,
        candidate_cv_content=cv_data
    )

    handler = ChatCompletionHandler()
    return handler.run_chain(system_message,formatted_user_message,output_model=CVScore)
     


    