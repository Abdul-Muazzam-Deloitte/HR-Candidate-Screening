from models.graph_state import CVProcessingState
from agent_tools.social_media_screening_tool import get_social_media_presence
from models.social_media_score import SocialMediaScore

def social_media_screening_node(state: CVProcessingState):
    """Node to screen candidate's social media presence.

    Args:
        state (CVProcessingState): The current state of the CV processing workflow.

    Returns:
        dict: Updated state with social media score or error message.
    """
    try:
        if state.get("error") or not state.get("cv_data").linkedin_url:
            # return state            
            return state["messages"].append({"type": "success", "content": "No LinkedIn URL available for screening"})

        social_score_dict = get_social_media_presence.invoke({
            "social_url" : state["cv_data"].linkedin_url
        })

        if not social_score_dict:
            return {"social_media_score": None}
        
        # Check if the result contains an error
        if "error" in social_score_dict:
            return {"error": "Error in social media screening process"}
        
        # Validate with Pydantic
        state["messages"].append({"type": "success", "content": "Social media screening completed"})
            
        return {"social_media_score": social_score_dict}
        
    except Exception as e:
        state["messages"].append({"type": "error", "content": f"Social media screening node failed: {str(e)}"})
        print(f"❌ Social media screening node failed: {str(e)}")
        return {"error": f"Social media screening node failed: {str(e)}"}