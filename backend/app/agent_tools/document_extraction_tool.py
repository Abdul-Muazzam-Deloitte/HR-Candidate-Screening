from agentic_doc.parse import parse
from app.models.candidate_info import Candidate
from dotenv import load_dotenv
from langchain.tools import tool

load_dotenv(override=True)

@tool
def convert_pdf_to_markdown_landing_ai(pdf_path: str) -> Candidate:
    """Extracts candidate information from a PDF using Landing AI.

    Args:
        pdf_path (str): Path to the candidate's CV in PDF format.

    Returns:
        Candidate: Extracted candidate information.
    """ 
    try:    
        # Extract candidte info from CV in pdf format using Landing AI
        # filepath: path of CV
        # extraction_model: extract specific data from pdf based on Candidate class        
        parsed_docs = parse(pdf_path, extraction_model=Candidate, include_metadata_in_markdown=True, include_marginalia=True)
        fields = parsed_docs[0].extraction

        # Return data into JSON
        return fields.model_dump()
        
        # Return data as Candidate Object
        # return fields

    except Exception as e:
        print('Error in convert_pdf_to_markdown_landing_ai:', str(e))
        return Candidate()