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
    previous_weakness: str = None
) -> str:
    message = f"""
User statement: {statement}

Examples:
{format_items(examples)}

Edge cases:
{format_items(edge_cases)}
"""
    if previous_prompt:
        message += f"""
Previous prompt: {previous_prompt}
Previous score: {previous_score}
Weakness to fix: {previous_weakness}
"""
    return message

def format_items(items: list) -> str:
    return "\n".join([
        f"- Input: {item.input} | Expected: {item.expected_output}"
        for item in items
    ])

def generate_prompt(
    statement: str,
    examples: list,
    edge_cases: list,
    previous_prompt: str = None,
    previous_score: float = None,
    previous_weakness: str = None
) -> str:
    system_prompt = load_template()
    user_message = build_message(
        statement,
        examples,
        edge_cases,
        previous_prompt,
        previous_score,
        previous_weakness
    )

    response = client.chat.complete(
        model="mistral-small-latest",
        messages=[
            { "role": "system", "content": system_prompt },
            { "role": "user", "content": user_message }
        ]
    )

    return response.choices[0].message.content