from db.connection import get_connection

def get_bills_by_patient(patient_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT b.bill_id, b.appointment_id, u.full_name AS doctor_name,
                   a.appt_date, a.time_slot, b.amount, b.status, b.generated_at
            FROM BILLING b
            JOIN APPOINTMENTS a ON b.appointment_id = a.appointment_id
            JOIN DOCTORS d      ON a.doctor_id       = d.doctor_id
            JOIN USERS u        ON d.user_id          = u.user_id
            WHERE b.patient_id = :1
            ORDER BY b.generated_at DESC
        """, [patient_id])
        cols = ["bill_id","appointment_id","doctor_name","appt_date","time_slot","amount","status","generated_at"]
        rows = cursor.fetchall()
        result = []
        for row in rows:
            r = dict(zip(cols, row))
            r["appt_date"]    = str(r["appt_date"])[:10]
            r["generated_at"] = str(r["generated_at"])[:19]
            r["amount"]       = float(r["amount"])
            result.append(r)
        return result
    finally:
        cursor.close()
        conn.close()

def get_all_bills():
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT b.bill_id, p.full_name AS patient_name,
                   u.full_name AS doctor_name, a.appt_date,
                   b.amount, b.status, b.generated_at
            FROM BILLING b
            JOIN APPOINTMENTS a ON b.appointment_id = a.appointment_id
            JOIN PATIENTS p     ON b.patient_id      = p.patient_id
            JOIN DOCTORS d      ON a.doctor_id        = d.doctor_id
            JOIN USERS u        ON d.user_id           = u.user_id
            ORDER BY b.generated_at DESC
        """)
        cols = ["bill_id","patient_name","doctor_name","appt_date","amount","status","generated_at"]
        rows = cursor.fetchall()
        result = []
        for row in rows:
            r = dict(zip(cols, row))
            r["appt_date"]    = str(r["appt_date"])[:10]
            r["generated_at"] = str(r["generated_at"])[:19]
            r["amount"]       = float(r["amount"])
            result.append(r)
        return result
    finally:
        cursor.close()
        conn.close()

def update_bill_status(bill_id, status):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE BILLING SET status = :1 WHERE bill_id = :2
        """, [status, bill_id])
        conn.commit()
        return {"message": "Bill status updated"}
    except Exception as e:
        conn.rollback()
        raise Exception(str(e))
    finally:
        cursor.close()
        conn.close()