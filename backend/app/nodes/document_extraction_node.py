from models.graph_state import CVProcessingState
from agent_tools.document_extraction_tool import convert_pdf_to_markdown_landing_ai

# Graph nodes
def landingai_extraction_node(state: CVProcessingState) -> CVProcessingState:
    """Extract CV data from PDF using LandingAI"""
    try:
        if not state.get("pdf_path"):
            state["error"] = "No PDF path provided"
            return state
        
        # LandingAI extraction method
        
        cv_data_dict = convert_pdf_to_markdown_landing_ai(state["pdf_path"])
        
        if "error" in cv_data_dict:
            state["messages"].append({"type": "warning", "content": "Extraction failed"})
            
        # Validate with Pydantic
        state["cv_data"] = cv_data_dict
        state["messages"].append({"type": "success", "content": "CV extracted successfully with LandingAI"})
        return state
        
    except Exception as e:
        state["error"] = f"LandingAI extraction failed: {str(e)}"
        return state
