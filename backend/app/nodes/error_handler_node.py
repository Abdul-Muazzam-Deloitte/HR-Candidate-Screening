from models.graph_state import CVProcessingState

def error_handler_node(state: CVProcessingState) -> CVProcessingState:
    """Handle errors"""
    state["messages"].append({"type": "error", "content": state["error"]})
    return state