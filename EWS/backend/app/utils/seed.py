import sys
import os
import random
import json
from datetime import datetime

# Add the EWS/backend folder to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.utils.db import get_db_connection, init_db
from app.services.prediction_service import predict_dropout
from app.schemas.student_schema import StudentInput

def seed_db():
    print("Initializing database...")
    init_db()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Seed users
    print("Seeding users...")
    # Clear existing users
    cursor.execute("DELETE FROM users")
    
    users_data = [
        ("admin", "admin123", "admin", "System Administrator"),
        ("teacher", "teacher123", "teacher", "Sok Sophea (Teacher)"),
        ("counselor", "counselor123", "counselor", "Vannak Chan (Counselor)")
    ]
    
    for username, password, role, name in users_data:
        # Simple plain password hash or simulated hash
        password_hash = f"sha256_simulated_{password}"
        cursor.execute(
            "INSERT INTO users (username, password_hash, role, name) VALUES (?, ?, ?, ?)",
            (username, password_hash, role, name)
        )
    
    # 2. Seed students
    print("Seeding students using LightGBM predictions...")
    cursor.execute("DELETE FROM students")
    cursor.execute("DELETE FROM interventions")
    cursor.execute("DELETE FROM predictions_log")
    
    names = [
        "Sok Pisey", "Chan Dara", "Ratha Mey", "Vannak Heng", "Bopha Lim",
        "Sokha Kim", "Sothea Nov", "Channary Pen", "Kosal Tep", "Mealea Sun",
        "Phally Rin", "Sokunthea Va", "Borey Chea", "Sreyleak Ouk", "Visal Kong",
        "Theary Mok", "Rithy Sam", "Dara Suon", "Nita Por", "Sopheak Yim"
    ]
    
    # Deterministic attributes generation for diversity
    provinces = ["Phnom Penh", "Kandal", "Kampot", "Takeo", "Battambang", "Kampong Cham", "Siem Reap", "Prey Veng"]
    living_with_options = ["Both parents", "One parent", "Guardians/Relatives"]
    distance_options = ["Less than 1km", "between 1km-5km", "More than 5km"]
    transport_options = ["Motorbike", "Bicycle", "Walk", "Car"]
    attendance_options = ["5 - 6 days", "3 -4 days", "0 - 2 days"]
    monthly_avg_options = ["More than 40.00", "Between 25.00 to 40.00", "Less than 25.00"]
    absence_options = ["Never", "Rarely", "Sometimes", "Often"]
    parental_edu_options = ["No education", "Primary school", "Secondary School", "High School", "Higher education"]
    
    for i, name in enumerate(names):
        random.seed(i)  # keep it deterministic for runs
        
        gender = "Female" if i % 2 == 1 else "Male"
        age = random.randint(14, 19)
        province = provinces[i % len(provinces)]
        living_with = living_with_options[i % len(living_with_options)]
        distance = distance_options[i % len(distance_options)]
        transport = transport_options[i % len(transport_options)]
        
        # Design different risk profiles for test variety
        if i in [0, 4, 12, 14]: # High risk profiles
            attendance = "0 - 2 days"
            absence = "Often"
            monthly_average = "Less than 25.00"
            family_income = "Low"
            work_support = "Yes"
            external_support = "No"
            parental_education = "No education"
            attendance_rate = random.randint(20, 45)
            score = random.randint(15, 30)
        elif i in [2, 7, 9, 17]: # Medium risk profiles
            attendance = "3 -4 days"
            absence = "Sometimes"
            monthly_average = "Between 25.00 to 40.00"
            family_income = "Low"
            work_support = "No"
            external_support = "Yes"
            parental_education = "Primary school"
            attendance_rate = random.randint(65, 80)
            score = random.randint(45, 60)
        else: # Low risk profiles
            attendance = "5 - 6 days"
            absence = "Never" if i % 3 == 0 else "Rarely"
            monthly_average = "More than 40.00"
            family_income = "Medium"
            work_support = "No"
            external_support = "No"
            parental_education = "High School"
            attendance_rate = random.randint(85, 99)
            score = random.randint(70, 95)
            
        grade = (i % 3) + 7 # Grade 7, 8, or 9
        
        # Build StudentInput schema
        student_input = StudentInput(
            gender=gender,
            age=age,
            province=province,
            living_with=living_with,
            distance=distance,
            transport=transport,
            attendance=attendance,
            monthly_average=monthly_average,
            absence=absence,
            parental_education=parental_education,
            family_income=family_income,
            work_support=work_support,
            external_support=external_support
        )
        
        # Run ML model prediction
        pred_res = predict_dropout(student_input)
        risk_level = pred_res["risk_level"]
        prob = pred_res["dropout_probability"]
        top_factors = json.dumps(pred_res["top_risk_factors"])
        
        stu_id = f"STU-{1000 + i}"
        
        cursor.execute("""
            INSERT INTO students (
                id, name, gender, age, province, grade, living_with, distance, transport, 
                attendance, attendance_rate, monthly_average, score, absence, 
                parental_education, family_income, work_support, external_support, 
                risk_level, dropout_probability, top_risk_factors
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            stu_id, name, gender, age, province, grade, living_with, distance, transport,
            attendance, attendance_rate, monthly_average, score, absence,
            parental_education, family_income, work_support, external_support,
            risk_level, prob, top_factors
        ))
        
        # 3. Add default intervention for medium/high risk students
        if risk_level == "High Risk":
            cursor.execute("""
                INSERT INTO interventions (student_id, action, severity, status, assigned_by, assigned_date, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                stu_id,
                "Immediate counseling and after-school academic tutoring.",
                "high",
                "in_progress",
                "Teacher Sok Sophea",
                datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Student exhibits very high absence rates and low monthly grades. Parents contacted."
            ))
        elif risk_level == "Medium Risk":
            cursor.execute("""
                INSERT INTO interventions (student_id, action, severity, status, assigned_by, assigned_date, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                stu_id,
                "Bi-weekly counselor check-ins and mentor pairing.",
                "medium",
                "pending",
                "Teacher Sok Sophea",
                datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Attendance has declined recently. Monitor closely."
            ))

    conn.commit()
    conn.close()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_db()
