from app.models.graph_state import CVProcessingState
from app.models.graph_state import CVProcessingState
from app.models.candidate_info import Candidate
from app.models.interview_questions import InterviewQAs
from app.models.score_result import CVScore, ScoreDetail
from app.models.candidate_assessment import CandidateFinalScore

from app.nodes.document_extraction_node import landingai_extraction_node
from app.nodes.cv_scoring_node import cv_scoring_node
from app.nodes.error_handler_node import error_handler_node
from app.nodes.social_media_screening_node import social_media_screening_node
from app.nodes.candidate_assessment_score_node import candidate_assessment_score_node
from app.nodes.interview_questions_node import interview_questions_node
from app.nodes.candidate_report_node import send_report_node as candidate_report_node
from langgraph.graph import StateGraph, END

import json

def create_cv_scoring_workflow():
    """Create the CV scoring workflow graph.

    Returns:
        StateGraph: The compiled workflow graph for CV processing.
    """
    
    # Initialize the graph
    workflow = StateGraph(CVProcessingState)
    
    # Add nodes
    workflow.add_node("landingai_extraction", landingai_extraction_node)
    workflow.add_node("cv_scoring", cv_scoring_node)
    workflow.add_node("social_media_screening", social_media_screening_node)
    workflow.add_node("candidate_assessment_score", candidate_assessment_score_node)
    workflow.add_node("interview_questions", interview_questions_node)
    workflow.add_node("send_candidate_report", candidate_report_node)
    workflow.add_node("error_handler", error_handler_node)
    
    # Define the flow
    workflow.set_entry_point("landingai_extraction")

        # After extraction, conditionally go to both scoring nodes in parallel
    def route_after_extraction(state):
        if state.get("error"):
            return "error_handler"
        # This will trigger both nodes to run in parallel
        return ["cv_scoring", "social_media_screening"]
    
            # Critical routing after score merging
    def route_after_scoring(state):
        if state.get("error"):
            return "error_handler"
        
        final_score = state.get("candidate_final_score")
        if final_score and final_score["proceed_to_interview"] == "Yes":
            return "interview_questions"
        else:
             return END
        
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

    workflow.add_conditional_edges(
        "candidate_assessment_score",
        lambda state: "error_handler" if state.get("error") else "send_candidate_report"
    )
        
    workflow.add_conditional_edges(
        "send_candidate_report",
        route_after_scoring
    )

    workflow.add_conditional_edges(
        "interview_questions",
        lambda state: "error_handler" if state.get("error") else END
    )

    workflow.add_edge("error_handler", END)
    
    return workflow.compile()

async def hr_screening_workflow(pdf_path: str, session=None):

    # pdf_path = "app/knowledge_base/pdf_templates/ABDUL Muhammad Muazzam_Ul_Hussein CV.pdf"
    job_description = open("app/knowledge_base/scoring_process/job_description.txt").read()

    workflow_graph = create_cv_scoring_workflow()

    initial_state = CVProcessingState(
        pdf_path=pdf_path,
        job_description=job_description,
        cv_data=Candidate(
            name="",
            email="test@test.com",
            summary="",
            skills=[],
            experience=[],
            education=[],
            social_links=[],
            markdown=""
        ),
        cv_score=CVScore(
            technical_skills=ScoreDetail(score=1, notes=""),
            experience_relevance=ScoreDetail(score=1, notes=""),
            years_experience=ScoreDetail(score=1, notes=""),
            project_fit=ScoreDetail(score=1, notes=""),
            soft_skills=ScoreDetail(score=1, notes=""),
            education_certifications=ScoreDetail(score=1, notes=""),
            communication=ScoreDetail(score=1, notes=""),
            overall_recommendation="Moderate Fit"
        ),
        social_media_score=None,
        candidate_final_score=CandidateFinalScore(
            cv_assessment=CVScore(
                technical_skills=ScoreDetail(score=1, notes=""),
                experience_relevance=ScoreDetail(score=1, notes=""),
                years_experience=ScoreDetail(score=1, notes=""),
                project_fit=ScoreDetail(score=1, notes=""),
                soft_skills=ScoreDetail(score=1, notes=""),
                education_certifications=ScoreDetail(score=1, notes=""),
                communication=ScoreDetail(score=1, notes=""),
                overall_recommendation="Moderate Fit"
            ),
            social_media_assessment=None,
            final_recommendation="",
            proceed_to_interview="No"
        ),
        interview_questions=InterviewQAs(
            technical_questions=[],
            behavioral_questions=[],
            experience_questions=[],
            situational_questions=[],
            cultural_fit_questions=[],
            areas_to_probe=[],
            red_flag_questions=[],
            interview_duration=""
        ),
        messages=[],
        error=""
    )

    try:
        # Stream workflow node updates
        async for chunk in workflow_graph.stream(
            initial_state,
            stream_mode="updates",
            session=session  # Pass AG-UI session to nodes
        ):
            # Convert to dict for JSON
            if hasattr(chunk, "model_dump"):
                chunk_dict = chunk.model_dump()
            else:
                chunk_dict = dict(chunk)
            
            # Send node update to frontend
            if session:
                await session.send({
                    "type": "workflow_update",
                    "data": chunk_dict
                })
            
            # Yield for any server-side generators (if needed)
            yield chunk_dict

        # Final completion event
        if session:
            await session.send({
                "type": "workflow_status",
                "status": "completed",
                "final_state": initial_state if hasattr(initial_state, "model_dump") else dict(initial_state)
            })

    except Exception as e:
        if session:
            await session.send({
                "type": "workflow_status",
                "status": "error",
                "error": str(e)
            })
        print(f"❌ Workflow execution failed: {str(e)}")