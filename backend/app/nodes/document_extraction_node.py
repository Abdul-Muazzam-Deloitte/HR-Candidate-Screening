from models.graph_state import CVProcessingState
from agent_tools.document_extraction_tool import convert_pdf_to_markdown_landing_ai

# Graph nodes
def landingai_extraction_node(state: CVProcessingState):
    """Extract CV data from PDF using LandingAI"""
    try:
        if not state.get("pdf_path"):
            return {"error": "No PDF path provided"}
        
        # LandingAI extraction method
        
        cv_data_object = convert_pdf_to_markdown_landing_ai(state["pdf_path"])
        
        if "error" in cv_data_object:
            state["messages"].append({"type": "warning", "content": "Extraction failed"})
            
        state["messages"].append({"type": "success", "content": "CV extracted successfully with LandingAI"})
        return {"cv_data": cv_data_object}
        
    except Exception as e:
        return {"error": f"LandingAI extraction failed: {str(e)}"}
