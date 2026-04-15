from flask import Blueprint, request, jsonify
from models.appointment import (
    create_appointment, get_appointments_by_patient,
    get_appointments_by_doctor, get_all_appointments,
    update_appointment_status
)

appointments_bp = Blueprint("appointments", __name__)

@appointments_bp.route("/appointments", methods=["POST"])
def book_appointment():
    data = request.get_json()
    patient_id = data.get("patient_id")
    doctor_id  = data.get("doctor_id")
    appt_date  = data.get("appt_date")
    time_slot  = data.get("time_slot")

    if not all([patient_id, doctor_id, appt_date, time_slot]):
        return jsonify({"error": "patient_id, doctor_id, appt_date, time_slot required"}), 400

    try:
        result = create_appointment(patient_id, doctor_id, appt_date, time_slot)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 409

@appointments_bp.route("/appointments", methods=["GET"])
def list_appointments():
    patient_id = request.args.get("patient_id")
    doctor_id  = request.args.get("doctor_id")
    try:
        if patient_id:
            data = get_appointments_by_patient(int(patient_id))
        elif doctor_id:
            data = get_appointments_by_doctor(int(doctor_id))
        else:
            data = get_all_appointments()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@appointments_bp.route("/appointments/<int:appointment_id>/status", methods=["PATCH"])
def change_status(appointment_id):
    data   = request.get_json()
    status = data.get("status")
    if status not in ["Scheduled", "Completed", "Cancelled"]:
        return jsonify({"error": "Invalid status"}), 400
    try:
        result = update_appointment_status(appointment_id, status)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500