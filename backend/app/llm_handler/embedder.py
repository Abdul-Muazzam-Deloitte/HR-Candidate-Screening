
from typing import List, Optional
from sentence_transformers import SentenceTransformer
import openai

import google.generativeai
from langchain_google_genai import GoogleGenerativeAIEmbeddings

google.generativeai.configure()

USE_OPENAI = False

def get_embeddings(text: str) -> List[float]:
    if USE_OPENAI:
        openai.api_key = "your-openai-api-key"  # Replace securely
        def get_embedding(text: str) -> List[float]:
            response = openai.Embedding.create(
                input=[text],
                model="text-embedding-3-small"
            )
            return response['data'][0]['embedding']
        return get_embedding(text)
    else:
        model = SentenceTransformer("all-MiniLM-L6-v2")
        def get_embedding(text: str) -> List[float]:
            return model.encode(text).tolist()
        return get_embedding(text)\

class GeminiEmbedder:
    def __init__(self, model_name: str = "models/embedding-001"):
        self.client = GoogleGenerativeAIEmbeddings(model=model_name, dimensions=1024)

    def embed(self, text: str) -> List[float]:
        return self.client.embed_query(text)

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        return self.client.embed_documents(texts)