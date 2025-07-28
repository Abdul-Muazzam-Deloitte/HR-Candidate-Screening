from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode, LLMConfig
from crawl4ai.extraction_strategy import LLMExtractionStrategy
from langchain.tools import tool
from dotenv import load_dotenv
from IPython.display import Markdown, display

load_dotenv(override=True)

class SocialMediaScreeningTool():

    async def get_social_media_presence():
        """
        Method to determine a candidate's social media presence
        Web Scraping is done using Crawl4Ai
        
        Returns:
            response based on instructions
        """
        llm_strategy = LLMExtractionStrategy(
            llm_config = LLMConfig(provider="gemini/gemini-2.0-flash-exp", api_token=os.getenv('GOOGLE_API_KEY')),
            # schema=MyModel.model_json_schema(), # Or use model_json_schema()
            extraction_type="block",
            instruction="""Retrieve a complete summary of the user's post activity.
                Specifically, extract:
                All public posts shared by the user — including text content, media (if any), and post dates.
                Engagement metrics per post (likes, comments, shares).
                Topics or themes frequently discussed (e.g., tech, leadership, hiring, personal growth).
                Comments or replies the user has made on their own or others' posts.
                Any notable hashtags or mentions they consistently use.
                Return the results in reverse chronological order.
                If you cannot access the posts directly due to privacy restrictions or login walls, clearly state that limitation.""",
            chunk_token_threshold=1000,
            overlap_rate=0.0,
            apply_chunking=True,
            input_format="markdown",   # or "html", "fit_markdown"
            extra_args={"temperature": 0.0, "max_tokens": 800}
        )

        # 2. Build the crawler config
        crawl_config = CrawlerRunConfig(
            extraction_strategy=llm_strategy,
            cache_mode=CacheMode.BYPASS
        )

        # 3. Create a browser config if needed
        browser_cfg = BrowserConfig(headless=True)

        async with AsyncWebCrawler(config=browser_cfg) as crawler:
            # 4. Let's say we want to crawl a single page
            result = await crawler.arun(
                url="https://www.linkedin.com/in/abdul-muhammad-muazzam-ul-hussein-81a281161/",
                config=crawl_config
            )

            if result.success:
                # 5. The extracted content is presumably JSON
                data = json.loads(result.extracted_content)
                print(result.extracted_content['output'])

                # 6. Show usage stats
                llm_strategy.show_usage()  # prints token usage

                return data
            else:
                print("Error:", result.error_message)

