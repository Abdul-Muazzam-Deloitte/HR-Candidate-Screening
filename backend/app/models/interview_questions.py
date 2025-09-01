from pydantic import BaseModel, Field, ConfigDict
from typing import List

class InterviewQA(BaseModel):
    """Individual interview question with candidate's answer"""
    model_config = ConfigDict(extra="ignore")

    question: str = Field(description="The interview question")
    answer: str = Field(description="Candidate's answer to the question")
    category: str = Field(description="Question category: Technical, Behavioral, Situational, Cultural Fit, or Experience")

class InterviewQAs(BaseModel):
    """Complete set of tailored interview questions"""
    model_config = ConfigDict(extra="ignore")

    technical_questions: List[str] = Field(description="Technical skill assessment questions")
    behavioral_questions: List[str] = Field(description="Behavioral and soft skills questions")
    experience_questions: List[str] = Field(description="Experience and background questions")
    situational_questions: List[str] = Field(description="Situational judgment questions")
    cultural_fit_questions: List[str] = Field(description="Company culture and fit questions")
    areas_to_probe: List[str] = Field(description="Specific areas to investigate based on CV/screening analysis")
    red_flag_questions: List[str] = Field(description="Questions to address any concerns from screening")
    interview_duration: str = Field(description="Recommended interview duration")