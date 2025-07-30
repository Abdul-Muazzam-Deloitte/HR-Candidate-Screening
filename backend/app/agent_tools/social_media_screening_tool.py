from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode, LLMConfig
from crawl4ai.extraction_strategy import LLMExtractionStrategy
from dotenv import load_dotenv
from langchain.tools import tool
from models.social_media_score import SocialMediaScore
from typing import Optional
import os, asyncio
import json

load_dotenv(override=True)

@tool
def get_social_media_presence(linkedin_url: Optional[str]):
    """
    Method to determine a candidate's social media presence
    Web Scraping is done using Crawl4Ai
    
    Returns:
        response based on instructions
    """
    system_message = open("app/knowledge_base/social_media_scoring/social_media_scoring_template.txt").read()

    # 1. Define the LLM extraction strategy
    llm_strategy = LLMExtractionStrategy(
        llm_config = LLMConfig(provider="gemini/gemini-2.0-flash-exp", api_token=os.getenv('GOOGLE_API_KEY')),
        schema=SocialMediaScore.model_json_schema(),
        extraction_type="schema",
        instruction= system_message,
        chunk_token_threshold=1000,
        overlap_rate=0.35,
        apply_chunking=True,
        input_format="markdown",   # or "html", "fit_markdown"
        extra_args={"temperature": 0.5, "max_tokens": 800}
    )

    # 2. Build the crawler config
    crawl_config = CrawlerRunConfig(
        extraction_strategy=llm_strategy,
        cache_mode=CacheMode.BYPASS
    )

    # 3. Create a browser config if needed
    browser_cfg = BrowserConfig(headless=True)

    async def _fetch():
        async with AsyncWebCrawler(config=browser_cfg) as crawler:

            # 4. Let's say we want to crawl a single page
            result = await crawler.arun(
                url= f"https://www.{linkedin_url}",
                config=crawl_config
            )

            if result.success:
                
                # 5. The extracted content is presumably JSON
                data = json.loads(result.extracted_content)
                # print(result.extracted_content['output'])
                print(data)
                # 6. Show usage stats
                llm_strategy.show_usage()  # prints token usage

                return data
            else:
                print("Error:", result.error_message)

    # Run the async crawl synchronously
    content = asyncio.run(_fetch())
    # (Optionally) trim or process content if needed
    return content
