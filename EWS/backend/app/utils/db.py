import sqlite3
import os
import json

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "student_dropout.db")

def get_db_connection():
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
    print("Database initialized successfully at:", DB_PATH)
