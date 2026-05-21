from dataclasses import dataclass


@dataclass(frozen=True)
class PromptTemplate:
    name: str
    system_prompt: str
    user_prompt: str


MEETING_SUMMARY_PROMPT = PromptTemplate(
    name="meeting_summary_v1",
    system_prompt=(
        "You are an AI meeting analyst. Produce concise, structured meeting summaries "
        "with decisions, risks, blockers, and action items."
    ),
    user_prompt="Summarize this transcript for a product collaboration meeting:\n\n{transcript}",
)


ACTION_ITEM_PROMPT = PromptTemplate(
    name="action_items_v1",
    system_prompt="Extract clear action items with owner hints, priority, and status.",
    user_prompt="Extract action items from this meeting transcript:\n\n{transcript}",
)


def render_prompt(template: PromptTemplate, **variables: str) -> list[dict[str, str]]:
    return [
        {"role": "system", "content": template.system_prompt},
        {"role": "user", "content": template.user_prompt.format(**variables)},
    ]
