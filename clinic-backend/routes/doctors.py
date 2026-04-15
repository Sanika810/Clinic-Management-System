from flask import Blueprint, request, jsonify
from models.doctor import get_all_doctors, get_doctor_schedule, get_booked_slots

doctors_bp = Blueprint("doctors", __name__)

@doctors_bp.route("/doctors", methods=["GET"])
def list_doctors():
    try:
        doctors = get_all_doctors()
        for d in doctors:
            d["fee"] = float(d["fee"]) if d["fee"] else 0
        return jsonify(doctors), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@doctors_bp.route("/doctors/<int:doctor_id>/schedule", methods=["GET"])
def doctor_schedule(doctor_id):
    try:
        schedule = get_doctor_schedule(doctor_id)
        return jsonify(schedule), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@doctors_bp.route("/doctors/<int:doctor_id>/booked-slots", methods=["GET"])
def booked_slots(doctor_id):
    date_str = request.args.get("date")
    if not date_str:
        return jsonify({"error": "date parameter required (YYYY-MM-DD)"}), 400
    try:
        slots = get_booked_slots(doctor_id, date_str)
        return jsonify({"booked_slots": slots}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500