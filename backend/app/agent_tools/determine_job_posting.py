
from typing import List
from langchain_text_splitters import CharacterTextSplitter
import numpy as np
from app.llm_handler.embedder import get_embeddings
from langchain.tools import tool
from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.llm_handler.embedder import GeminiEmbedder
from app.database.db import get_job_postings
from fastapi import HTTPException

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
from datetime import datetime

from google import genai
from google.genai import types
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

import ast
from openai import AzureOpenAI
from app.llm_handler.embedder import OpenAIEmbedder

openAI_embedder = OpenAIEmbedder()

@tool
def determine_job_posting(candidate_cv_data: str,  threshold: float = 0.4):
    """
    Determines the most relevant job posting for a candidate based on their CV data.
    """
    writer = get_stream_writer()
   
    writer(StepStartedEvent(type=EventType.STEP_STARTED, step_name="1 - job_posting_determination - Retrieving Job Postings"))  

    job_postings = get_all_job_postings()

    writer(StepFinishedEvent(type=EventType.STEP_FINISHED, step_name="1 - job_posting_determination - Job Postings retrieved successfully"))  


    writer(StepStartedEvent(type=EventType.STEP_STARTED, step_name="2 - job_posting_determination - Embedding CV"))  

    cv_chunks = openAI_embedder.chunk_document(candidate_cv_data)
    cv_embeddings = openAI_embedder.embed_text(cv_chunks)

    writer(StepFinishedEvent(type=EventType.STEP_FINISHED, step_name="2 - job_posting_determination - CV embedding completed"))  
    
    writer(StepStartedEvent(type=EventType.STEP_STARTED, step_name="3 - job_posting_determination - Evaluating job postings"))  

    best_match = []

    # Compare CV against each job description
    for jd in job_postings:

        similarity_matrix = cosine_similarity(np.array(cv_embeddings).reshape(1, -1), np.array(ast.literal_eval(jd.job_postings_vector)).reshape(1, -1))

        max_per_cv = similarity_matrix.max(axis=1)
        overall_score = max_per_cv.mean()

        if overall_score  and overall_score > threshold:
            
            best_match.append({
                "job_description": jd ,
                "similarity_score" : overall_score
                })

    writer(StepFinishedEvent(type=EventType.STEP_FINISHED, step_name="3 - job_posting_determination - Job evaluation completed"))  
    return best_match

def get_all_job_postings() -> List[JobDescription]: 

    try: 
        response =  get_job_postings()

        if not response:
            raise HTTPException(status_code=500, detail="No job postings available")

        return response 
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))