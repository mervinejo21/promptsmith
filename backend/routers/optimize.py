from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from models import OptimizeRequest
from pipeline.optimizer import run_optimizer

router = APIRouter()

@router.post("/optimize")
async def optimize(request: OptimizeRequest):
    return StreamingResponse(
        run_optimizer(
            statement=request.statement,
            examples=request.examples,
            edge_cases=request.edge_cases,
            weights=request.weights
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.post("/refine")
async def refine(request: OptimizeRequest):
    return StreamingResponse(
        run_optimizer(
            statement=request.statement,
            examples=request.examples,
            edge_cases=request.edge_cases,
            weights=request.weights
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.post("/weakness")
async def get_weakness(request: OptimizeRequest):
    from pipeline.scorer import score_prompt
    from services.mistral_client import client

    # run prompt against examples to get test results
    test_results = []
    for item in request.examples + request.edge_cases:
        actual_output = client.chat.complete(
            model="mistral-small-latest",
            messages=[
                { "role": "user", "content": item.input }
            ]
        )
        test_results.append({
            "input": item.input,
            "expected": item.expected_output,
            "actual": actual_output.choices[0].message.content
        })

    score_breakdown = score_prompt(
        generated_prompt=request.statement,
        test_results=test_results,
        weights=request.weights
    )

    return {
        "weakness": score_breakdown.get("weakness", ""),
        "score_breakdown": score_breakdown
    }

@router.post("/addedgecases")
async def add_edge_cases(request: OptimizeRequest):
    from services.mistral_client import client

    response = client.chat.complete(
        model="mistral-small-latest",
        messages=[
            {
                "role": "system",
                "content": "You are an expert at finding edge cases. Given a prompt statement and examples, generate 3 new edge cases in JSON array format: [{input, expected_output}]. Respond ONLY with the JSON array."
            },
            {
                "role": "user",
                "content": f"Statement: {request.statement}\nExamples: {[{'input': e.input, 'expected_output': e.expected_output} for e in request.examples]}"
            }
        ]
    )

    import json
    raw = response.choices[0].message.content
    clean = raw.replace("```json", "").replace("```", "").strip()
    edge_cases = json.loads(clean)

    return { "edge_cases": edge_cases }

@router.post("/finish")
async def finish(request: dict):
    return {
        "message": "Prompt saved successfully",
        "final_prompt": request.get("final_prompt"),
        "final_score": request.get("final_score")
    }