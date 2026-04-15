from flask import Blueprint, request, jsonify
from models.user import find_user_by_email, verify_password, create_user
from models.patient import get_patient_by_user
from models.doctor import get_doctor_by_user

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data     = request.get_json()
    email    = data.get("email","").strip()
    password = data.get("password","").strip()

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    user = find_user_by_email(email)
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    if not verify_password(password, user["password_hash"]):
        return jsonify({"error": "Invalid email or password"}), 401

    response = {
        "user_id":   user["user_id"],
        "full_name": user["full_name"],
        "email":     user["email"],
        "role":      user["role"]
    }

    # Attach patient_id for patients
    if user["role"] == "patient":
        try:
            patient = get_patient_by_user(user["user_id"])
            if patient:
                response["patient_id"] = patient["patient_id"]
        except Exception as e:
            print(f"Warning: could not get patient_id: {e}")

    # Attach doctor_id for doctors
    if user["role"] == "doctor":
        try:
            doctor_id = get_doctor_by_user(user["user_id"])
            if doctor_id:
                response["doctor_id"] = doctor_id
        except Exception as e:
            print(f"Warning: could not get doctor_id: {e}")

    return jsonify(response), 200


@auth_bp.route("/register", methods=["POST"])
def register():
    data      = request.get_json()
    full_name = data.get("full_name","").strip()
    email     = data.get("email","").strip()
    password  = data.get("password","").strip()
    role      = data.get("role","patient").strip()

    if not full_name or not email or not password:
        return jsonify({"error": "All fields required"}), 400

    if role not in ["admin","doctor","patient","staff"]:
        return jsonify({"error": "Invalid role"}), 400

    try:
        result = create_user(full_name, email, password, role)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400