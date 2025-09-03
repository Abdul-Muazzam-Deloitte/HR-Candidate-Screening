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
        job_description=job_description,
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

    # # Generate a unique message_id for this streaming session
    # message_id = str(uuid.uuid4())

    # # Emit start event
    # writer(TextMessageStartEvent(
    #     type=EventType.TEXT_MESSAGE_START,
    #     message_id=message_id,
    #     role="assistant"
    # ))

    # from langchain.callbacks.base import BaseCallbackHandler
    # from langchain_core.callbacks.manager import CallbackManager


    # from dotenv import load_dotenv
    # import os
    # from pydantic import BaseModel

    # # Import Google AI Package
    # import google.generativeai

    # # Import OpenAi Package
    # from openai import OpenAI

    # # Import LangChain Package
    # from langchain_openai import ChatOpenAI
    # from langchain.prompts import ChatPromptTemplate
    # from langchain_core.runnables import Runnable

    # load_dotenv()

    # # Model of Google Gemini used
    # model = "gemini-2.5-flash-lite-preview-06-17"

    # # Google Gemini API Key
    # google_api_key = os.getenv('GOOGLE_API_KEY')

    # # Configure Gemini
    # google.generativeai.configure()


    # # Load your system and user messages
    # system_message = open("app/knowledge_base/scoring_process/system_message.txt").read()
    # user_message = open("app/knowledge_base/scoring_process/cv_scoring_template.txt").read()

    # user_prompt = PromptTemplate.from_template(user_message)
    # formatted_user_message = user_prompt.format(
    #     output_model_structure=CVScore.model_json_schema(),
    #     job_description=job_description,
    #     candidate_cv_content=cv_data
    # )

    # # Callback handler to stream tokens as they arrive
    # class AGUIStreamingCallback(BaseCallbackHandler):
    #     def on_llm_new_token(self, token: str, **kwargs):
    #         if token.strip():
    #             writer(TextMessageContentEvent(
    #                 type=EventType.TEXT_MESSAGE_CONTENT,
    #                 message_id=message_id,
    #                 delta=token
    #             ))

    # # Create a callback manager with streaming
    # callback_manager = CallbackManager([AGUIStreamingCallback()])

    # # Initialize streaming LLM
    # llm = ChatOpenAI(
    #     model=model,
    #     api_key=google_api_key,
    #     base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    #     temperature=0.5,
    #     streaming=True,
    #     callback_manager=callback_manager
    # )

    # # Run LLM to stream tokens
    # # Combine system and user messages into a single prompt string
    # prompt = f"{system_message}\n{formatted_user_message}"
    # raw_response = llm.invoke(prompt)

    # # Parse final text into CVScore Pydantic model
    # cv_score = CVScore.model_validate_json(str(raw_response.content))

    # # Emit end event
    # writer(TextMessageEndEvent(
    #     type=EventType.TEXT_MESSAGE_END,
    #     message_id=message_id
    # ))

    # # Mark step finished for LangGraph workflow
    # writer(StepFinishedEvent(
    #     type=EventType.STEP_FINISHED,
    #     step_name="1 - cv_scoring - Generating CV score completed successfully"
    # ))
    # writer(StepFinishedEvent(type=EventType.STEP_FINISHED, step_name="1 - cv_scoring - Generating CV score completed successfully"))  
    # return cv_score



    writer(StepFinishedEvent(type=EventType.STEP_FINISHED, step_name="1 - cv_scoring - Generating CV score completed successfully"))  
    return result
    


    