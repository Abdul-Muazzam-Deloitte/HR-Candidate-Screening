from dotenv import load_dotenv
import os, asyncio
from document_extraction.document_extractor import DocumentExtractor
from llm_handler.llm_handler import ChatCompletionHandler
from workflow.langgraph_workflow import create_cv_scoring_workflow
from models.graph_state import CVProcessingState
from models.candidate_info import Candidate
from IPython.display import display, Image

load_dotenv(override=True)

def document_extraction():

    cv_extractor = DocumentExtractor('app/knowledge_base/pdf_templates/ABDUL Muhammad Muazzam_Ul_Hussein CV.pdf')
    extracted_docs_result = cv_extractor.extract_cv_info()

    return extracted_docs_result

def score_cv_vs_job_description():

    # candidate_cv_content = extracted_data.markdown

    job_description = open("app/knowledge_base/scoring_process/job_description.txt").read()
    system_message = open("app/knowledge_base/scoring_process/system_message.txt").read()
    user_message = open("app/knowledge_base/scoring_process/user_message.txt").read()

    # Step 2:
    handler = ChatCompletionHandler()
    return handler.run_chain(system_message, user_message,)

def run_cv_scoring_example():

    pdf_path = "app/knowledge_base/pdf_templates/ABDUL Muhammad Muazzam_Ul_Hussein CV.pdf"

    workflow = create_cv_scoring_workflow()

    initial_state = CVProcessingState(
        pdf_path=pdf_path,
        cv_data=Candidate(
            name="",
            email="test@test.com",
            summary="",
            skills=[],
            experience=[],
            education=[],
            social_links=[],
            markdown=""
        ),
        cv_score=None,
        social_media_score=None,
        proceed_interview="",
        messages=[],
        error=""
    )

    try:
        result = workflow.invoke(initial_state)
        # print(result)

    except Exception as e:
        print(f"❌ Workflow execution failed: {str(e)}")

async def main():

    google_api_key = os.environ.get("GOOGLE_API_KEY")
    landing_ai_api_key = os.environ.get("VISION_AGENT_API_KEY")
    if not google_api_key:
        raise ValueError("Missing GOOGLE_API_KEY environment variable")
    elif not landing_ai_api_key:
        raise ValueError("Missing LANDING_AI_API_KEY environment variable")
    else:
        run_cv_scoring_example()

if __name__ == "__main__":
    asyncio.run(main())
