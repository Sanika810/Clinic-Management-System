from db.connection import get_connection

def create_appointment(patient_id, doctor_id, appt_date, time_slot):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO APPOINTMENTS (patient_id, doctor_id, appt_date, time_slot)
            VALUES (:1, :2, TO_DATE(:3,'YYYY-MM-DD'), :4)
        """, [patient_id, doctor_id, appt_date, time_slot])
        conn.commit()
        return {"message": "Appointment booked successfully"}
    except Exception as e:
        conn.rollback()
        err = str(e)
        if "ORA-20001" in err or "ORA-00001" in err:
            raise Exception("Slot already booked. Please choose another time.")
        raise Exception(err)
    finally:
        cursor.close()
        conn.close()

def get_appointments_by_patient(patient_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT a.appointment_id, u.full_name AS doctor_name,
                   dept.dept_name, a.appt_date, a.time_slot, a.status
            FROM APPOINTMENTS a
            JOIN DOCTORS d       ON a.doctor_id      = d.doctor_id
            JOIN USERS u         ON d.user_id         = u.user_id
            JOIN DEPARTMENTS dept ON d.department_id  = dept.department_id
            WHERE a.patient_id = :1
            ORDER BY a.appt_date DESC
        """, [patient_id])
        cols = ["appointment_id","doctor_name","dept_name","appt_date","time_slot","status"]
        rows = cursor.fetchall()
        result = []
        for row in rows:
            r = dict(zip(cols, row))
            r["appt_date"] = str(r["appt_date"])[:10] if r["appt_date"] else ""
            result.append(r)
        return result
    finally:
        cursor.close()
        conn.close()

def get_appointments_by_doctor(doctor_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT a.appointment_id, p.full_name AS patient_name,
                   p.phone, a.appt_date, a.time_slot, a.status
            FROM APPOINTMENTS a
            JOIN PATIENTS p ON a.patient_id = p.patient_id
            WHERE a.doctor_id = :1
            ORDER BY a.appt_date DESC
        """, [doctor_id])
        cols = ["appointment_id","patient_name","phone","appt_date","time_slot","status"]
        rows = cursor.fetchall()
        result = []
        for row in rows:
            r = dict(zip(cols, row))
            r["appt_date"] = str(r["appt_date"])[:10] if r["appt_date"] else ""
            result.append(r)
        return result
    finally:
        cursor.close()
        conn.close()

        
def get_all_appointments():
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT a.appointment_id, p.full_name AS patient_name,
                   u.full_name AS doctor_name, a.appt_date, a.time_slot, a.status
            FROM APPOINTMENTS a
            JOIN PATIENTS p ON a.patient_id = p.patient_id
            JOIN DOCTORS d  ON a.doctor_id  = d.doctor_id
            JOIN USERS u    ON d.user_id    = u.user_id
            ORDER BY a.appt_date DESC
        """)
        cols = ["appointment_id","patient_name","doctor_name","appt_date","time_slot","status"]
        rows = cursor.fetchall()
        result = []
        for row in rows:
            r = dict(zip(cols, row))
            r["appt_date"] = str(r["appt_date"])[:10] if r["appt_date"] else ""
            result.append(r)
        return result
    finally:
        cursor.close()
        conn.close()

def update_appointment_status(appointment_id, status):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE APPOINTMENTS SET status = :1 WHERE appointment_id = :2
        """, [status, appointment_id])
        conn.commit()
        return {"message": "Status updated"}
    except Exception as e:
        conn.rollback()
        raise Exception(str(e))
    finally:
        cursor.close()
        conn.close()