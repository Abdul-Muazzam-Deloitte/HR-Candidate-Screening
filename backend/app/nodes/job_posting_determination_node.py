from app.models.graph_state import CVProcessingState
from app.models.job_description import JobDescription
from app.agent_tools.determine_job_posting import determine_job_posting
from app.agent_tools.cv_scoring_tool import score_cv_against_jd
from ag_ui.core import (
    RunStartedEvent,
    RunFinishedEvent,
    RunErrorEvent,
    EventType
)

from langgraph.config import get_stream_writer
from typing import List
from app.models.score_result import JobPostings

def job_posting_determination_node(state: CVProcessingState):

    writer = get_stream_writer()
    writer(RunStartedEvent(type=EventType.RUN_STARTED, thread_id="Job Posting Determination Process", run_id="job_posting_determination"))

    # Retrieve job posting from database or predefined list
    try:
        if state.get("error") or not state.get("candidate_cv_data"):
        
            # return state'
            writer(RunErrorEvent(type=EventType.RUN_ERROR, message="job_posting_determination - No job posting available for determination"))
            return {"error": "No job posting available for determination"}

        job_descriptions = determine_job_posting.invoke({
            "candidate_cv_data" : state["candidate_cv_data"].markdown
        })
        
        if not job_descriptions or job_descriptions is None:
            writer(RunFinishedEvent(type=EventType.RUN_FINISHED, thread_id="Job Posting Determination Process", run_id="job_posting_determination", result={"note" : "No job posting available for candidate" }))
            return {"error": "No job posting available for determination"}
        
        job_postings : List[JobPostings] = []
        
        for job_description in job_descriptions:
            
            score_result_object = score_cv_against_jd.invoke({
                "cv_data" : state["candidate_cv_data"].markdown,
                "job_description" : job_description["job_description"]
            })

            job_postings.append( 
                JobPostings(
                    job_posting= job_description["job_description"], 
                    job_posting_score=score_result_object
                )
            )

        # Validate with Pydantic
        state["messages"].append({"type": "success", "content": "Projects screening completed"})
        
        writer(RunFinishedEvent(type=EventType.RUN_FINISHED, thread_id="Job Posting Determination Process", run_id="job_posting_determination", result=job_postings))
        return {"job_postings_matched": job_postings}
        
    except Exception as e:
        writer(RunErrorEvent(type=EventType.RUN_ERROR, message=f"job_posting_determination - {str(e)}"))
        return {"error": f"Job Posting Determination node failed: {str(e)}"}