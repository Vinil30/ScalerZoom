import os

from dotenv import load_dotenv
from openai import OpenAI

from backend.utils.ai_utils import ACTION_ITEM_PROMPT, MEETING_SUMMARY_PROMPT, render_prompt


load_dotenv()


class OpenAIService:
    def __init__(self) -> None:
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    def generate_meeting_summary(self, transcript: str) -> str:
        messages = render_prompt(MEETING_SUMMARY_PROMPT, transcript=transcript)
        response = self.client.chat.completions.create(model=self.model, messages=messages)
        return response.choices[0].message.content or ""

    def extract_action_items(self, transcript: str) -> str:
        messages = render_prompt(ACTION_ITEM_PROMPT, transcript=transcript)
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            response_format={"type": "json_object"},
        )
        return response.choices[0].message.content or '{"action_items":[]}'
