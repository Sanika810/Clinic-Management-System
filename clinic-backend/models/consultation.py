from db.connection import get_connection

def create_consultation(appointment_id, symptoms, diagnosis, notes):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        con_id_var = cursor.var(int)
        cursor.execute("""
            INSERT INTO CONSULTATIONS (appointment_id, symptoms, diagnosis, notes)
            VALUES (:1, :2, :3, :4)
            RETURNING consultation_id INTO :5
        """, [appointment_id, symptoms, diagnosis, notes, con_id_var])

        cursor.execute("""
            UPDATE APPOINTMENTS SET status = 'Completed'
            WHERE appointment_id = :1
        """, [appointment_id])

        conn.commit()
        return {"message": "Consultation saved", "consultation_id": con_id_var.getvalue()[0]}
    except Exception as e:
        conn.rollback()
        raise Exception(str(e))
    finally:
        cursor.close()
        conn.close()

def add_prescription(consultation_id, medicines):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        for med in medicines:
            cursor.execute("""
                INSERT INTO PRESCRIPTIONS
                  (consultation_id, medicine_name, dosage, frequency, duration)
                VALUES (:1, :2, :3, :4, :5)
            """, [
                consultation_id,
                med["medicine_name"],
                med["dosage"],
                med["frequency"],
                med["duration"]
            ])
        conn.commit()
        return {"message": "Prescriptions saved"}
    except Exception as e:
        conn.rollback()
        raise Exception(str(e))
    finally:
        cursor.close()
        conn.close()

def get_consultation_by_appointment(appointment_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT consultation_id, symptoms, diagnosis, notes, consulted_at
            FROM CONSULTATIONS WHERE appointment_id = :1
        """, [appointment_id])
        cols = ["consultation_id","symptoms","diagnosis","notes","consulted_at"]
        row = cursor.fetchone()
        if not row:
            return None
        consultation = dict(zip(cols, row))
        consultation["consulted_at"] = str(consultation["consulted_at"])[:19]

        cursor.execute("""
            SELECT prescription_id, medicine_name, dosage, frequency, duration
            FROM PRESCRIPTIONS WHERE consultation_id = :1
        """, [consultation["consultation_id"]])
        pcols = ["prescription_id","medicine_name","dosage","frequency","duration"]
        prows = cursor.fetchall()
        consultation["prescriptions"] = [dict(zip(pcols, pr)) for pr in prows]
        return consultation
    finally:
        cursor.close()
        conn.close()