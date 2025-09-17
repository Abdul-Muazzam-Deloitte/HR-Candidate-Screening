from dotenv import load_dotenv
import os, asyncio
from app.workflow.langgraph_workflow import hr_screening_workflow
from app.document_extraction.document_extractor import DocumentExtractor
from app.database.db import update_job_posting, create_job_posting, get_job_postings, get_world_check_info

from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import shutil
from typing import List

from app.models.job_description import JobDescription, JobDescriptionCreate
from app.models.candidate_info import Candidate
from app.models.world_check import WorldCheck


UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploaded_cvs")
os.makedirs(UPLOAD_DIR, exist_ok=True)

load_dotenv(override=True)

app = FastAPI(
    title="HR Screening API",
    description="API to run the HR screening workflow",
    version="1.0.0"
)

# Allow CORS for your ReactJS frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to ["http://localhost:3000"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "HR Screening API is running 🚀"}

@app.get("/get_job_descriptions", response_model=List[JobDescription])
def get_job_descriptions():
    try: 
        response =  get_job_postings()

        if not response:
            raise HTTPException(status_code=500, detail="No job created")
        return response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/get_candidate_world_check_info", response_model=WorldCheck)
def get_candidate_info(candidate: Candidate):
    try: 
        response =  get_world_check_info(candidate)

        if not response:
            raise HTTPException(status_code=500, detail="No job created")
        return response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/create_job_description", response_model=JobDescription)
def create_job_description(job : JobDescriptionCreate):
    try: 
        response =  create_job_posting(job)

        if not response:
            raise HTTPException(status_code=500, detail="No job created")
        return response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.put("/update_job_description/{job_id}", response_model=JobDescription)
def update_job_description(
    job_id: str,
    job: JobDescriptionCreate
):
    try:
        # Call your update function
        response = update_job_posting(job_id, job)  # Make sure this function accepts ID + update dict

        if not response:
            raise HTTPException(status_code=404, detail="No job updated")

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


from ag_ui.core import (
    RunStartedEvent,
    RunFinishedEvent,
    RunErrorEvent,
    StepStartedEvent,
    StepFinishedEvent,
    TextMessageContentEvent,
    EventType
)
from ag_ui.encoder import EventEncoder
import base64
import json

encoder = EventEncoder()

@app.websocket("/ws/run-screening")
async def agui_ws(ws: WebSocket):
    await ws.accept()
    try:
        # Receive uploaded file metadata
        data = await ws.receive_json()

        file_name = data["payload"]["fileName"]
        file_content = data["payload"]["fileContent"]

        # Save uploaded file
        file_location = os.path.join(UPLOAD_DIR, file_name)
        with open(file_location, "wb") as f:
            f.write(base64.b64decode(file_content))

        async for update in hr_screening_workflow(file_location):
            await ws.send_text( encoder.encode(update))

        # document_Extractor  = DocumentExtractor(filepath=file_location, ws=ws, encoder=encoder)
        # result = await document_Extractor.extract_cv_info()

        # print(result)

        await ws.close()

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        await ws.send_text(encoder.encode(
           RunErrorEvent(type=EventType.RUN_ERROR, message=str(e))
        ))
        print('error'   , str(e))


async def main():

    google_api_key = os.environ.get("GOOGLE_API_KEY")
    landing_ai_api_key = os.environ.get("VISION_AGENT_API_KEY")
    if not google_api_key:
        raise ValueError("Missing GOOGLE_API_KEY environment variable")
    elif not landing_ai_api_key:
        raise ValueError("Missing LANDING_AI_API_KEY environment variable")
    else:
        print("Google API Key and Landing AI API Key are set.")
        # hr_screening_workflow()

if __name__ == "__main__":
    asyncio.run(main())