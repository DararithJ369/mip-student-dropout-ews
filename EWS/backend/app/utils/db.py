import sqlite3
import os
import json

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "student_dropout.db")
DATABASE_URL = os.environ.get("DATABASE_URL")

# Conditional postgres wrapper classes
class PostgresCursorWrapper:
    def __init__(self, cursor):
        self.cursor = cursor

    def execute(self, query, params=None):
        # 1. Translate SQLite '?' query parameters to PostgreSQL '%s'
        translated_query = query.replace("?", "%s")
        
        # 2. Translate table creation types (AUTOINCREMENT -> SERIAL)
        if "INTEGER PRIMARY KEY AUTOINCREMENT" in translated_query:
            translated_query = translated_query.replace("INTEGER PRIMARY KEY AUTOINCREMENT", "SERIAL PRIMARY KEY")
        
        if params is not None:
            self.cursor.execute(translated_query, params)
        else:
            self.cursor.execute(translated_query)

    def fetchone(self):
        return self.cursor.fetchone()

    def fetchall(self):
        return self.cursor.fetchall()

    def close(self):
        self.cursor.close()

    def __iter__(self):
        return iter(self.cursor)

    @property
    def rowcount(self):
        return self.cursor.rowcount

    @property
    def description(self):
        return self.cursor.description

class PostgresConnectionWrapper:
    def __init__(self, conn):
        self.conn = conn

    def cursor(self):
        import psycopg2.extras
        # Using DictCursor so rows behave like dictionaries/lists (like sqlite3.Row)
        cursor = self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        return PostgresCursorWrapper(cursor)

    def commit(self):
        self.conn.commit()

    def rollback(self):
        self.conn.rollback()

    def close(self):
        self.conn.close()

def get_db_connection():
    if DATABASE_URL:
        try:
            import psycopg2
            conn = psycopg2.connect(DATABASE_URL)
            return PostgresConnectionWrapper(conn)
        except ImportError:
            raise ImportError(
                "psycopg2 is not installed but DATABASE_URL was specified. "
                "Please run 'pip install psycopg2-binary' to connect to PostgreSQL."
            )
    else:
        # Fallback to SQLite
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        name TEXT NOT NULL
    )
    """)
    
    # Create students table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        gender TEXT NOT NULL,
        age INTEGER NOT NULL,
        province TEXT NOT NULL,
        grade INTEGER NOT NULL,
        living_with TEXT NOT NULL,
        distance TEXT NOT NULL,
        transport TEXT NOT NULL,
        attendance TEXT NOT NULL,
        attendance_rate REAL NOT NULL,
        monthly_average TEXT NOT NULL,
        score REAL NOT NULL,
        absence TEXT NOT NULL,
        parental_education TEXT NOT NULL,
        family_income TEXT NOT NULL,
        work_support TEXT NOT NULL,
        external_support TEXT NOT NULL,
        risk_level TEXT NOT NULL,
        dropout_probability REAL NOT NULL,
        top_risk_factors TEXT NOT NULL -- stored as JSON string
    )
    """)
    
    # Create interventions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS interventions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT NOT NULL,
        action TEXT NOT NULL,
        severity TEXT NOT NULL,
        status TEXT NOT NULL,
        assigned_by TEXT NOT NULL,
        assigned_date TEXT NOT NULL,
        notes TEXT,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )
    """)
    
    # Create predictions_log table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT,
        gender TEXT,
        age INTEGER,
        province TEXT,
        living_with TEXT,
        distance TEXT,
        transport TEXT,
        attendance TEXT,
        monthly_average TEXT,
        absence TEXT,
        parental_education TEXT,
        family_income TEXT,
        work_support TEXT,
        external_support TEXT,
        dropout_probability REAL,
        prediction INTEGER,
        risk_level TEXT,
        top_risk_factors TEXT,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
    )
    """)
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    if DATABASE_URL:
        print("Database initialized successfully on PostgreSQL!")
    else:
        print("Database initialized successfully at:", DB_PATH)
