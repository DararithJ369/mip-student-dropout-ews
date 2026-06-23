from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.utils.db import get_db_connection
import json
import re

router = APIRouter(prefix="/assistant", tags=["Assistant"])

class AssistantRequest(BaseModel):
    message: str

# Supported provinces in database
KNOWN_PROVINCES = [
    "Phnom Penh", "Kandal", "Kampot", "Takeo", "Battambang", 
    "Kampong Cham", "Siem Reap", "Prey Veng", "Banteay Meanchey", 
    "Kampong Thom", "Pursat", "Svay Rieng", "Kep", "Koh Kong",
    "Kampong Chhnang", "Kampong Speu", "Kratié", "Mondulkiri", 
    "Preah Vihear", "Ratanakiri", "Preah Sihanouk", "Stung Treng", 
    "Otdar Meanchey", "Pailin", "Tboung Khmum"
]

@router.post("")
def ask_assistant(req: AssistantRequest):
    query_text = req.message.lower().strip()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    reply = ""
    structured_data = None
    
    try:
        # 1. Total Student Count
        if any(k in query_text for k in ["total students", "how many students", "number of students", "student count", "total profiles"]):
            cursor.execute("SELECT COUNT(*) FROM students")
            total = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM students WHERE gender = 'Male'")
            males = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM students WHERE gender = 'Female'")
            females = cursor.fetchone()[0]
            
            cursor.execute("SELECT AVG(age) FROM students")
            avg_age = cursor.fetchone()[0] or 0.0
            
            reply = (
                f"There are currently **{total}** students registered in the EduGuard EWS database. "
                f"The student body consists of **{males}** male students and **{females}** female students, "
                f"with an average student age of **{round(avg_age, 1)}** years."
            )
            structured_data = {
                "type": "kpi",
                "total": total,
                "males": males,
                "females": females,
                "avg_age": round(avg_age, 1)
            }
            
        # 2. High Risk / At Risk students list
        elif any(k in query_text for k in ["high risk", "at risk", "at-risk", "critical", "danger", "highest risk"]):
            cursor.execute("SELECT COUNT(*) FROM students WHERE risk_level = 'High Risk'")
            high_count = cursor.fetchone()[0]
            
            cursor.execute("""
                SELECT id, name, gender, province, grade, dropout_probability 
                FROM students 
                WHERE risk_level = 'High Risk' 
                ORDER BY dropout_probability DESC 
                LIMIT 5
            """)
            rows = cursor.fetchall()
            
            students_list = []
            for r in rows:
                students_list.append({
                    "id": r[0],
                    "name": r[1],
                    "gender": r[2],
                    "province": r[3],
                    "grade": r[4],
                    "risk": f"{round(r[5] * 100, 1)}%"
                })
            
            reply = f"I found **{high_count}** students classified as **High Risk** of dropout. "
            if high_count > 0:
                reply += "Here are the top 5 students requiring immediate intervention:\n\n"
                for idx, s in enumerate(students_list, 1):
                    reply += f"{idx}. **{s['name']}** (Grade {s['grade']}, {s['province']}) — **{s['risk']}** dropout probability.\n"
                reply += "\nI suggest assigning support interventions for these profiles."
            else:
                reply += "The EWS model has not flagged any student as critical at the moment!"
            
            structured_data = {
                "type": "students",
                "risk_level": "High Risk",
                "count": high_count,
                "list": students_list
            }

        # 3. Medium Risk / Warning list
        elif any(k in query_text for k in ["medium risk", "medium-risk", "warning", "moderate"]):
            cursor.execute("SELECT COUNT(*) FROM students WHERE risk_level = 'Medium Risk'")
            med_count = cursor.fetchone()[0]
            
            cursor.execute("""
                SELECT id, name, gender, province, grade, dropout_probability 
                FROM students 
                WHERE risk_level = 'Medium Risk' 
                ORDER BY dropout_probability DESC 
                LIMIT 5
            """)
            rows = cursor.fetchall()
            
            students_list = []
            for r in rows:
                students_list.append({
                    "id": r[0],
                    "name": r[1],
                    "gender": r[2],
                    "province": r[3],
                    "grade": r[4],
                    "risk": f"{round(r[5] * 100, 1)}%"
                })
            
            reply = f"I found **{med_count}** students classified as **Medium Risk (Warning)**. "
            if med_count > 0:
                reply += "Here is a list of the top 5 warning cases:\n\n"
                for idx, s in enumerate(students_list, 1):
                    reply += f"{idx}. **{s['name']}** (Grade {s['grade']}, {s['province']}) — **{s['risk']}** risk level.\n"
            else:
                reply += "No students are currently in the Medium Risk warning band."
                
            structured_data = {
                "type": "students",
                "risk_level": "Medium Risk",
                "count": med_count,
                "list": students_list
            }

        # 4. Low Risk / Safe counts
        elif any(k in query_text for k in ["low risk", "low-risk", "safe", "no risk", "healthy"]):
            cursor.execute("SELECT COUNT(*) FROM students WHERE risk_level = 'Low Risk'")
            low_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM students")
            total = cursor.fetchone()[0]
            
            pct = round((low_count / total) * 100, 1) if total > 0 else 0
            
            reply = f"There are **{low_count}** students classified as **Safe / Low Risk** (which represents **{pct}%** of all students)."
            structured_data = {
                "type": "kpi",
                "risk_level": "Low Risk",
                "count": low_count,
                "percentage": pct
            }

        # 5. Province Specific Queries
        elif any(prov.lower() in query_text for prov in KNOWN_PROVINCES):
            matched_province = None
            for prov in KNOWN_PROVINCES:
                if prov.lower() in query_text:
                    matched_province = prov
                    break
                    
            cursor.execute("SELECT COUNT(*) FROM students WHERE LOWER(province) = ?", (matched_province.lower(),))
            prov_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT AVG(dropout_probability) FROM students WHERE LOWER(province) = ?", (matched_province.lower(),))
            avg_prob = cursor.fetchone()[0] or 0.0
            
            cursor.execute("SELECT COUNT(*) FROM students WHERE LOWER(province) = ? AND risk_level = 'High Risk'", (matched_province.lower(),))
            prov_high = cursor.fetchone()[0]
            
            cursor.execute("""
                SELECT name, score, attendance_rate, risk_level 
                FROM students 
                WHERE LOWER(province) = ? 
                ORDER BY dropout_probability DESC 
                LIMIT 3
            """, (matched_province.lower(),))
            rows = cursor.fetchall()
            
            students_list = []
            for r in rows:
                students_list.append({
                    "name": r[0],
                    "score": r[1],
                    "attendance": f"{round(r[2], 1)}%",
                    "risk": r[3]
                })
                
            reply = (
                f"**Geographic Report for {matched_province}**:\n\n"
                f"• Total Students Registered: **{prov_count}**\n"
                f"• Average Dropout Risk Probability: **{round(avg_prob * 100, 1)}%**\n"
                f"• High Dropout Risk Profiles: **{prov_high}** student(s)\n\n"
            )
            
            if prov_count > 0:
                reply += f"Top student cases monitored in {matched_province}:\n"
                for idx, s in enumerate(students_list, 1):
                    reply += f"• **{s['name']}** (Score: {s['score']}, Attendance: {s['attendance']}) — status: *{s['risk']}*\n"
            else:
                reply += "No student records are currently assigned to this region."
                
            structured_data = {
                "type": "province_stats",
                "province": matched_province,
                "count": prov_count,
                "avg_risk": round(avg_prob * 100, 1),
                "high_risk": prov_high,
                "list": students_list
            }

        # 6. Attendance Rates
        elif any(k in query_text for k in ["attendance", "absent", "absence", "missed class"]):
            # Check if grade-specific
            grade_match = re.search(r'(g|grade\s*)(7|8|9)', query_text)
            if grade_match:
                grade_num = int(grade_match.group(2))
                cursor.execute("SELECT AVG(attendance_rate) FROM students WHERE grade = ?", (grade_num,))
                avg_att = cursor.fetchone()[0] or 0.0
                reply = f"The average class attendance rate for **Grade {grade_num}** is **{round(avg_att, 1)}%**."
            else:
                cursor.execute("SELECT AVG(attendance_rate) FROM students")
                avg_att = cursor.fetchone()[0] or 0.0
                
                cursor.execute("""
                    SELECT name, attendance_rate, risk_level 
                    FROM students 
                    ORDER BY attendance_rate ASC 
                    LIMIT 3
                """)
                rows = cursor.fetchall()
                worst_attendance = []
                for r in rows:
                    worst_attendance.append({
                        "name": r[0],
                        "attendance": f"{round(r[1], 1)}%",
                        "risk": r[2]
                    })
                    
                reply = (
                    f"The overall school attendance rate is **{round(avg_att, 1)}%**.\n\n"
                    f"The students with the **lowest attendance rates** are:\n"
                )
                for s in worst_attendance:
                    reply += f"• **{s['name']}** ({s['attendance']} attendance) — flagged as *{s['risk']}*\n"
                    
            structured_data = {
                "type": "attendance",
                "average": round(avg_att, 1)
            }

        # 7. Academic Scores / Grades
        elif any(k in query_text for k in ["score", "scores", "academic", "performance", "grades", "marks"]):
            cursor.execute("SELECT AVG(score) FROM students")
            avg_score = cursor.fetchone()[0] or 0.0
            
            cursor.execute("""
                SELECT name, score, attendance_rate, risk_level 
                FROM students 
                ORDER BY score ASC 
                LIMIT 3
            """)
            rows = cursor.fetchall()
            worst_scores = []
            for r in rows:
                worst_scores.append({
                    "name": r[0],
                    "score": r[1],
                    "attendance": f"{round(r[2], 1)}%",
                    "risk": r[3]
                })
                
            reply = (
                f"The average class score is **{round(avg_score, 1)}/100**.\n\n"
                f"The students with the **lowest academic averages** are:\n"
            )
            for s in worst_scores:
                reply += f"• **{s['name']}** (Score: {s['score']}, Attendance: {s['attendance']}) — status: *{s['risk']}*\n"
                
            structured_data = {
                "type": "academic",
                "average": round(avg_score, 1)
            }

        # 8. Interventions
        elif any(k in query_text for k in ["intervention", "support", "action plan", "resolved", "pending"]):
            cursor.execute("SELECT COUNT(*) FROM interventions")
            total = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM interventions WHERE status = 'Resolved'")
            resolved = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM interventions WHERE status = 'Pending'")
            pending = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM interventions WHERE status = 'In Progress'")
            in_progress = cursor.fetchone()[0]
            
            reply = (
                f"A total of **{total}** support interventions have been logged in the EWS database.\n\n"
                f"• **{resolved}** cases are successfully **Resolved** ✅\n"
                f"• **{in_progress}** cases are currently **In Progress** 🔄\n"
                f"• **{pending}** cases are **Pending** counselor action ⏳"
            )
            structured_data = {
                "type": "interventions",
                "total": total,
                "resolved": resolved,
                "pending": pending,
                "in_progress": in_progress
            }

        # 9. SHAP Risk Factors Analysis
        elif any(k in query_text for k in ["factor", "factors", "why", "reason", "cause", "causes", "risk factor", "shap"]):
            cursor.execute("SELECT top_risk_factors FROM students WHERE risk_level = 'High Risk'")
            rows = cursor.fetchall()
            
            factor_counts = {}
            for r in rows:
                try:
                    factors = json.loads(r[0])
                    for f in factors:
                        # Extract factor name (can be dict or string)
                        name = f if isinstance(f, str) else f.get("factor", str(f))
                        factor_counts[name] = factor_counts.get(name, 0) + 1
                except Exception:
                    pass
            
            sorted_factors = sorted(factor_counts.items(), key=lambda x: x[1], reverse=True)[:5]
            
            reply = "Based on machine learning SHAP explanations, the **most frequent risk factors** contributing to student dropout across high-risk profiles are:\n\n"
            for idx, (f, count) in enumerate(sorted_factors, 1):
                reply += f"{idx}. **{f}** (flags present in {count} high-risk students)\n"
            reply += "\nAddressing these core factors (e.g. low attendance, long travel distance) will yield the highest prevention success rates."
            
            structured_data = {
                "type": "risk_factors",
                "list": [{"factor": f, "count": c} for f, c in sorted_factors]
            }

        # 10. Fallback help message / greetings
        else:
            reply = (
                "Hello! I am the **EduGuard AI Assistant**. I can query the student early warning database to retrieve live indicators and summaries.\n\n"
                "Here are some examples of what you can ask me:\n"
                "• **Student Counts**: *'How many students do we have?'*\n"
                "• **Risk Levels**: *'Show high risk students'* or *'How many low risk students?'*\n"
                "• **Geographic Risk**: *'What is the risk in Kampot?'* or *'stats for Takeo'*\n"
                "• **Attendance Trends**: *'Show average class attendance'* or *'lowest attendance students'*\n"
                "• **Academic Performance**: *'What is the average class score?'*\n"
                "• **Interventions**: *'How many pending interventions?'*\n"
                "• **Risk Factors**: *'What are the most common risk factors?'*\n\n"
                "How can I support you today?"
            )
            structured_data = {
                "type": "help"
            }
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database aggregation error: {str(e)}")
    finally:
        conn.close()
        
    return {
        "response": reply,
        "data": structured_data
    }
