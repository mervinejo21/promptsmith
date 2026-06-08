from services.mistral_client import client

def load_template() -> str:
    with open("prompts/generate.txt", "r") as f:
        return f.read()

def build_message(
    statement: str,
    examples: list,
    edge_cases: list,
    previous_prompt: str = None,
    previous_score: float = None,
    previous_weakness: str = None,
    is_first_iteration: bool = True
) -> str:
    if is_first_iteration:
        # Send full context only on first iteration
        return f"""
statement: {statement}
examples: {[{"input": e.input, "expected": e.expected_output} for e in examples]}
edge_cases: {[{"input": e.input, "expected": e.expected_output} for e in edge_cases]}
"""
    else:
        # Only send what changed — saves tokens!
        return f"""
statement: {statement}
previous_prompt: {previous_prompt}
previous_score: {previous_score}
weakness: {previous_weakness}
"""

def generate_prompt(
    statement: str,
    examples: list,
    edge_cases: list,
    previous_prompt: str = None,
    previous_score: float = None,
    previous_weakness: str = None
) -> tuple[str, int]:
    system_prompt = load_template()
    is_first = previous_prompt is None

    user_message = build_message(
        statement, examples, edge_cases,
        previous_prompt, previous_score, previous_weakness,
        is_first_iteration=is_first
    )

    response = client.chat.complete(
        model="mistral-small-latest",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]
    )

    tokens_used = response.usage.total_tokens
    return response.choices[0].message.content, tokens_used