from models.graph_state import CVProcessingState
from agent_tools.cv_scoring_tool import score_cv_against_jd

def cv_scoring_node(state: CVProcessingState):
    """Node to score CV against job description.

    Args:
        state (CVProcessingState): The current state of the CV processing workflow.

    Returns:
        dict: Updated state with CV score or error message.
    """

    try:
        
        if state.get("error") or (not state.get("cv_data") and not state.get("job_description")):
            return {"error": "No CV data available for scoring"}
 
        score_result_object = score_cv_against_jd.invoke({
            "cv_data" : state["cv_data"].markdown,
            "job_description" : state["job_description"]
        })

        if "error" in score_result_object:
            state["error"] = score_result_object["error"]
            return state
            
        state["messages"].append({"type": "success", "content": f"CV scored"})
        return {"cv_score": score_result_object}
    except Exception as e:
        return {"error": f"CV scoring failed: {str(e)}"}