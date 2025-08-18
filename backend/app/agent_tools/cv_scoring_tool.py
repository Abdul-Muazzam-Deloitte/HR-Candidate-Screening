from langchain.tools import tool
from langchain.prompts import PromptTemplate
from app.llm_handler.llm_handler import ChatCompletionHandler
from app.models.score_result import CVScore

@tool
async def score_cv_against_jd(cv_data: str, job_description: str, session=None) -> CVScore:
    """Score a CV against a job description using an LLM.

    Args:
        cv_data (str): The markdown representation of the candidate's CV.

    Returns:
        CVScore: The score result object containing the CV score.
    """
    # Load system and user messages from files
        # Notify frontend that this node has started
    try:
        # Notify frontend that this node has started
        if session:
            await session.send({
                "type": "node_status",
                "node": "cv_scoring",
                "status": "started"
            })

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
        result = await handler.run_chain(
            system_message=system_message,
            user_message=formatted_user_message,
            output_model=CVScore,
            session=session  # Pass session for live token streaming
        )

        # Notify frontend that node has finished
        if session:
            await session.send({
                "type": "node_status",
                "node": "cv_scoring",
                "status": "finished",
                "result": result
            })

        return result

    except Exception as e:
        if session:
            await session.send({
                "type": "node_status",
                "node": "cv_scoring",
                "status": "error",
                "error": str(e)
            })
        raise e


    