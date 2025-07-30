from models.graph_state import CVProcessingState
from agent_tools.cv_scoring_tool import score_cv_against_jd

def cv_scoring_node(state: CVProcessingState):
    """Score CV against job description"""
    try:
        
        if state.get("error") or not state.get("cv_data"):
            return {"error": "No CV data available for scoring"}
 
        score_result_object = score_cv_against_jd(state["cv_data"].markdown)

        if "error" in score_result_object:
            state["error"] = score_result_object["error"]
            return state
            
        state["messages"].append({"type": "success", "content": f"CV scored"})
        return {"cv_score": score_result_object}
    except Exception as e:
        return {"error": f"CV scoring failed: {str(e)}"}