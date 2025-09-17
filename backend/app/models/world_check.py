from pydantic import BaseModel, ConfigDict, Field, EmailStr
from typing import Optional
from datetime import datetime

class WorldCheck(BaseModel):
    
    model_config = ConfigDict(extra="ignore") 

    nationality_id: str = Field(description="National Identity Card Number of Candidate")
    passport_id: Optional[str] = Field(description="Passport Id of Candidate")
    first_name: str = Field(description = "First Name of Candidate")
    last_name: str = Field(description = "Last Name of Candidate")
    address: str= Field(description="The candidate's address")
    email: Optional[str] = Field(description="the email of the candidate")
    phone_number: Optional[str] = Field(default=None, description="The candidate's phone number")
    nationality: str = Field(description="Candidate's nationality")
    morality: str = Field(description="Description of whether the candidate morality certificate")
