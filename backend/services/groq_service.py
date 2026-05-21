import os
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

from backend.utils.ai_utils import ACTION_ITEM_PROMPT, render_prompt


load_dotenv(Path(__file__).resolve().parents[2] / ".env")


class GroqService:
    def __init__(self) -> None:
        self.model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
        self.client = OpenAI(
            api_key=os.getenv("GROQ_API_KEY"),
            base_url=os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1"),
        )

    def extract_action_items(self, transcript: str) -> str:
        messages = render_prompt(ACTION_ITEM_PROMPT, transcript=transcript)
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            response_format={"type": "json_object"},
        )
        return response.choices[0].message.content or '{"action_items":[]}'
