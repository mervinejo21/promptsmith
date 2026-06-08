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
    total_tokens = 0

    for iteration in range(1, max_iterations + 1):

        # STEP 1 — Generate
        generated_prompt, gen_tokens = generate_prompt(
            statement=statement,
            examples=examples,
            edge_cases=edge_cases,
            previous_prompt=previous_prompt,
            previous_score=previous_score,
            previous_weakness=previous_weakness
        )
        total_tokens += gen_tokens

        # STEP 2 — Batch test all examples + edge cases in ONE call
        all_items = examples + edge_cases
        inputs_list = "\n".join([
            f"{i+1}. {item.input}"
            for i, item in enumerate(all_items)
        ])
        expected_list = [item.expected_output for item in all_items]

        batch_response = client.chat.complete(
            model="mistral-small-latest",
            messages=[
                {"role": "system", "content": generated_prompt},
                {"role": "user", "content": f"Answer each input briefly:\n{inputs_list}"}
            ]
        )
        total_tokens += batch_response.usage.total_tokens

        # Parse batch response into individual results
        raw_outputs = batch_response.choices[0].message.content.split("\n")
        test_results = [
            {
                "input": all_items[i].input,
                "expected": expected_list[i],
                "actual": raw_outputs[i] if i < len(raw_outputs) else ""
            }
            for i in range(len(all_items))
        ]

        # STEP 3 — Score
        score_breakdown, score_tokens = score_prompt(
            generated_prompt=generated_prompt,
            test_results=test_results,
            weights=weights
        )
        total_tokens += score_tokens

        # STEP 4 — Weighted final score
        final_score = (
            score_breakdown["clarity"]    * weights.clarity    / 100 +
            score_breakdown["edge_cases"] * weights.edge_cases / 100 +
            score_breakdown["quality"]    * weights.quality    / 100
        )

        # STEP 5 — Stream SSE event with token usage
        sse_event = {
            "iteration": iteration,
            "current_prompt": generated_prompt,
            "score": round(final_score, 2),
            "score_breakdown": score_breakdown,
            "thinking": score_breakdown.get("weakness", ""),
            "tokens_used_this_iteration": gen_tokens + score_tokens,
            "total_tokens_so_far": total_tokens
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

    # STEP 8 — Final result with total token summary
    final_event = {
        "type": "done",
        "final_prompt": generated_prompt,
        "final_score": round(final_score, 2),
        "iterations_taken": iteration,
        "total_tokens_used": total_tokens
    }
    yield f"data: {json.dumps(final_event)}\n\n"