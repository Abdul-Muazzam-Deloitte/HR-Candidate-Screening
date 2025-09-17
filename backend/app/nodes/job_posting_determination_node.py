from app.models.graph_state import CVProcessingState
from app.agent_tools.determine_job_posting import determine_job_posting
from ag_ui.core import (
    RunStartedEvent,
    RunFinishedEvent,
    RunErrorEvent,
    EventType
)

from langgraph.config import get_stream_writer

def job_posting_determination_node(state: CVProcessingState):

    writer = get_stream_writer()
    writer(RunStartedEvent(type=EventType.RUN_STARTED, thread_id="Job Posting Determination Process", run_id="job_posting_determination"))

    # Retrieve job posting from database or predefined list
    try:
        if state.get("error") or not state.get("cv_data"):
        
            # return state'
            writer(RunErrorEvent(type=EventType.RUN_ERROR, message="job_posting_determination - No job posting available for determination"))
            return {"error": "No job posting available for determination"}

        job_description = determine_job_posting.invoke({
            "candidate_cv_data" : state["cv_data"].markdown
        })

        if not job_description or len(job_description) == 0:
            writer(RunErrorEvent(type=EventType.RUN_ERROR, message="job_posting_determination - No job posting available for determination"))
            return {"error": "No job posting available for determination"}
        
        # Validate with Pydantic
        state["messages"].append({"type": "success", "content": "Projects screening completed"})
        
        writer(RunFinishedEvent(type=EventType.RUN_FINISHED, thread_id="Job Posting Determination Process", run_id="job_posting_determination", result={"title" : job_description["title"],
                                                                                                                                                        "department" : job_description["department"],
                                                                                                                                                        "experience" : job_description["experience"],
                                                                                                                                                        "description" : job_description["description"],
                                                                                                                                                        "skills" : job_description["skills"],
                                                                                                                                                        "requirements" : job_description["requirements"] }))
        return {"job_description": job_description}
        
    except Exception as e:
        writer(RunErrorEvent(type=EventType.RUN_ERROR, message=f"job_posting_determination - {str(e)}"))
        return {"error": f"Job Posting Determination node failed: {str(e)}"}