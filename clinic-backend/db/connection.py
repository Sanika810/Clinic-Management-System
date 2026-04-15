import oracledb

DB_USER     = "system"
DB_PASSWORD = "sanika123"
DB_DSN      = "localhost:1521/XE"

def get_connection():
    try:
        conn = oracledb.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            dsn=DB_DSN
        )
        return conn
    except Exception as e:
        raise Exception(f"Database connection failed: {str(e)}")