
from agentic_doc.parse import parse
from app.models.candidate_info import Candidate
from dotenv import load_dotenv
import os
import requests


load_dotenv(override=True)

class DocumentExtractor():
    file_path: str

    def __init__(self, filepath: str):
        self.filepath = filepath

    def extract_cv_info(self):
        """
        Method to call function to perform extraction of the pdf file
        1. convert_pdf_to_markdown_landing_ai_sdk() -> extract PDF contents using Landing AI SDK
        2. convert_pdf_to_markdown_landing_ai_api() -> extract PDF contents using Landing AI API Request

        Returns:
            contents of PDF in markdown format
        """
        
        return self.convert_pdf_to_markdown_landing_ai()

        # return self.convert_pdf_to_markdown_landing_ai_api()

    def convert_pdf_to_markdown_landing_ai(self) -> Candidate:
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
            parsed_docs = parse(self.filepath, extraction_model=Candidate, include_metadata_in_markdown=True, include_marginalia=True)
            fields = parsed_docs[0].extraction

            # Return data into JSON
            # return fields.model_dump()
            
            # Return data as Candidate Object
            return fields

        except Exception as e:
            print('Error in convert_pdf_to_markdown_landing_ai:', str(e))
            return Candidate()

    def convert_pdf_to_markdown_landing_ai_api(self):
        """
        Method to perform PDF agentic document extraction via Landing AI API Request
        
        Returns:
            contents of PDF in markdown format
        """

        # Get Landing AI API Key
        VA_API_KEY = os.getenv('VISION_AGENT_API_KEY')

        # Create path to pdf file
        base_pdf_path = "/workspaces/HR-Candidate-Screening/backend/app/knowledge_base" 
        pdf_name = "ABDUL Muhammad Muazzam_Ul_Hussein CV.pdf"
        pdf_path = f"{base_pdf_path}/{pdf_name}"

        # URL to landing AI Api
        url = "https://api.va.landing.ai/v1/tools/agentic-document-analysis"

        # Payload Data to attach to request
        payload = {
            "include_marginalia": "true",
            "include_metadata_in_markdown": "true"
        }

        # File to attach to request
        files = [
            ("pdf", (pdf_name, open(pdf_path, "rb"), "application/pdf")),
        ]

        # Headers data
        headers = {
            "Authorization": f"Basic {VA_API_KEY}"
        }

        # Request to Landing AI Api and response
        response = requests.request("POST", url, data=payload, files=files, headers=headers)
        
        if response.status_code == 200:
            try:

                # Retrieve data in markdown format
                markdown_output = response.json()["data"]["markdown"]
                # print("✅ Markdown extracted:")
                # print(markdown_output)

                # Optionally return or save
                return markdown_output
                # with open("output.md", "w") as f:
                #     f.write(markdown_output)

            except KeyError:
                print("❌ Markdown not found in response:")
                print(json.dumps(response.json(), indent=2))
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(response.text)




HEADERS = {
    "Accept": "application/vnd.github.mercy-preview+json"
}


def get_github_projects_summary(username: str, repo_name: str) -> list:
    url = f"https://api.github.com/repos/{username}/{repo_name}/contents"
    response = requests.get(url, headers=HEADERS)

    if response.status_code != 200:
        return []
    
    return response.json()

