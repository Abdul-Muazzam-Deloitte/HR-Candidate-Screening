from app.models.graph_state import CVProcessingState
from app.agent_tools.cv_scoring_tool import score_cv_against_jd
from langgraph.config import get_stream_writer
from ag_ui.core import (
    RunStartedEvent,
    RunFinishedEvent,
    RunErrorEvent,
    StepStartedEvent,
    StepFinishedEvent,
    TextMessageContentEvent,
    EventType
)

def cv_scoring_node(state: CVProcessingState):
    """Node to score CV against job description.

    Args:
        state (CVProcessingState): The current state of the CV processing workflow.

    Returns:
        dict: Updated state with CV score or error message.
    """
    writer = get_stream_writer()
    writer(RunStartedEvent(type=EventType.RUN_STARTED, thread_id="thread3", run_id="run3"))
    try:
        if state.get("error") or (not state.get("cv_data") or not state.get("job_description")):
            writer(RunErrorEvent(type=EventType.RUN_ERROR, message="No CV data available for scoring"))
            return {"error": "No CV data available for scoring"}

        # Call the async scoring tool with streaming
        score_result_object = score_cv_against_jd.invoke({
            "cv_data" : state["cv_data"].markdown,
            "job_description" : state["job_description"]
        })

        # Append success message
        state["messages"].append({"type": "success", "content": "CV scored"})
        writer(RunFinishedEvent(type=EventType.RUN_FINISHED, thread_id="thread3", run_id="run3", result=score_result_object))
        return {"cv_score": score_result_object}

    except Exception as e:
        writer(RunErrorEvent(type=EventType.RUN_ERROR, message=str(e)))
        return {"error": f"CV scoring failed: {str(e)}"}