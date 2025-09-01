from app.models.graph_state import CVProcessingState
from app.agent_tools.candidate_assessment_tool import candiate_assessment_process
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

def candidate_assessment_score_node(state: CVProcessingState):

    """Node to assess candidate based on CV score and social media score.

    Args:
        state (CVProcessingState): The current state of the CV processing workflow.

    Returns:
        dict: Updated state with candidate final score or error message.
    """
    writer = get_stream_writer()
    writer(RunStartedEvent(type=EventType.RUN_STARTED, thread_id="Candidate's Final Assessment Process", run_id="candidate_assessment"))
    try:
        if state.get("error") or not state.get("cv_score"): 
            writer(RunErrorEvent(type=EventType.RUN_ERROR, message="candidate_assessment - No scoring available for this candidate."))
            return {"error": "No scoring available for this candidate."}
        
        final_score_object = candiate_assessment_process.invoke({
            "candidate_cv_score": state["cv_score"],
            "candidate_social_score": None
        })

        print(final_score_object)

        # return state
        state["messages"].append({"type": "success", "content": f"Final Assessment score successful"})
        writer(RunFinishedEvent(type=EventType.RUN_FINISHED, thread_id="Candidate's Final Assessment Process", run_id="candidate_assessment", result=final_score_object))
        return {"candidate_final_score" : final_score_object}
    
    except Exception as e:
        state["messages"].append({"type": "error", "content": f"Candidate assessment score node failed: {str(e)}"})
        writer(RunErrorEvent(type=EventType.RUN_ERROR, message=f"candidate_assessment - {str(e)}"))
        # return state
        return {"error": f"Candidate assessment score node failed: {str(e)}"}