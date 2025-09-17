from langchain.tools import tool
from app.models.candidate_info import Candidate
from app.models.world_check import WorldCheck
from app.database.db import get_world_check_info
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

@tool
def candidate_world_check(candidate_cv_data: Candidate):
    """ Get Candidate World Check Information"""
    writer = get_stream_writer()

    writer(StepStartedEvent(type=EventType.STEP_STARTED, step_name="1 - world_check - Retrieving Candidate Information"))  

    candidate_world_check = get_candidate_world_check_info(candidate_cv_data)

    if not candidate_world_check:
        return {"error" : "Candidate not found in world check database"}

    writer(StepFinishedEvent(type=EventType.STEP_FINISHED, step_name="1 - world_check - Candidate Information retrieved successfully"))  

    return candidate_world_check

def get_candidate_world_check_info(candidate_info: Candidate) -> WorldCheck: 

    try: 
        response =  get_world_check_info(candidate_info)

        if not response:
            return WorldCheck( nationality_id="",
            passport_id="",
            first_name="",
            last_name="",
            address="",
            email="test@test.com",
            phone_number="",
            nationality="",
            morality="")

        return WorldCheck(**response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))