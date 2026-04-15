from db.connection import get_connection

def create_payment(bill_id, patient_id, amount, payment_mode):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Insert payment record
        cursor.execute("""
            INSERT INTO PAYMENTS (bill_id, patient_id, amount, payment_mode, payment_status)
            VALUES (:1, :2, :3, :4, 'Paid')
        """, [bill_id, patient_id, amount, payment_mode])

        # Update billing status to Paid
        cursor.execute("""
            UPDATE BILLING SET status = 'Paid' WHERE bill_id = :1
        """, [bill_id])

        conn.commit()
        return {"message": "Payment successful"}
    except Exception as e:
        conn.rollback()
        raise Exception(str(e))
    finally:
        cursor.close()
        conn.close()

def get_all_payments():
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT
                pay.payment_id,
                p.full_name   AS patient_name,
                u.full_name   AS doctor_name,
                a.appt_date,
                pay.amount,
                pay.payment_mode,
                pay.payment_status,
                pay.paid_at,
                b.bill_id
            FROM PAYMENTS pay
            JOIN BILLING b      ON pay.bill_id      = b.bill_id
            JOIN APPOINTMENTS a ON b.appointment_id = a.appointment_id
            JOIN PATIENTS p     ON pay.patient_id   = p.patient_id
            JOIN DOCTORS d      ON a.doctor_id      = d.doctor_id
            JOIN USERS u        ON d.user_id        = u.user_id
            ORDER BY pay.paid_at DESC
        """)
        cols = ["payment_id","patient_name","doctor_name","appt_date",
                "amount","payment_mode","payment_status","paid_at","bill_id"]
        rows = cursor.fetchall()
        result = []
        for row in rows:
            r = dict(zip(cols, row))
            r["appt_date"] = str(r["appt_date"])[:10]
            r["paid_at"]   = str(r["paid_at"])[:19]
            r["amount"]    = float(r["amount"])
            result.append(r)
        return result
    finally:
        cursor.close()
        conn.close()

def get_payments_by_patient(patient_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT
                pay.payment_id,
                u.full_name  AS doctor_name,
                a.appt_date,
                pay.amount,
                pay.payment_mode,
                pay.payment_status,
                pay.paid_at,
                b.bill_id
            FROM PAYMENTS pay
            JOIN BILLING b      ON pay.bill_id      = b.bill_id
            JOIN APPOINTMENTS a ON b.appointment_id = a.appointment_id
            JOIN DOCTORS d      ON a.doctor_id      = d.doctor_id
            JOIN USERS u        ON d.user_id        = u.user_id
            WHERE pay.patient_id = :1
            ORDER BY pay.paid_at DESC
        """, [patient_id])
        cols = ["payment_id","doctor_name","appt_date","amount",
                "payment_mode","payment_status","paid_at","bill_id"]
        rows = cursor.fetchall()
        result = []
        for row in rows:
            r = dict(zip(cols, row))
            r["appt_date"] = str(r["appt_date"])[:10]
            r["paid_at"]   = str(r["paid_at"])[:19]
            r["amount"]    = float(r["amount"])
            result.append(r)
        return result
    finally:
        cursor.close()
        conn.close()