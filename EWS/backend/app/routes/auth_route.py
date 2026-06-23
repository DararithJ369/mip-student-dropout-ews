from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.utils.db import get_db_connection

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(req: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Query user
    cursor.execute("SELECT * FROM ews_users WHERE username = ?", (req.username,))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Validate simulated hash password
    expected_hash = f"sha256_simulated_{req.password}"
    if user["password_hash"] != expected_hash:
        raise HTTPException(status_code=401, detail="Invalid username or password")
        
    return {
        "success": True,
        "token": f"simulated_token_{user['username']}_{user['role']}",
        "role": user["role"],
        "name": user["name"],
        "username": user["username"]
    }
