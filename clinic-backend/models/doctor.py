from db.connection import get_connection

def get_all_doctors():
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT d.doctor_id, u.full_name, dept.dept_name,
                   d.specialization, d.phone, d.fee
            FROM DOCTORS d
            JOIN USERS u       ON d.user_id       = u.user_id
            JOIN DEPARTMENTS dept ON d.department_id = dept.department_id
            ORDER BY d.doctor_id
        """)
        cols = ["doctor_id","full_name","dept_name","specialization","phone","fee"]
        rows = cursor.fetchall()
        return [dict(zip(cols, row)) for row in rows]
    finally:
        cursor.close()
        conn.close()

def get_doctor_by_user(user_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT doctor_id FROM DOCTORS WHERE user_id = :1
        """, [user_id])
        row = cursor.fetchone()
        return row[0] if row else None
    finally:
        cursor.close()
        conn.close()

def get_doctor_schedule(doctor_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT schedule_id, day_of_week, start_time, end_time
            FROM SCHEDULES WHERE doctor_id = :1
            ORDER BY schedule_id
        """, [doctor_id])
        cols = ["schedule_id","day_of_week","start_time","end_time"]
        rows = cursor.fetchall()
        return [dict(zip(cols, row)) for row in rows]
    finally:
        cursor.close()
        conn.close()

def get_booked_slots(doctor_id, date_str):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT time_slot FROM APPOINTMENTS
            WHERE doctor_id = :1
              AND appt_date = TO_DATE(:2,'YYYY-MM-DD')
              AND status   != 'Cancelled'
        """, [doctor_id, date_str])
        rows = cursor.fetchall()
        return [row[0] for row in rows]
    finally:
        cursor.close()
        conn.close()