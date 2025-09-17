from app.models.interview_questions import InterviewQAs
from typing import List, Optional
import numpy as np
from app.llm_handler.embedder import get_embeddings
from langchain.tools import tool
from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.llm_handler.embedder import OpenAIEmbedder

from ag_ui.core import (
    RunStartedEvent,
    RunFinishedEvent,
    RunErrorEvent,
    StepStartedEvent,
    StepFinishedEvent,
    TextMessageContentEvent,
    EventType
)


from langgraph.config import get_stream_writer
from app.models.job_description import JobDescription
import json

embedder = OpenAIEmbedder()

@tool
def validate_questions_semantically(interview_questions: InterviewQAs, candidate_cv_content: str, job_description: JobDescription, threshold: float = 0.5) -> List[dict]:
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
    writer = get_stream_writer()
    writer(StepStartedEvent(type=EventType.STEP_STARTED, step_name="2 - question_generation - Embedding cv and job description"))  
    # Split CV and JD into chunks
    cv_chunks = embedder.chunk_document(candidate_cv_content)

    # Get embeddings for CV and JD chunks       
    cv_chunk_embeddings = embedder.embed_text(cv_chunks)
    
    hallucinated_questions = []

    writer(StepFinishedEvent(type=EventType.STEP_FINISHED, step_name="2 - question_generation - Embedding cv and job description completed"))  

    def cosine_similarity(vec, mat):
        """
        vec: shape (1, D)
        mat: shape (N, D)
        returns: (N,) cosine similarity between vec and each row in mat
        """
        vec_norm = vec / np.linalg.norm(vec)
        mat_norm = mat / np.linalg.norm(mat, axis=1, keepdims=True)
        return np.dot(mat_norm, vec_norm.T).flatten()

    all_questions = (
        interview_questions.technical_questions
        + interview_questions.behavioral_questions
        + interview_questions.experience_questions
        + interview_questions.situational_questions
        + interview_questions.cultural_fit_questions
    )
    
    writer(StepStartedEvent(type=EventType.STEP_STARTED, step_name="3 - question_generation - performing Cosine similarity check on questions"))  
    q_embedding = np.array(embedder.embed_text(all_questions)).reshape(1, -1)

    jd_vecs = json.loads(job_description.job_postings_vector) if job_description.job_postings_vector is not None else None

    for qa in all_questions:
        
        # question_embedding = [get_embeddings(chunk) for chunk in qa_chunks]
        sim_cv = np.max(cosine_similarity(q_embedding, np.array(cv_chunk_embeddings).reshape(1, -1)))
        sim_jd = np.max(cosine_similarity(q_embedding, np.array(jd_vecs).reshape(1, -1)))

        # Mark as hallucinated if low similarity to both CV and JD
        if sim_cv < threshold and sim_jd < threshold:
            hallucinated_questions.append({
                "question": qa,
                "similarity_cv": round(sim_cv, 2),
                "similarity_jd": round(sim_jd, 2)
            })
    
    writer(StepFinishedEvent(type=EventType.STEP_FINISHED, step_name="3 - question_generation - Cosine similarity check on questions completed"))  

    return hallucinated_questions