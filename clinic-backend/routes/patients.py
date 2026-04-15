from flask import Blueprint, request, jsonify
from models.patient import get_all_patients, create_patient

patients_bp = Blueprint("patients", __name__)

@patients_bp.route("/patients", methods=["GET"])
def list_patients():
    try:
        patients = get_all_patients()
        for p in patients:
            if p.get("dob"):      p["dob"]        = str(p["dob"])[:10]
            if p.get("created_at"): p["created_at"] = str(p["created_at"])[:19]
        return jsonify(patients), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@patients_bp.route("/patients", methods=["POST"])
def add_patient():
    data    = request.get_json()
    user_id = data.get("user_id")
    try:
        result = create_patient(data, user_id)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400