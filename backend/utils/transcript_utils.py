from collections import Counter
import re


FILLER_WORDS = {"um", "uh", "like", "you know", "actually", "basically"}


def normalize_transcript_text(text: str) -> str:
    compact = re.sub(r"\s+", " ", text).strip()
    return compact


def estimate_transcript_word_count(text: str) -> int:
    return len(re.findall(r"\b\w+\b", text))


def extract_candidate_keywords(text: str, limit: int = 12) -> list[str]:
    tokens = re.findall(r"\b[a-zA-Z][a-zA-Z-]{3,}\b", text.lower())
    filtered = [token for token in tokens if token not in FILLER_WORDS]
    return [word for word, _ in Counter(filtered).most_common(limit)]
