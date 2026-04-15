from flask import Blueprint, request, jsonify
from models.consultation import (
    create_consultation, add_prescription,
    get_consultation_by_appointment
)

consultations_bp = Blueprint("consultations", __name__)

@consultations_bp.route("/consultations", methods=["POST"])
def save_consultation():
    data           = request.get_json()
    appointment_id = data.get("appointment_id")
    symptoms       = data.get("symptoms", "")
    diagnosis      = data.get("diagnosis", "")
    notes          = data.get("notes", "")
    medicines      = data.get("medicines", [])

    if not appointment_id:
        return jsonify({"error": "appointment_id required"}), 400

    try:
        result = create_consultation(appointment_id, symptoms, diagnosis, notes)
        consultation_id = result["consultation_id"]

        if medicines:
            add_prescription(consultation_id, medicines)

        return jsonify({
            "message":         "Consultation and prescriptions saved",
            "consultation_id": consultation_id
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@consultations_bp.route("/consultations/<int:appointment_id>", methods=["GET"])
def get_consultation(appointment_id):
    try:
        data = get_consultation_by_appointment(appointment_id)
        if not data:
            return jsonify({"error": "No consultation found"}), 404
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500