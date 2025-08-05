from models.interview_questions import InterviewQAs
from typing import List
import numpy as np
from llm_handler.embedder import get_embeddings
from langchain.tools import tool

@tool
def validate_questions_semantically(interview_questions: InterviewQAs, candidate_cv_content: str, job_description: str, threshold: float = 0.5) -> List[dict]:
    """
    Validates the generated interview questions against the candidate's CV and job description.

    Args:
        interview_questions (InterviewQAs): The generated interview questions.
        candidate_cv_content (str): The markdown representation of the candidate's CV.
        job_description (str): The job description text.
        threshold (float): Similarity threshold to consider a question valid.

    Returns:
        List[dict]: List of invalid questions with their similarity scores.
    """
    cv_embedding = get_embeddings(candidate_cv_content)
    jd_embedding = get_embeddings(job_description)

    hallucinated_questions = []

    def cosine_similarity(vec1, vec2):
        """Calculate cosine similarity between two vectors."""
        vec1 = np.array(vec1)
        vec2 = np.array(vec2)
        return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

    all_questions = (
        interview_questions.technical_questions
        + interview_questions.behavioral_questions
        + interview_questions.experience_questions
        + interview_questions.situational_questions
        + interview_questions.cultural_fit_questions
    )

    for qa in all_questions:
        question_embedding = get_embeddings(qa)
        sim_cv = cosine_similarity(question_embedding, cv_embedding)
        sim_jd = cosine_similarity(question_embedding, jd_embedding)

        # Mark as hallucinated if low similarity to both CV and JD
        if sim_cv < threshold and sim_jd < threshold:
            hallucinated_questions.append({
                "question": qa,
                "similarity_cv": round(sim_cv, 2),
                "similarity_jd": round(sim_jd, 2)
            })

    return hallucinated_questions