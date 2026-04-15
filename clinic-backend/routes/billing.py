from flask import Blueprint, request, jsonify
from models.billing import get_bills_by_patient, get_all_bills, update_bill_status

billing_bp = Blueprint("billing", __name__)

@billing_bp.route("/billing", methods=["GET"])
def list_bills():
    patient_id = request.args.get("patient_id")
    try:
        if patient_id:
            data = get_bills_by_patient(int(patient_id))
        else:
            data = get_all_bills()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@billing_bp.route("/billing/<int:bill_id>/status", methods=["PATCH"])
def change_bill_status(bill_id):
    data   = request.get_json()
    status = data.get("status")
    if status not in ["Pending", "Paid", "Cancelled"]:
        return jsonify({"error": "Invalid status"}), 400
    try:
        result = update_bill_status(bill_id, status)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500