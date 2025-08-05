from dotenv import load_dotenv
import os, asyncio
from llm_handler.llm_handler import ChatCompletionHandler
from workflow.langgraph_workflow import create_cv_scoring_workflow
from models.graph_state import CVProcessingState
from models.candidate_info import Candidate
from models.interview_questions import InterviewQAs
from models.score_result import CVScore, ScoreDetail
from models.candidate_assessment import CandidateFinalScore

load_dotenv(override=True)

def run_cv_scoring_example():

    pdf_path = "app/knowledge_base/pdf_templates/ABDUL Muhammad Muazzam_Ul_Hussein CV.pdf"
    job_description = open("app/knowledge_base/scoring_process/job_description.txt").read()

    workflow = create_cv_scoring_workflow()

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
        result = workflow.invoke(initial_state)
        print(result)

        # for chunk in workflow.stream(
        #         initial_state,
        #         stream_mode="updates"
        # ):
        #     print(chunk)
        #     print("\n")

            # display(Image(workflow.get_graph().draw_mermaid_png()))

    except Exception as e:
        print(f"❌ Workflow execution failed: {str(e)}")

async def main():

    google_api_key = os.environ.get("GOOGLE_API_KEY")
    landing_ai_api_key = os.environ.get("VISION_AGENT_API_KEY")
    if not google_api_key:
        raise ValueError("Missing GOOGLE_API_KEY environment variable")
    elif not landing_ai_api_key:
        raise ValueError("Missing LANDING_AI_API_KEY environment variable")
    else:
        run_cv_scoring_example()

if __name__ == "__main__":
    asyncio.run(main())
