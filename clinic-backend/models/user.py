import bcrypt
import hashlib
from db.connection import get_connection

def find_user_by_email(email):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """SELECT user_id, full_name, email, password_hash, role
               FROM USERS WHERE email = :1""",
            [email]
        )
        row = cursor.fetchone()
        if row:
            return {
                "user_id":       row[0],
                "full_name":     row[1],
                "email":         row[2],
                "password_hash": row[3],
                "role":          row[4]
            }
        return None
    finally:
        cursor.close()
        conn.close()

def create_user(full_name, email, password, role):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        hashed = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        cursor.execute(
            """INSERT INTO USERS (full_name, email, password_hash, role)
               VALUES (:1, :2, :3, :4)""",
            [full_name, email, hashed, role]
        )
        conn.commit()
        return {"message": "User created successfully"}
    except Exception as e:
        conn.rollback()
        raise Exception("Email already exists" if "ORA-00001" in str(e) else str(e))
    finally:
        cursor.close()
        conn.close()

def verify_password(plain_password, hashed_password):
    hashed_password = hashed_password.strip()

    # bcrypt (newly registered users)
    if hashed_password.startswith("$2b$") or hashed_password.startswith("$2a$"):
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )

    # SHA-256 (seeded users)
    sha256 = hashlib.sha256(plain_password.encode("utf-8")).hexdigest()
    return sha256 == hashed_password