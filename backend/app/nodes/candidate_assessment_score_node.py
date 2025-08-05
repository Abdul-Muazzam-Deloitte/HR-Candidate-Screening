from models.graph_state import CVProcessingState
from agent_tools.candidate_assessment_tool import candiate_assessment_process

def candidate_assessment_score_node(state: CVProcessingState):

    """Node to assess candidate based on CV score and social media score.

    Args:
        state (CVProcessingState): The current state of the CV processing workflow.

    Returns:
        dict: Updated state with candidate final score or error message.
    """
    try:
            if state.get("error") or not state.get("cv_score"): 
                # return state
                return {"error": "No scoring available for this candidate."}
            
            final_score_object = candiate_assessment_process.invoke({
                "candidate_cv_score": state["cv_score"],
                "candidate_social_score": None
            })

            # return state
            state["messages"].append({"type": "success", "content": f"Final Assessment score successful"})
            return {"candidate_final_score" : final_score_object}
    except Exception as e:
        state["messages"].append({"type": "error", "content": f"Candidate assessment score node failed: {str(e)}"})
        # return state
        return {"error": f"Candidate assessment score node failed: {str(e)}"}