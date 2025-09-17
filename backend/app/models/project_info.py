from typing import List
from pydantic import BaseModel, Field, ConfigDict

class RepositoryInfo(BaseModel):
    """Repository information"""
    model_config = ConfigDict(extra="ignore")

    name: str = Field(description="Repository name")
    url: str = Field(description="Repository URL")
    description: str = Field(description="Repository description")
    fork: bool = Field(description="Indicates if the repository is a fork")

class ProjectInfo(BaseModel):
    """Project and open-source contributions"""
    model_config = ConfigDict(extra="ignore")

    platform: str = Field(description="Platform name (e.g., Github)")
    repositories: List[RepositoryInfo] = Field(description="Quality and appropriateness of shared content")

