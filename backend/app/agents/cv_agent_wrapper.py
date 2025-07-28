from langchain.agents import Tool, initialize_agent
from langchain_openai import ChatOpenAI
from agent_tools.document_extraction_tool import DocumentExtractorTool
from agent_tools.cv_scoring_tool import CVScoringTool
from agent_tools.social_media_screening_tool import SocialMediaScreeningTool

from dotenv import load_dotenv
import os

# Import Google AI Package
import google.generativeai

# Import OpenAi Package
from openai import OpenAI

load_dotenv()

# Model of Google Gemini used
model = "gemini-2.5-flash-lite-preview-06-17"

# Google Gemini API Key
google_api_key = os.getenv('GOOGLE_API_KEY')

# Configure Gemini
google.generativeai.configure()

class CVAgentWrapper:
    def __init__(self,chain):
        self.tools = [
            Tool(
                name="ExtractPDFText",
                func=DocumentExtractorTool.convert_pdf_to_markdown_landing_ai_sdk,
                description="Use this tool to extract text from PDF using LandingAI"
            ),
            Tool(
                name="ScoreCV",
                func=CVScoringTool(chain).get_tool(),
                description="Use this tool to score CV against a job description. Input must be a JSON string or dict with 'candidate_cv_content' and 'job_description'."
            ),
            Tool(
                name="SocialMediaScreening",
                func=SocialMediaScreeningTool.get_social_media_presence,
                description="Use this tool to determine a candidate's social media presence"
            ),
        ]

    def get_agent(self):
        llm=ChatOpenAI(
            model=model,
            api_key=google_api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
            temperature=0.5
        )
        return initialize_agent(
            self.tools,
            llm,
            agent="zero-shot-react-description",
            verbose=True,
            handle_parsing_errors=True
        )