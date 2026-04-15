from flask import Blueprint, request, jsonify
from models.appointment import get_appointments_by_patient
from models.consultation import get_consultation_by_appointment
from models.billing import get_bills_by_patient

records_bp = Blueprint("records", __name__)

@records_bp.route("/patient-records/<int:patient_id>", methods=["GET"])
def patient_records(patient_id):
    try:
        appointments = get_appointments_by_patient(patient_id)
        records = []
        for appt in appointments:
            consultation = get_consultation_by_appointment(appt["appointment_id"])
            records.append({
                "appointment":  appt,
                "consultation": consultation
            })
        bills = get_bills_by_patient(patient_id)
        return jsonify({"records": records, "bills": bills}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500