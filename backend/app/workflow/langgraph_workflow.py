from models.graph_state import CVProcessingState
from nodes.document_extraction_node import landingai_extraction_node
from nodes.cv_scoring_node import cv_scoring_node
from nodes.error_handler_node import error_handler_node
from nodes.social_media_screening_node import social_media_screening_node
from nodes.candidate_assessment_score_node import candidate_assessment_score_node
from langgraph.graph import StateGraph, END

def create_cv_scoring_workflow():
    """Create the LangGraph workflow with LandingAI integration"""
    
    # Initialize the graph
    workflow = StateGraph(CVProcessingState)
    
    # Add nodes
    workflow.add_node("landingai_extraction", landingai_extraction_node)
    workflow.add_node("cv_scoring", cv_scoring_node)
    workflow.add_node("social_media_screening", social_media_screening_node)
    workflow.add_node("candidate_assessment_score", candidate_assessment_score_node)
    workflow.add_node("error_handler", error_handler_node)
    
    # Define the flow
    workflow.set_entry_point("landingai_extraction")

        # After extraction, conditionally go to both scoring nodes in parallel
    def route_after_extraction(state):
        if state.get("error"):
            return "error_handler"
        # This will trigger both nodes to run in parallel
        return ["cv_scoring", "social_media_screening"]
    
    # # Add conditional edges
    workflow.add_conditional_edges(
        "landingai_extraction",
        route_after_extraction
    )

    workflow.add_conditional_edges(
        "cv_scoring",
        lambda state: "error_handler" if state.get("error") else "candidate_assessment_score"
    )

    workflow.add_conditional_edges(
        "social_media_screening",
        lambda state: "error_handler" if state.get("error") else "candidate_assessment_score"
    )

        # Merging node waits for both inputs then proceeds
    workflow.add_conditional_edges(
        "candidate_assessment_score",
        lambda state: "error_handler" if state.get("error") else END
    )

    # workflow.add_conditional_edges(
    #     "landingai_extraction",
    #     lambda state: "error_handler" if state.get("error") else "cv_scoring"
    # )

    # workflow.add_conditional_edges(
    #     "cv_scoring",
    #     lambda state: "error_handler" if state.get("error") else END
    # )
    
    
    workflow.add_edge("error_handler", END)
    
    return workflow.compile()