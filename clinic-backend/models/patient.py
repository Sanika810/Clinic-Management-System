from db.connection import get_connection

def get_all_patients():
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT patient_id, full_name, dob, gender, phone, address, blood_group, created_at
            FROM PATIENTS ORDER BY patient_id
        """)
        cols = ["patient_id","full_name","dob","gender","phone","address","blood_group","created_at"]
        rows = cursor.fetchall()
        return [dict(zip(cols, row)) for row in rows]
    finally:
        cursor.close()
        conn.close()

def get_patient_by_user(user_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT patient_id, full_name, dob, gender, phone, address, blood_group
            FROM PATIENTS WHERE user_id = :1
        """, [user_id])
        cols = ["patient_id","full_name","dob","gender","phone","address","blood_group"]
        row = cursor.fetchone()
        return dict(zip(cols, row)) if row else None
    finally:
        cursor.close()
        conn.close()

def create_patient(data, user_id=None):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO PATIENTS (user_id, full_name, dob, gender, phone, address, blood_group)
            VALUES (:1, :2, TO_DATE(:3,'YYYY-MM-DD'), :4, :5, :6, :7)
        """, [
            user_id,
            data.get("full_name",""),
            data.get("dob","2000-01-01"),
            data.get("gender","Other"),
            data.get("phone",""),
            data.get("address",""),
            data.get("blood_group","")
        ])
        conn.commit()
        return {"message": "Patient registered successfully"}
    except Exception as e:
        conn.rollback()
        raise Exception(str(e))
    finally:
        cursor.close()
        conn.close()