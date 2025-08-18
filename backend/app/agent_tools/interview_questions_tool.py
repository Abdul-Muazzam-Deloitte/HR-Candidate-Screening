from langchain.tools import tool
from langchain.prompts import PromptTemplate
from app.llm_handler.llm_handler import ChatCompletionHandler
from app.models.interview_questions import InterviewQAs
from typing import List

@tool
def generate_interview_questions(candidate_cv_content: str, job_description: str) -> InterviewQAs:
    """
    Generates tailored interview questions based on the candidate's CV data.
    
    Args:
        cv_data (str): Candidate's CV data.
    
    Returns:
        InterviewQAs: Generated interview questions.
    """
    # Load system and user messages from files
    system_message = open("app/knowledge_base/scoring_process/system_message.txt").read()
    user_message = open("app/knowledge_base/scoring_process/interview_questions_template.txt").read()

    # Create LangChain PromptTemplate
    user_prompt = PromptTemplate.from_template(user_message)

    # Format user prompt with variables
    formatted_user_message = user_prompt.format(
        output_model_structure=InterviewQAs.model_json_schema(),
        job_description=job_description,
        candidate_cv_content=candidate_cv_content
    )

    handler = ChatCompletionHandler()
    return handler.run_chain(system_message,formatted_user_message,output_model=InterviewQAs)


@tool
def regenerate_interview_questions(interview_questions: InterviewQAs, hallucinated_questions: List[str], candidate_cv_content: str, job_description: str) -> InterviewQAs:
    """
    Generates tailored interview questions based on the candidate's CV data.
    
    Args:
        cv_data (str): Candidate's CV data.
    
    Returns:
        InterviewQAs: Generated interview questions.
    """
    # Load system and user messages from files
    system_message = open("app/knowledge_base/scoring_process/system_message.txt").read()
    user_message = open("app/knowledge_base/scoring_process/regenerate_interview_questions_template.txt").read()

    # Create LangChain PromptTemplate
    user_prompt = PromptTemplate.from_template(user_message)

    # Format user prompt with variables
    formatted_user_message = user_prompt.format(
        interview_questions=interview_questions,
        hallucinated_questions=hallucinated_questions,
        output_model_structure=InterviewQAs.model_json_schema(),
        job_description=job_description,
        candidate_cv_content=candidate_cv_content
    )

    handler = ChatCompletionHandler()
    return handler.run_chain(system_message,formatted_user_message,output_model=InterviewQAs)