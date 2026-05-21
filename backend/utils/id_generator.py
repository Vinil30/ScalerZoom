from uuid import uuid4
import random
import string


def generate_uuid() -> str:
    return str(uuid4())


def generate_meeting_code(length: int = 10) -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "-".join(
        "".join(random.choices(alphabet, k=part_length))
        for part_length in (3, 3, max(2, length - 6))
    )
