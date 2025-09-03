from app.models.interview_questions import InterviewQAs
from typing import List
import numpy as np
from app.llm_handler.embedder import get_embeddings
from langchain.tools import tool
from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.llm_handler.embedder import GeminiEmbedder

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

    def chunk_documents(document: str, chunk_size=2000, chunk_overlap=200):
        """ Splits the document into manageable chunks using LangChain.

        Args:
            docuemnt (str): Document to be chunked.
            chunk_size (int): Size of each chunk.
            chunk_overlap (int): Overlap between chunks.

        Returns:
            Tuple[List[str], List[str]]: Lists of CV and JD chunks.
        """

        splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        document_chunks = splitter.split_text(document)
        return document_chunks

    embedder = GeminiEmbedder()
    writer(StepStartedEvent(type=EventType.STEP_STARTED, step_name="2 - question_generation - Embedding cv and job description"))  
    # Split CV and JD into chunks
    cv_chunks = chunk_documents(candidate_cv_content)
    jd_chunks = chunk_documents(json.dumps(job_description.model_dump(), indent=2))

    # Get embeddings for CV and JD chunks       
    cv_chunk_embeddings = embedder.embed_batch(cv_chunks)
    jd_chunk_embeddings = embedder.embed_batch(jd_chunks)
    
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

    for qa in all_questions:
        q_embedding = np.array(embedder.embed(qa)).reshape(1, -1)
        # question_embedding = [get_embeddings(chunk) for chunk in qa_chunks]
        sim_cv = np.max(cosine_similarity(q_embedding, np.array(cv_chunk_embeddings)))
        sim_jd = np.max(cosine_similarity(q_embedding, np.array(jd_chunk_embeddings)))

        print(sim_cv, sim_jd)

        # Mark as hallucinated if low similarity to both CV and JD
        if sim_cv < threshold and sim_jd < threshold:
            hallucinated_questions.append({
                "question": qa,
                "similarity_cv": round(sim_cv, 2),
                "similarity_jd": round(sim_jd, 2)
            })
    
    writer(StepFinishedEvent(type=EventType.STEP_FINISHED, step_name="3 - question_generation - Cosine similarity check on questions completed"))  

    return hallucinated_questions