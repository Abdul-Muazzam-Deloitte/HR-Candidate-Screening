# Import environment variables from .env file
from dotenv import load_dotenv
import os
from typing import Dict, Any

# Import Google AI Package
import google.generativeai

# Import OpenAi Package
from openai import OpenAI

# Import LangChain Package
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain_core.runnables import Runnable

load_dotenv()

# Model of Google Gemini used
model = "gemini-2.5-flash-lite-preview-06-17"

# Google Gemini API Key
google_api_key = os.getenv('GOOGLE_API_KEY')

# Configure Gemini
google.generativeai.configure()

# openai_key = "<open-ai-key>"
# openai.api_key = openai_key
# model = "gpt-3.5-turbo"

class ChatCompletionHandler:

    def __init__(self):
        """
        Constructor of ChatCompletionHandler class
        Initialization of llm, prompt_template and chain variables
        """
        self.llm = ChatOpenAI(
            model=model,
            api_key=google_api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
            temperature=0.5
        )

        self.prompt_template = ChatPromptTemplate.from_messages([
            ("system", "{system_message}"),
            ("human", "{user_message}")
        ])

        self.chain: Runnable = self.prompt_template | self.llm

    def run_chain(self, system_message: str, user_message: str) -> Dict[str, Any]:
        """
        Construct the langChain chain to invoke a call to the LLM

        Args:
            system_message (str): Description of the system role for the LLM
            user_message (str): Description of the user role for the LLM

        Returns:
            response based on the messages
        """
        response = self.chain.invoke({
            "system_message": system_message,
            "user_message": user_message
        })
        return response.content

    @staticmethod
    def get_response_gemini(system_message: str, user_message: str) -> str:
        """
        Call to Gemini via the client libraries for OpenAI!

        As an alternative way to use Gemini that bypasses Google's python API library,
        Google released endpoints that means you can use Gemini via the client libraries for OpenAI!
        We're also trying Gemini's latest reasoning/thinking model

        Args:
            system_message (str): Description of the system role for the LLM
            user_message (str): Description of the user role for the LLM

        Returns:
            response based on the messages
        """
        gemini_via_openai_client = OpenAI(
            api_key=google_api_key, 
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
        )

        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message}
        ]

        response = gemini_via_openai_client.chat.completions.create(
            model= model,
            messages=messages
        )
        
        generated_text = response.choices[0].message.content
        return generated_text

    @staticmethod
    def get_response_open_ai(system_message: str, user_message: str) -> str:
        """
        Call to OpenAI LLM

        Args:
            system_message (str): Description of the system role for the LLM
            user_message (str): Description of the user role for the LLM

        Returns:
            response based on the messages
        """
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message},
            ]
        )
        generated_text = response.choices[0].message.content.strip()
        return generated_text