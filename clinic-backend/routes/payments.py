from flask import Blueprint, request, jsonify
from models.payment import create_payment, get_all_payments, get_payments_by_patient

payments_bp = Blueprint("payments", __name__)

@payments_bp.route("/payments", methods=["POST"])
def make_payment():
    data         = request.get_json()
    bill_id      = data.get("bill_id")
    patient_id   = data.get("patient_id")
    amount       = data.get("amount")
    payment_mode = data.get("payment_mode")

    if not all([bill_id, patient_id, amount, payment_mode]):
        return jsonify({"error": "bill_id, patient_id, amount, payment_mode required"}), 400

    try:
        result = create_payment(bill_id, patient_id, amount, payment_mode)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@payments_bp.route("/payments", methods=["GET"])
def list_payments():
    patient_id = request.args.get("patient_id")
    try:
        if patient_id:
            data = get_payments_by_patient(int(patient_id))
        else:
            data = get_all_payments()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500