
from typing import List
from sentence_transformers import SentenceTransformer
import openai

import google.generativeai
from langchain_google_genai import GoogleGenerativeAIEmbeddings

import os
from openai import AzureOpenAI
from langchain.text_splitter import RecursiveCharacterTextSplitter

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
        self.client = GoogleGenerativeAIEmbeddings(model=model_name)

    def embed(self, text: str) -> List[float]:
        return self.client.embed_query(text)

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        return self.client.embed_documents(texts)

class OpenAIEmbedder:
    def __init__(self, 
                model_name: str = "text-embedding-3-small", 
                deployment: str = "text-embedding-3-small", 
                api_version: str = "2024-02-01", 
                endpoint: str = "https://ai-manuai007693985398858.openai.azure.com/"
                ):
        self.client = AzureOpenAI(
        api_version=api_version,
        azure_endpoint=endpoint,
        api_key=os.environ.get("AZURE_API_KEY")
    )

    def embed_text(self, text: List[str]):
        resp = self.client.embeddings.create(
                input=text,
                model="text-embedding-3-small"
                )
        return resp.data[0].embedding

    def chunk_document(self, document: str, chunk_size=2000, chunk_overlap=200):
        """Split the document into chunks for embedding."""
        splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        return splitter.split_text(document)
