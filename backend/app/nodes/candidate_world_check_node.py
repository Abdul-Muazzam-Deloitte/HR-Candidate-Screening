from app.models.graph_state import CVProcessingState
from app.agent_tools.candidate_world_check_tool import candidate_world_check
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

def world_check_node(state: CVProcessingState):
    """Node to generate candidate report based on CV data and final score.

    Args:
        state (CVProcessingState): The current state of the CV processing workflow.

    Returns:
        dict: Updated state with candidate report or error message.
    """
    writer = get_stream_writer()
    writer(RunStartedEvent(type=EventType.RUN_STARTED, thread_id="World Check Process", run_id="world_check"))
    try:
        if state.get("error") or  not state.get("cv_data"):
            writer(RunErrorEvent(type=EventType.RUN_ERROR, message="world_check - No candidate info availabe for check."))
            return {"error": "No candidate info availabe for check."}

        candidate_world_check_info = candidate_world_check.invoke({
            # "candidate_cv_data": state["cv_data"].markdown,
            "candidate_cv_data": state["cv_data"]
        })


        if not candidate_world_check_info:
            writer(RunFinishedEvent(type=EventType.RUN_FINISHED, thread_id="World Check Process", run_id="world_check", result = { "note" : "No Info available in world check database"}))
            return {"project_info": None}
        
        # Check if the result contains an error
        if "error" in candidate_world_check_info:
            writer( RunErrorEvent(type=EventType.RUN_ERROR, message=f"project_contribution - {candidate_world_check_info["error"]}") ) 
            return {"error": f"{candidate_world_check_info["error"]}"}
        
        state["messages"].append({"type": "success", "content": "World Check Process - candidate world check complete"})
        writer(RunFinishedEvent(type=EventType.RUN_FINISHED, thread_id="World Check Process", run_id="world_check", result=candidate_world_check_info))
        return {"world_check": candidate_world_check_info}
    except Exception as e:
        writer(RunErrorEvent(type=EventType.RUN_ERROR, message=f"world_check - {str(e)}"))
        return {"error": f"World check process failed: {str(e)}"}