from pydantic import BaseModel

class Weights(BaseModel):
    clarity: float
    edge_cases: float
    quality: float

class Example(BaseModel):
    input: str
    expected_output: str

class OptimizeRequest(BaseModel):
    statement: str
    examples: list[Example]
    edge_cases: list[Example]
    weights: Weights

class OptimizeResponse(BaseModel):
    final_prompt: str
    final_score: float
    iterations_taken: int

class SSEEvent(BaseModel):
    iteration: int
    current_prompt: str
    score: float
    score_breakdown: dict
    thinking: str