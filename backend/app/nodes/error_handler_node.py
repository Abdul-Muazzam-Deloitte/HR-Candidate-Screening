from models.graph_state import CVProcessingState

def error_handler_node(state: CVProcessingState) -> CVProcessingState:
    """Node to handle errors in the CV processing workflow.

    Args:
        state (CVProcessingState): The current state of the CV processing workflow.

    Returns:
        CVProcessingState: Updated state with error messages if any.
    """
    state["messages"].append({"type": "error", "content": state["error"]})
    return state