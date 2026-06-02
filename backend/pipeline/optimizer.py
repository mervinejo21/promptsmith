from services.mistral_client import client
from pipeline.generator import generate_prompt
from pipeline.scorer import score_prompt
from typing import AsyncGenerator
import json

async def run_optimizer(
    statement: str,
    examples: list,
    edge_cases: list,
    weights: object,
    max_iterations: int = 3
) -> AsyncGenerator[str, None]:

    previous_prompt = None
    previous_score = None
    previous_weakness = None

    for iteration in range(1, max_iterations + 1):

        # STEP 1 — Generate
        generated_prompt = generate_prompt(
            statement=statement,
            examples=examples,
            edge_cases=edge_cases,
            previous_prompt=previous_prompt,
            previous_score=previous_score,
            previous_weakness=previous_weakness
        )

        # STEP 2 — Test against examples & edge cases
        test_results = []
        for item in examples + edge_cases:
            actual_output = client.chat.complete(
                model="mistral-small-latest",
                messages=[
                    { "role": "system", "content": generated_prompt },
                    { "role": "user", "content": item.input }
                ]
            )
            test_results.append({
                "input": item.input,
                "expected": item.expected_output,
                "actual": actual_output.choices[0].message.content
            })

        # STEP 3 — Score
        score_breakdown = score_prompt(
            generated_prompt=generated_prompt,
            test_results=test_results,
            weights=weights
        )

        # STEP 4 — Weighted final score
        final_score = (
            score_breakdown["clarity"]    * weights.clarity    / 100 +
            score_breakdown["edge_cases"] * weights.edge_cases / 100 +
            score_breakdown["quality"]    * weights.quality    / 100
        )

        # STEP 5 — Stream SSE event to frontend
        sse_event = {
            "iteration": iteration,
            "current_prompt": generated_prompt,
            "score": round(final_score, 2),
            "score_breakdown": score_breakdown,
            "thinking": score_breakdown.get("weakness", "")
        }
        yield f"data: {json.dumps(sse_event)}\n\n"

        # STEP 6 — Stop conditions
        if final_score > 80:
            break
        if iteration == max_iterations:
            break

        # STEP 7 — Prepare next iteration
        previous_prompt = generated_prompt
        previous_score = final_score
        previous_weakness = score_breakdown.get("weakness", "")

    # STEP 8 — Final result
    final_event = {
        "type": "done",
        "final_prompt": generated_prompt,
        "final_score": round(final_score, 2),
        "iterations_taken": iteration
    }
    yield f"data: {json.dumps(final_event)}\n\n"