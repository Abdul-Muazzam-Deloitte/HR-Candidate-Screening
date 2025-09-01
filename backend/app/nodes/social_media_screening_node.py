from app.models.graph_state import CVProcessingState
from app.agent_tools.social_media_screening_tool import get_social_media_presence
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

def social_media_screening_node(state: CVProcessingState):
    """Node to screen candidate's social media presence.

    Args:
        state (CVProcessingState): The current state of the CV processing workflow.

    Returns:
        dict: Updated state with social media score or error message.
    """

    writer = get_stream_writer()
    writer(RunStartedEvent(type=EventType.RUN_STARTED, thread_id="Social Media Screening Process", run_id="social_media_screening"))

    try:
        if state.get("error") or not state.get("cv_data").linkedin_url:
        # if state.get("error") or not state.get("cv_data")["linkedin_url"]:
            # return state
            writer(RunFinishedEvent(type=EventType.RUN_FINISHED, thread_id="Social Media Screening Process", run_id="social_media_screening"))
            return state["messages"].append({"type": "warning", "content": "No LinkedIn URL available for screening"})

        social_score_dict = get_social_media_presence.invoke({
            "social_url" : state["cv_data"].linkedin_url
            # "social_url" : state["cv_data"]["linkedin_url"]
        })

        if not social_score_dict:
            writer(RunFinishedEvent(type=EventType.RUN_FINISHED, thread_id="Social Media Screening Process", run_id="social_media_screening"))
            return {"social_media_score": None}
        
        # Check if the result contains an error
        if "error" in social_score_dict:
            writer( RunErrorEvent(type=EventType.RUN_ERROR, message="social_media_screening - Error in social media screening process") ) 
            return {"error": "Error in social media screening process"}
        
        # Validate with Pydantic
        state["messages"].append({"type": "success", "content": "Social media screening completed"})
        
        writer(RunFinishedEvent(type=EventType.RUN_FINISHED, thread_id="Social Media Screening Process", run_id="social_media_screening", result=social_score_dict))
        return {"social_media_score": social_score_dict}
        
    except Exception as e:
        writer(RunErrorEvent(type=EventType.RUN_ERROR, message=f"social_media_screening - {str(e)}"))
        return {"error": f"Social media screening node failed: {str(e)}"}