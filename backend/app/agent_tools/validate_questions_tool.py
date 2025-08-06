from models.interview_questions import InterviewQAs
from typing import List
import numpy as np
from llm_handler.embedder import get_embeddings
from langchain.tools import tool
from langchain.text_splitter import RecursiveCharacterTextSplitter
from llm_handler.embedder import GeminiEmbedder

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

    def chunk_documents(cv_markdown: str, jd_markdown: str, chunk_size=500, chunk_overlap=100):
        """ Splits the CV and job description into manageable chunks using LangChain.

        Args:
            cv_markdown (str): The markdown content of the CV.
            jd_markdown (str): The job description text.
            chunk_size (int): Size of each chunk.
            chunk_overlap (int): Overlap between chunks.

        Returns:
            Tuple[List[str], List[str]]: Lists of CV and JD chunks.
        """

        splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        cv_chunks = splitter.split_text(cv_markdown)
        jd_chunks = splitter.split_text(jd_markdown)
        return cv_chunks, jd_chunks

    embedder = GeminiEmbedder()

    # Split CV and JD into chunks
    cv_chunks, jd_chunks = chunk_documents(candidate_cv_content, job_description)

    # Get embeddings for CV and JD chunks       
    cv_chunk_embeddings = embedder.embed_batch(cv_chunks)
    jd_chunk_embeddings = embedder.embed_batch(jd_chunks)
    
    hallucinated_questions = []

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

    for qa in all_questions:
        q_embedding = np.array(embedder.embed(qa)).reshape(1, -1)
        # question_embedding = [get_embeddings(chunk) for chunk in qa_chunks]
        sim_cv = np.max(cosine_similarity(q_embedding, np.array(cv_chunk_embeddings)))
        sim_jd = np.max(cosine_similarity(q_embedding, np.array(jd_chunk_embeddings)))

        # Mark as hallucinated if low similarity to both CV and JD
        if sim_cv < threshold and sim_jd < threshold:
            hallucinated_questions.append({
                "question": qa,
                "similarity_cv": round(sim_cv, 2),
                "similarity_jd": round(sim_jd, 2)
            })

    return hallucinated_questions