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
    system_prompt=(
        "Extract clear meeting action items. Return strict JSON only with this shape: "
        "{\"action_items\":[{\"action_text\":\"...\",\"assigned_to\":\"name or null\","
        "\"priority\":\"low|medium|high|urgent\",\"status\":\"open\"}]}."
    ),
    user_prompt="Extract tasks, owners, deadlines if mentioned, and priorities from this transcript:\n\n{transcript}",
)


TRANSCRIPT_INSIGHTS_PROMPT = PromptTemplate(
    name="transcript_insights_v1",
    system_prompt=(
        "You are an AI meeting intelligence assistant. Summarize context, decisions, blockers, "
        "and collaboration signals in concise product-team language."
    ),
    user_prompt="Create contextual transcript insights from this meeting transcript:\n\n{transcript}",
)


def render_prompt(template: PromptTemplate, **variables: str) -> list[dict[str, str]]:
    return [
        {"role": "system", "content": template.system_prompt},
        {"role": "user", "content": template.user_prompt.format(**variables)},
    ]
