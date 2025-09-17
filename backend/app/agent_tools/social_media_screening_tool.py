from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode, LLMConfig
from crawl4ai.extraction_strategy import LLMExtractionStrategy
from dotenv import load_dotenv
from langchain.tools import tool
from app.models.social_media_score import SocialMediaScore
from typing import Optional
import os, asyncio
import json

load_dotenv(override=True)

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
from langchain.prompts import PromptTemplate

@tool
def get_social_media_presence(social_url: str):
    """Fetch social media presence data for a given URL.

    Args:
        social_url (str): The social media URL to fetch data from.

    Returns:
        dict: Extracted social media presence data.
    """
    writer = get_stream_writer()
    writer(StepStartedEvent(type=EventType.STEP_STARTED, step_name="1 - social_media_screening - Initializing web crawl..."))  
    user_message = open("app/knowledge_base/scoring_process/social_media_scoring_template.txt").read()

        # Create LangChain PromptTemplate
    user_prompt = PromptTemplate.from_template(user_message)

    # Format user prompt with variables
    formatted_user_message = user_prompt.format(
        output_model_structure=SocialMediaScore.model_json_schema())

    # 1. Define the LLM extraction strategy
    llm_strategy = LLMExtractionStrategy(
        llm_config = LLMConfig(provider="gemini/gemini-2.0-flash-exp", api_token=os.getenv('GOOGLE_API_KEY')),
        schema=SocialMediaScore.model_json_schema(),
        extraction_type="schema",
        instruction= formatted_user_message,
        chunk_token_threshold=1000,
        overlap_rate=0.35,
        apply_chunking=True,
        input_format="markdown",   # or "html", "fit_markdown"
        extra_args={"temperature": 0.5},
        force_json_response=True
    )

    # 2. Build the crawler config
    crawl_config = CrawlerRunConfig(
        extraction_strategy=llm_strategy,
        cache_mode=CacheMode.BYPASS
    )

    # 3. Create a browser config if needed
    browser_cfg = BrowserConfig(headless=True)
    writer(StepFinishedEvent(type=EventType.STEP_FINISHED, step_name="1 - social_media_screening - Web Craw Initialization completed successfully")) 

    writer(StepStartedEvent(type=EventType.STEP_STARTED, step_name="2 - social_media_screening - Retrieving social media data..."))  
    async def _fetch():
        async with AsyncWebCrawler(config=browser_cfg) as crawler:

            # 4. Let's say we want to crawl a single page
            result = await crawler.arun(
                url= normalize_social_url(social_url),
                config=crawl_config
            )

            if result.success:
                
                print(result.extracted_content)

                print(type(result.extracted_content))
                # 5. The extracted content is presumably JSON
                data = json.loads(result.extracted_content)

                # 6. Show usage stats
                llm_strategy.show_usage()  # prints token usage

                return data
            else:
                print("Error:", result.error_message)

    # Run the async crawl synchronously
    content = asyncio.run(_fetch())

    writer(StepFinishedEvent(type=EventType.STEP_FINISHED, step_name="2 - social_media_screening - Retrieving social media data completed successfully"))  
    # (Optionally) trim or process content if needed
    return content

def normalize_social_url(social_url: str) -> str:
    # If the URL already starts with "http://" or "https://", return it as is
    if social_url.startswith("http://") or social_url.startswith("https://"):
        return social_url
    # Otherwise, prepend "https://www."
    return f"https://www.{social_url}"