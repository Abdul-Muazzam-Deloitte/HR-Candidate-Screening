from dotenv import load_dotenv
from langchain.tools import tool
import requests, os, base64
from urllib.parse import urlparse
from langchain.prompts import PromptTemplate
from app.llm_handler.llm_handler import ChatCompletionHandler

from app.models.project_info import ProjectInfo, RepositoryInfo

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

GITHUB_TOKEN = os.environ.get("GITHUB_API_KEY")  # optional but recommended
HEADERS = {"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}

@tool
def get_project_summary(project_url: str):
    """
    Generates tailored project summary based on the candidate's project data."""

    writer = get_stream_writer()
    writer(StepStartedEvent(type=EventType.STEP_STARTED, step_name="1 - project_contribution - Extracting Username..."))  

    username = extract_username(project_url)

    if not username:
        return {"error": "No username found in the provided GitHub URL"}
    
    writer(StepFinishedEvent(type=EventType.STEP_FINISHED, step_name="1 - project_contribution - Username extracted successfully")) 

    writer(StepStartedEvent(type=EventType.STEP_STARTED, step_name="2 - project_contribution - Retrieving Repositories...")) 
    repositories = list_user_repos(username)

    if not repositories:
        return {"error": "No repositories found or unable to fetch repositories"}
    writer(StepFinishedEvent(type=EventType.STEP_FINISHED, step_name="2 - project_contribution - Repositories retrieved successfully"))

    writer(StepStartedEvent(type=EventType.STEP_STARTED, step_name="3 - project_contribution - Summarizing Repositories..."))
    project_info = []
    for repository in repositories:
        repo_info = summarize_repo(username, repository["name"], repository["fork"])

        project_info.append(repo_info)
    writer(StepFinishedEvent(type=EventType.STEP_FINISHED, step_name="3 - project_contribution - Repositories summarized successfully"))
    
    writer(StepStartedEvent(type=EventType.STEP_STARTED, step_name="4 - project_contribution - Generating Project summary..."))  
    result = generate_project_summary(project_info)
    writer(StepFinishedEvent(type=EventType.STEP_FINISHED, step_name="4 - project_contribution - Generating Project summary completed successfully"))

    return result


def extract_username(project_url: str) -> str:
    """Extract the username from a GitHub URL."""
    parsed_url = urlparse(project_url)

    # Extract the username
    username = parsed_url.path.strip('/')
    return username
    
def list_user_repos(username):
    """List public repositories for a given GitHub username."""

    url = f"https://api.github.com/users/{username}/repos"
    response = requests.get(url, headers=HEADERS)

    if response.status_code != 200:
        return []
    
    # print(response.json())
    return [
        {"name": repo["name"], "fork": repo["fork"]}
        for repo in response.json()
    ]

def summarize_repo(username, repository_name, repository_fork):
    """Summarize a repository by fetching its README content."""

    url = f"https://api.github.com/repos/{username}/{repository_name}/readme"
    response = requests.get(url, headers=HEADERS)
    if response.status_code != 200:
        return RepositoryInfo(name=repository_name, url=f"https://github.com/{username}/{repository_name}", description="No description available", fork=False)
    
    item = response.json()
    read_me_content = base64.b64decode(item["content"]).decode("utf-8")
    # Here you can add logic to summarize the files or extract relevant information
    return RepositoryInfo(name=repository_name, url=f"https://github.com/{username}/{repository_name}", description=read_me_content, fork=repository_fork)

def generate_project_summary(project_info: list) -> ProjectInfo:
    """
    Generates tailored project summary based on the candidate's project data."""     
    # Load system and user messages from files
    system_message = open("app/knowledge_base/scoring_process/system_message.txt").read()
    user_message = open("app/knowledge_base/scoring_process/project_contribution_template.txt").read()

    # Create LangChain PromptTemplate
    user_prompt = PromptTemplate.from_template(user_message)

    # Format user prompt with variables
    formatted_user_message = user_prompt.format(
        output_model_structure=ProjectInfo.model_json_schema(),
        project_info=project_info
    )

    handler = ChatCompletionHandler()
    result =  handler.run_chain(system_message,formatted_user_message,output_model=ProjectInfo,node_id="project_contribution")

    return result