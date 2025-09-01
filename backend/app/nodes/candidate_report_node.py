from app.models.graph_state import CVProcessingState
from app.agent_tools.candidate_report_tool import generate_candidate_report
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

def send_report_node(state: CVProcessingState):
    """Node to generate candidate report based on CV data and final score.

    Args:
        state (CVProcessingState): The current state of the CV processing workflow.

    Returns:
        dict: Updated state with candidate report or error message.
    """
    writer = get_stream_writer()
    writer(RunStartedEvent(type=EventType.RUN_STARTED, thread_id="Report Generation Process", run_id="report_generation"))
    try:
        if state.get("error") or (not state.get("candidate_final_score") and not state.get("cv_data")):
            writer(RunErrorEvent(type=EventType.RUN_ERROR, message="report_generation - No candidate final score available for report generation."))
            return {"error": "No candidate final score available for report generation."}

        candidate_report = generate_candidate_report.invoke({
            # "candidate_cv_data": state["cv_data"].markdown,
            "candidate_cv_data": state["cv_data"].markdown,
            "candidate_final_score": state["candidate_final_score"]
        })

        print(candidate_report)
        
        state["messages"].append({"type": "success", "content": "Report generated - candidate assessment complete"})
        writer(RunFinishedEvent(type=EventType.RUN_FINISHED, thread_id="Report Generation Process", run_id="report_generation", result=candidate_report))
        # return {"cv_score": score_result_object}
    except Exception as e:
        writer(RunErrorEvent(type=EventType.RUN_ERROR, message=f"report_generation - {str(e)}"))
        return {"error": f"Rejection report generation failed: {str(e)}"}