from app.models.graph_state import CVProcessingState
from app.agent_tools.candidate_report_tool import generate_candidate_report

def send_report_node(state: CVProcessingState):
    """Node to generate candidate report based on CV data and final score.

    Args:
        state (CVProcessingState): The current state of the CV processing workflow.

    Returns:
        dict: Updated state with candidate report or error message.
    """
    try:
        if state.get("error") or (not state.get("candidate_final_score") and not state.get("cv_data")):
            return {"error": "No candidate final score available for report generation."}

        candidate_report = generate_candidate_report.invoke({
            # "candidate_cv_data": state["cv_data"].markdown,
            "candidate_cv_data": state["cv_data"]["markdown"],
            "candidate_final_score": state["candidate_final_score"]
        })

        print(candidate_report)
        
        state["messages"].append({"type": "success", "content": "Report generated - candidate assessment complete"})
        # return {"cv_score": score_result_object}
    except Exception as e:
        return {"error": f"Rejection report generation failed: {str(e)}"}