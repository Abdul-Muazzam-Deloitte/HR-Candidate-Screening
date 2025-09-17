from datetime import datetime
from fastapi import HTTPException
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from app.models.job_description import JobDescriptionCreate
from app.models.candidate_info import Candidate
import uuid
import json
from app.llm_handler.embedder import OpenAIEmbedder

load_dotenv(override=True)


# Replace with your actual values
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_API_KEY")
if not SUPABASE_KEY or not SUPABASE_URL:
    raise ValueError("Missing SUPABASE environment variable")
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

openAI_embedder = OpenAIEmbedder()

def get_world_check_info(candidate_info:  Candidate):
    try: 

        print(candidate_info)

        response = (
            supabase.table("world_check_reference")
            .select("*")
            .or_(f"first_name.eq.{candidate_info.first_name},last_name.eq.{candidate_info.last_name},email.eq.{candidate_info.email},phone_number.eq.{candidate_info.phone}")
            .execute()
            )

        print(response)

        if not response.data:
            return 

        return response.data[0]

    except Exception as e:
        print(e)
        raise HTTPException(status_code=404, detail="Error connecting to database")

def get_job_postings():
    try: 

        response = supabase.table("job_postings").select("*").execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="No job postings found")

        return response.data

    except Exception as e:
        print(e)
        raise HTTPException(status_code=404, detail="Error connecting to database")

def create_job_posting(job_posting: JobDescriptionCreate):

    try:
        jb_chunks = openAI_embedder.chunk_document(json.dumps(job_posting.model_dump()))
        jb_embeddings = openAI_embedder.embed_text(jb_chunks)
    
        response = (
            supabase.table("job_postings")
            .insert({ 
                        # "id": str(uuid.uuid4()),
                        "title": job_posting.title, 
                        "department": job_posting.department, 
                        "description": job_posting.description, 
                        "experience": job_posting.experience, 
                        "skills": job_posting.skills, 
                        "requirements": job_posting.requirements,
                        "job_postings_vector": jb_embeddings
                        # "createdAt": str(datetime.now()),
                        # "updatedAt": str(datetime.now())
                    })
            .execute()
            )

        if not response.data:
            raise HTTPException(status_code=404, detail="No job descriptions found")

        return response.data[0]   
    except Exception as e:
        print(e)
        raise HTTPException(status_code=404, detail="Error connecting to database")
    
def update_job_posting(id: str ,job_posting: JobDescriptionCreate):

    try:

        response = (
                supabase.table("job_postings")
                .update({ 
                        # "id": str(uuid.uuid4()),
                        "title": job_posting.title, 
                        "department": job_posting.department, 
                        "description": job_posting.description, 
                        "experience": job_posting.experience, 
                        "skills": job_posting.skills, 
                        "requirements": job_posting.requirements,
                        # "createdAt": str(datetime.now()),
                        # "updatedAt": str(datetime.now())
                    })
                .eq("id", id.strip())
                .execute()
            )

        if not response.data:
            raise HTTPException(status_code=404, detail="No job descriptions found")

        return response.data[0]   
    except Exception as e:
        print(e)
        raise HTTPException(status_code=404, detail="Error connecting to database")