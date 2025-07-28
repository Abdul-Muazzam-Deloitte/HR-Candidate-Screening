from models.graph_state import CVProcessingState
from agent_tools.cv_scoring_tool import score_cv_against_jd
from models.score_result import CVScore

def cv_scoring_node(state: CVProcessingState) -> CVProcessingState:
    """Score CV against job description"""
    try:
        
        if state.get("error") or not state.get("cv_data"):
            return state
             
        score_dict = score_cv_against_jd(state["cv_data"].markdown)

        print(type(score_dict))
        
        if "error" in score_dict:
            state["error"] = score_dict["error"]
            return state
            
        # Validate with Pydantic
        state["score"] = CVScore(**score_dict)
        state["messages"].append({"type": "success", "content": f"CV scored"})
        return state
    except Exception as e:
        state["error"] = f"CV scoring failed: {str(e)}"
        return state