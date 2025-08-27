from app.models.graph_state import CVProcessingState
from app.agent_tools.document_extraction_tool import convert_pdf_to_markdown_landing_ai
from ag_ui.core import (
    RunStartedEvent,
    RunFinishedEvent,
    RunErrorEvent,
    EventType
)

from langgraph.config import get_stream_writer

# Graph nodes
def landingai_extraction_node(state: CVProcessingState):
    """Node to extract CV data from PDF using LandingAI.

    Args:
        state (CVProcessingState): The current state of the CV processing workflow.

    Returns:
        dict: Updated state with extracted CV data or error message.
    """
    writer = get_stream_writer()
    writer(RunStartedEvent(type=EventType.RUN_STARTED, thread_id="Document Extraction Process", run_id="document_extraction"))

    try:
        if not state.get("pdf_path"):
            writer(RunErrorEvent(type=EventType.RUN_ERROR, message="document_extraction -No PDF path provided"))
            return {"error": "No PDF path provided"}

        # LandingAI extraction method
        
        cv_data_object = convert_pdf_to_markdown_landing_ai.invoke({
            "pdf_path" : state["pdf_path"]
        })
                 
        state["messages"].append({"type": "success", "content": "CV extracted successfully with LandingAI"})

        writer(RunFinishedEvent(type=EventType.RUN_FINISHED, thread_id="Document Extraction Process", run_id="document_extraction", result=cv_data_object))
        return {"cv_data": cv_data_object}

    except Exception as e:
        writer(RunErrorEvent(type=EventType.RUN_ERROR, message=f"document_extraction - {str(e)}"))
        return {"error": f"LandingAI extraction failed: {str(e)}"}
