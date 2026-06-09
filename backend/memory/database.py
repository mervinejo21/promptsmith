import sqlite3

DB_PATH = "memory/promptsmith.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS optimizations (
            id           TEXT PRIMARY KEY,
            statement    TEXT,
            final_prompt TEXT,
            final_score  REAL,
            weights      TEXT,
            iterations   INTEGER,
            created_at   TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()