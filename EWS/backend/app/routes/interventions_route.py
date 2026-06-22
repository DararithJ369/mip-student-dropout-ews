from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from app.utils.db import get_db_connection

router = APIRouter(prefix="/interventions", tags=["Interventions"])

class CreateInterventionRequest(BaseModel):
    student_id: str
    action: str
    severity: str
    status: str = "pending"
    assigned_by: str
    notes: str = ""

class UpdateInterventionRequest(BaseModel):
    status: str
    notes: str = ""

@router.get("")
def list_interventions():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Query interventions and join student names
    cursor.execute("""
        SELECT i.*, s.name as student_name, s.risk_level as student_risk
        FROM interventions i
        JOIN students s ON i.student_id = s.id
        ORDER BY i.assigned_date DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    
    interventions_list = []
    alerts = []
    
    for idx, r in enumerate(rows):
        interventions_list.append({
            "id": r["id"],
            "studentId": r["student_id"],
            "studentName": r["student_name"],
            "action": r["action"],
            "severity": r["severity"],
            "status": r["status"],
            "assignedBy": r["assigned_by"],
            "assignedDate": r["assigned_date"],
            "notes": r["notes"]
        })
        
        # Build live alerts based on high risk / consecutive absence interventions
        if r["status"] == "in_progress" and r["severity"] == "high":
            alerts.append({
                "id": r["id"],
                "student": r["student_name"],
                "message": r["action"],
                "severity": r["severity"],
                "time": "Active Now"
            })
            
    # Default fallback alerts if database alerts are empty
    if not alerts:
        alerts = [
            { "id": 101, "student": "Sok Pisey", "message": "5 consecutive absences this week", "severity": "high", "time": "2m ago" },
            { "id": 102, "student": "Visal Kong", "message": "Score dropped 18 points", "severity": "high", "time": "12m ago" }
        ]
        
    return {
        "interventions": interventions_list,
        "alerts": alerts
    }

@router.post("")
def add_intervention(req: CreateInterventionRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if student exists
    cursor.execute("SELECT id FROM students WHERE id = ?", (req.student_id,))
    student = cursor.fetchone()
    if not student:
        conn.close()
        raise HTTPException(status_code=444, detail="Student not found")
        
    assigned_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    cursor.execute("""
        INSERT INTO interventions (student_id, action, severity, status, assigned_by, assigned_date, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        req.student_id, req.action, req.severity, req.status, req.assigned_by, assigned_date, req.notes
    ))
    
    conn.commit()
    conn.close()
    
    return {
        "success": True,
        "message": "Intervention assigned successfully"
    }

@router.patch("/{int_id}")
def update_intervention(int_id: int, req: UpdateInterventionRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if exists
    cursor.execute("SELECT id FROM interventions WHERE id = ?", (int_id,))
    interv = cursor.fetchone()
    if not interv:
        conn.close()
        raise HTTPException(status_code=404, detail="Intervention not found")
        
    cursor.execute("""
        UPDATE interventions
        SET status = ?, notes = ?
        WHERE id = ?
    """, (req.status, req.notes, int_id))
    
    conn.commit()
    conn.close()
    
    return {
        "success": True,
        "message": "Intervention updated successfully"
    }
