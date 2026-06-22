from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json
from datetime import datetime
from app.utils.db import get_db_connection
from app.services.prediction_service import predict_dropout
from app.schemas.student_schema import StudentInput

router = APIRouter(prefix="/students", tags=["Students"])

class CreateStudentRequest(BaseModel):
    name: str
    grade: int
    gender: str
    age: int
    province: str
    living_with: str
    distance: str
    transport: str
    attendance: str
    monthly_average: str
    absence: str
    parental_education: str
    family_income: str
    work_support: str
    external_support: str

def map_attendance_rate(attendance: str) -> float:
    if attendance == "5 - 6 days":
        return 92.5
    elif attendance == "3 -4 days":
        return 72.0
    return 25.0

def map_score(monthly_average: str) -> float:
    if monthly_average == "More than 40.00":
        return 85.0
    elif monthly_average == "Between 25.00 to 40.00":
        return 55.0
    return 20.0

@router.get("")
def list_students(q: str = "", risk: str = "all"):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM students WHERE 1=1"
    params = []
    
    if q:
        query += " AND (name LIKE ? OR id LIKE ?)"
        params.extend([f"%{q}%", f"%{q}%"])
        
    if risk != "all":
        # Handle capitalization differences
        risk_map = {
            "high": "High Risk",
            "medium": "Medium Risk",
            "low": "Low Risk"
        }
        query += " AND risk_level = ?"
        params.append(risk_map.get(risk.lower(), "Low Risk"))
        
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    students_list = []
    for r in rows:
        # Convert DB fields to UI-compatible format
        students_list.append({
            "id": r["id"],
            "name": r["name"],
            "grade": r["grade"],
            "gender": "M" if r["gender"] == "Male" else "F",
            "attendance": int(r["attendance_rate"]),
            "score": int(r["score"]),
            # Map "High Risk" -> "high" for the UI riskColors
            "risk": r["risk_level"].lower().split(" ")[0],
            "avatar": "".join([p[0] for p in r["name"].split(" ") if p])
        })
        
    return students_list

@router.get("/{stu_id}")
def get_student(stu_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM students WHERE id = ?", (stu_id,))
    student = cursor.fetchone()
    
    if not student:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found")
        
    # Fetch student interventions
    cursor.execute("SELECT * FROM interventions WHERE student_id = ?", (stu_id,))
    interv_rows = cursor.fetchall()
    conn.close()
    
    interventions_list = []
    for i in interv_rows:
        interventions_list.append({
            "id": i["id"],
            "action": i["action"],
            "severity": i["severity"],
            "status": i["status"],
            "assigned_by": i["assigned_by"],
            "assigned_date": i["assigned_date"],
            "notes": i["notes"]
        })
        
    top_factors = []
    try:
        top_factors = json.loads(student["top_risk_factors"])
    except:
        pass
        
    return {
        "id": student["id"],
        "name": student["name"],
        "gender": student["gender"],
        "age": student["age"],
        "province": student["province"],
        "grade": student["grade"],
        "living_with": student["living_with"],
        "distance": student["distance"],
        "transport": student["transport"],
        "attendance": student["attendance"],
        "attendance_rate": student["attendance_rate"],
        "monthly_average": student["monthly_average"],
        "score": student["score"],
        "absence": student["absence"],
        "parental_education": student["parental_education"],
        "family_income": student["family_income"],
        "work_support": student["work_support"],
        "external_support": student["external_support"],
        "risk_level": student["risk_level"],
        "dropout_probability": student["dropout_probability"],
        "top_risk_factors": top_factors,
        "interventions": interventions_list
    }

@router.post("")
def add_student(req: CreateStudentRequest):
    # 1. Run ML prediction
    student_input = StudentInput(
        gender=req.gender,
        age=req.age,
        province=req.province,
        living_with=req.living_with,
        distance=req.distance,
        transport=req.transport,
        attendance=req.attendance,
        monthly_average=req.monthly_average,
        absence=req.absence,
        parental_education=req.parental_education,
        family_income=req.family_income,
        work_support=req.work_support,
        external_support=req.external_support
    )
    
    try:
        pred_res = predict_dropout(student_input)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML prediction failed: {str(e)}")
        
    risk_level = pred_res["risk_level"]
    prob = pred_res["dropout_probability"]
    top_factors = json.dumps(pred_res["top_risk_factors"])
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Generate new ID
    cursor.execute("SELECT id FROM students ORDER BY id DESC LIMIT 1")
    last_row = cursor.fetchone()
    if last_row:
        try:
            last_num = int(last_row["id"].split("-")[1])
            new_id = f"STU-{last_num + 1}"
        except:
            new_id = f"STU-{int(datetime.now().timestamp())}"
    else:
        new_id = "STU-1000"
        
    att_rate = map_attendance_rate(req.attendance)
    score = map_score(req.monthly_average)
    
    cursor.execute("""
        INSERT INTO students (
            id, name, gender, age, province, grade, living_with, distance, transport, 
            attendance, attendance_rate, monthly_average, score, absence, 
            parental_education, family_income, work_support, external_support, 
            risk_level, dropout_probability, top_risk_factors
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        new_id, req.name, req.gender, req.age, req.province, req.grade, req.living_with, req.distance, req.transport,
        req.attendance, att_rate, req.monthly_average, score, req.absence,
        req.parental_education, req.family_income, req.work_support, req.external_support,
        risk_level, prob, top_factors
    ))
    
    # 2. Add automatic intervention if needed
    if risk_level == "High Risk":
        cursor.execute("""
            INSERT INTO interventions (student_id, action, severity, status, assigned_by, assigned_date, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            new_id,
            "Immediate counseling and after-school academic tutoring.",
            "high",
            "in_progress",
            "System Automated",
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "System generated flag for High Risk profile on registration."
        ))
    elif risk_level == "Medium Risk":
        cursor.execute("""
            INSERT INTO interventions (student_id, action, severity, status, assigned_by, assigned_date, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            new_id,
            "Bi-weekly counselor check-ins and mentor pairing.",
            "medium",
            "pending",
            "System Automated",
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "System generated flag for Medium Risk profile on registration."
        ))
        
    conn.commit()
    conn.close()
    
    return {
        "success": True,
        "id": new_id,
        "risk_level": risk_level,
        "dropout_probability": prob
    }

@router.delete("/{stu_id}")
def delete_student(stu_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM students WHERE id = ?", (stu_id,))
    student = cursor.fetchone()
    if not student:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found")
        
    cursor.execute("DELETE FROM students WHERE id = ?", (stu_id,))
    conn.commit()
    conn.close()
    return {"success": True, "message": "Student record deleted successfully"}

@router.put("/{stu_id}")
def update_student(stu_id: str, req: CreateStudentRequest):
    student_input = StudentInput(
        gender=req.gender,
        age=req.age,
        province=req.province,
        living_with=req.living_with,
        distance=req.distance,
        transport=req.transport,
        attendance=req.attendance,
        monthly_average=req.monthly_average,
        absence=req.absence,
        parental_education=req.parental_education,
        family_income=req.family_income,
        work_support=req.work_support,
        external_support=req.external_support
    )
    
    try:
        pred_res = predict_dropout(student_input)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML prediction failed: {str(e)}")
        
    risk_level = pred_res["risk_level"]
    prob = pred_res["dropout_probability"]
    top_factors = json.dumps(pred_res["top_risk_factors"])
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM students WHERE id = ?", (stu_id,))
    student = cursor.fetchone()
    if not student:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found")
        
    att_rate = map_attendance_rate(req.attendance)
    score = map_score(req.monthly_average)
    
    cursor.execute("""
        UPDATE students
        SET name = ?, gender = ?, age = ?, province = ?, grade = ?, living_with = ?, 
            distance = ?, transport = ?, attendance = ?, attendance_rate = ?, 
            monthly_average = ?, score = ?, absence = ?, parental_education = ?, 
            family_income = ?, work_support = ?, external_support = ?, 
            risk_level = ?, dropout_probability = ?, top_risk_factors = ?
        WHERE id = ?
    """, (
        req.name, req.gender, req.age, req.province, req.grade, req.living_with,
        req.distance, req.transport, req.attendance, att_rate, req.monthly_average, score,
        req.absence, req.parental_education, req.family_income, req.work_support, req.external_support,
        risk_level, prob, top_factors, stu_id
    ))
    
    conn.commit()
    conn.close()
    
    return {
        "success": True,
        "risk_level": risk_level,
        "dropout_probability": prob
    }
