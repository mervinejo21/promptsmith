from services.mistral_client import client
import json

def load_template() -> str:
    with open("prompts/score.txt", "r") as f:
        return f.read()

def truncate(text: str, max_chars: int = 200) -> str:
    return text[:max_chars] + "..." if len(text) > max_chars else text

def score_prompt(
    generated_prompt: str,
    test_results: list,
    weights: object
) -> tuple[dict, int]:
    system_prompt = load_template()

    # Truncate outputs to save tokens
    truncated_results = [
        {
            "input": truncate(r["input"], 100),
            "expected": truncate(r["expected"], 150),
            "actual": truncate(r["actual"], 200)
        }
        for r in test_results
    ]

    user_message = f"""
prompt: {truncate(generated_prompt, 300)}
results: {truncated_results}
weights: clarity={weights.clarity}% edge_cases={weights.edge_cases}% quality={weights.quality}%
"""

    response = client.chat.complete(
        model="mistral-small-latest",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]
    )

    tokens_used = response.usage.total_tokens
    raw = response.choices[0].message.content
    clean = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(clean), tokens_used