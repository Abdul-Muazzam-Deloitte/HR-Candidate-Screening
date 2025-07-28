from pydantic import BaseModel, Field, field_validator
from typing import Dict, Optional, Union, List
import json

class CVExtractionInfo(BaseModel):
    markdown: str
    social_links: dict[str, Optional[str]] = {}

