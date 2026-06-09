import uuid
import json
from datetime import datetime
from memory.database import get_connection

def save_optimization(
    statement: str,
    final_prompt: str,
    final_score: float,
    weights: object,
    iterations: int
):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO optimizations 
        VALUES ()
    """, (
        str(uuid.uuid4()),  # id - hint: use uuid.uuid4()
        statement,  # statement
        final_prompt,  # final_prompt
        final_score,  # final_score
        json.dumps(weights),  # weights - hint: use json.dumps()
        iterations,  # iterations
        datetime.now()   # created_at - hint: use datetime.now()
    ))
    conn.commit()
    conn.close()