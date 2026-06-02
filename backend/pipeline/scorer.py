from services.mistral_client import client
import json

def load_template() -> str:
    with open("prompts/score.txt", "r") as f:
        return f.read()

def score_prompt(
    generated_prompt: str,
    test_results: list,
    weights: object
) -> dict:
    system_prompt = load_template()

    user_message = f"""
Generated prompt: {generated_prompt}

Test results:
{format_results(test_results)}

Scoring weights:
- Clarity: {weights.clarity}%
- Edge cases: {weights.edge_cases}%
- Quality: {weights.quality}%
"""

    response = client.chat.complete(
        model="mistral-small-latest",
        messages=[
            { "role": "system", "content": system_prompt },
            { "role": "user", "content": user_message }
        ]
    )

    raw = response.choices[0].message.content
    clean = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(clean)

def format_results(test_results: list) -> str:
    return "\n".join([
        f"- Input: {r['input']} | Expected: {r['expected']} | Actual: {r['actual']}"
        for r in test_results
    ])