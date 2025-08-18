from app.models.graph_state import CVProcessingState
from app.agent_tools.document_extraction_tool import convert_pdf_to_markdown_landing_ai
from ag_ui.core import StepStartedEvent, StepFinishedEvent, TextMessageContentEvent, EventType

# Graph nodes
def landingai_extraction_node(state: CVProcessingState):
    """Node to extract CV data from PDF using LandingAI.

    Args:
        state (CVProcessingState): The current state of the CV processing workflow.

    Returns:
        dict: Updated state with extracted CV data or error message.
    """

    # Emit "step started"
    yield StepStartedEvent(type=EventType.STEP_STARTED, step="cv_scoring")

    try:
        if not state.get("pdf_path"):
            return {"error": "No PDF path provided"}
        
        # LandingAI extraction method
        
        cv_data_object = convert_pdf_to_markdown_landing_ai.invoke({
            "pdf_path" : state["pdf_path"]
        })

        yield TextMessageContentEvent(
            type=EventType.TEXT_MESSAGE_CONTENT,
            delta=f"Scored CV successfully: {cv_data_object}"
        )
        
        if "error" in cv_data_object:
            state["messages"].append({"type": "warning", "content": "Extraction failed"})
            
        state["messages"].append({"type": "success", "content": "CV extracted successfully with LandingAI"})

        yield StepFinishedEvent(type=EventType.STEP_FINISHED, step="cv_scoring", output=cv_data_object)

        return {"cv_data": cv_data_object}
        
    except Exception as e:
        yield TextMessageContentEvent(
            type=EventType.TEXT_MESSAGE_CONTENT,
            delta=f"Error scoring CV: {str(e)}"
        )
        return {"error": f"LandingAI extraction failed: {str(e)}"}
