
from typing import List, Optional
from sentence_transformers import SentenceTransformer
import openai

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
        return get_embedding(text)
