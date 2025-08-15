from dotenv import load_dotenv
import os, asyncio
from app.workflow.langgraph_workflow import hr_screening_workflow
from app.document_extraction.document_extractor import DocumentExtractor

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil

from sse_starlette.sse import EventSourceResponse

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

@app.post("/run-screening", summary="Run CV screening workflow", tags=["Screening"])
async def run_screening(file: UploadFile = File(...)):
    try:
        # Save uploaded file to disk
        file_location = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return EventSourceResponse(hr_screening_workflow(file_location))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extract_cv_contents", summary="Document Extraction", tags=["Extraction"])
def run_document_extraction(file: UploadFile = File(...)):
    try:
        # Save uploaded file to disk
        file_location = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Run extraction on saved file
        document_extractor = DocumentExtractor(filepath=file_location)
        result =  document_extractor.extract_cv_info()

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
