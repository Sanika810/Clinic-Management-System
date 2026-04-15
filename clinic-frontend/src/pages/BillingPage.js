import React, { useEffect, useState } from "react";
import { getBilling, getPayments, makePayment } from "../services/api";

const PAYMENT_MODES = ["Cash", "Card", "UPI", "Net Banking"];

export default function BillingPage({ user }) {
  const [bills,       setBills]       = useState([]);
  const [payments,    setPayments]    = useState([]);
  const [tab,         setTab]         = useState("bills");
  const [loading,     setLoading]     = useState(true);

  // Payment modal state
  const [showModal,   setShowModal]   = useState(false);
  const [selectedBill,setSelectedBill]= useState(null);
  const [payMode,     setPayMode]     = useState("UPI");
  const [payLoading,  setPayLoading]  = useState(false);
  const [paySuccess,  setPaySuccess]  = useState(false);
  const [error,       setError]       = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params   = user.role === "patient" ? { patient_id: user.patient_id } : {};
      const billRes  = await getBilling(params);
      setBills(billRes.data);

      const payParams = user.role === "patient" ? { patient_id: user.patient_id } : {};
      const payRes   = await getPayments(payParams);
      setPayments(payRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  // Open payment modal for a specific bill
  const openPayModal = (bill) => {
    setSelectedBill(bill);
    setPayMode("UPI");
    setPaySuccess(false);
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBill(null);
    setPaySuccess(false);
    setError("");
  };

  const handlePayment = async () => {
    if (!selectedBill) return;
    setPayLoading(true);
    setError("");
    try {
      await makePayment({
        bill_id:      selectedBill.bill_id,
        patient_id:   user.patient_id,
        amount:       selectedBill.amount,
        payment_mode: payMode
      });
      setPaySuccess(true);
      load(); // refresh bills + payments
    } catch (e) {
      setError(e.response?.data?.error || "Payment failed. Please try again.");
    } finally {
      setPayLoading(false);
    }
  };

  const statusColor = s =>
    s === "Paid"        ? "bg-green-100 text-green-700"
    : s === "Cancelled" ? "bg-red-100 text-red-700"
    : "bg-yellow-100 text-yellow-700";

  const payStatusColor = s =>
    s === "Paid"       ? "bg-green-100 text-green-700"
    : s === "Refunded" ? "bg-blue-100 text-blue-700"
    : "bg-red-100 text-red-700";

  const modeIcon = m =>
    m === "UPI" ? "📱" : m === "Card" ? "💳" : m === "Cash" ? "💵" : "🏦";

  const pendingTotal   = bills.filter(b => b.status === "Pending").reduce((s, b) => s + b.amount, 0);
  const collectedTotal = payments.reduce((s, p) => s + p.amount, 0);

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Billing & Payments</h2>
          <p className="text-gray-500 text-sm mt-1">Track all bills and payment records</p>
        </div>
        <div className="flex gap-3">
          {pendingTotal > 0 && (
            <div className="bg-orange-50 border border-orange-200 px-4 py-2 rounded-lg text-center">
              <p className="text-xs text-orange-500 font-medium">Pending</p>
              <p className="text-lg font-bold text-orange-700">₹{pendingTotal.toFixed(0)}</p>
            </div>
          )}
          <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-lg text-center">
            <p className="text-xs text-green-500 font-medium">Paid</p>
            <p className="text-lg font-bold text-green-700">₹{collectedTotal.toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {["bills", "payments"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-semibold capitalize border-b-2 transition-all ${
              tab === t
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "bills" ? "📄 Bills" : "💳 Payment Records"}
          </button>
        ))}
      </div>

      {/* Bills Tab */}
      {tab === "bills" && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {[
                  "Bill ID",
                  user.role !== "patient" && "Patient",
                  "Doctor",
                  "Date",
                  "Amount",
                  "Status",
                  user.role === "patient" && "Action"
                ].filter(Boolean).map(h => (
                  <th key={h} className="text-left px-5 py-4 font-semibold text-gray-600 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bills.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-300">
                    <p className="text-4xl mb-2">📄</p>
                    <p className="text-sm">No bills found.</p>
                  </td>
                </tr>
              ) : bills.map(b => (
                <tr key={b.bill_id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 text-gray-400 font-mono">#{b.bill_id}</td>

                  {user.role !== "patient" && (
                    <td className="px-5 py-4 font-medium text-gray-800">{b.patient_name}</td>
                  )}

                  <td className="px-5 py-4 text-gray-700">{b.doctor_name}</td>
                  <td className="px-5 py-4 text-gray-600">{b.appt_date}</td>
                  <td className="px-5 py-4 font-bold text-gray-800">₹{b.amount}</td>

                  <td className="px-5 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(b.status)}`}>
                      {b.status}
                    </span>
                  </td>

                  {/* Pay button — patient only, pending bills only */}
                  {user.role === "patient" && (
                    <td className="px-5 py-4">
                      {b.status === "Pending" ? (
                        <button
                          onClick={() => openPayModal(b)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                        >
                          💳 Pay Now
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payments Tab */}
      {tab === "payments" && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {[
                  "Pay ID",
                  user.role !== "patient" && "Patient",
                  "Doctor",
                  "Date",
                  "Amount",
                  "Mode",
                  "Status",
                  "Paid At"
                ].filter(Boolean).map(h => (
                  <th key={h} className="text-left px-5 py-4 font-semibold text-gray-600 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-gray-300">
                    <p className="text-4xl mb-2">💳</p>
                    <p className="text-sm">No payment records found.</p>
                  </td>
                </tr>
              ) : payments.map(p => (
                <tr key={p.payment_id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 text-gray-400 font-mono">#{p.payment_id}</td>
                  {user.role !== "patient" && (
                    <td className="px-5 py-4 font-medium text-gray-800">{p.patient_name}</td>
                  )}
                  <td className="px-5 py-4 text-gray-700">{p.doctor_name}</td>
                  <td className="px-5 py-4 text-gray-600">{p.appt_date}</td>
                  <td className="px-5 py-4 font-bold text-gray-800">₹{p.amount}</td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-gray-700">
                      <span>{modeIcon(p.payment_mode)}</span>
                      {p.payment_mode}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${payStatusColor(p.payment_status)}`}>
                      {p.payment_status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">{p.paid_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── PAYMENT MODAL ── */}
      {showModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

            {!paySuccess ? (
              <>
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                  <h3 className="text-xl font-bold">💳 Pay Bill</h3>
                  <p className="text-blue-200 text-sm mt-1">Complete your pending payment</p>
                </div>

                <div className="p-6 space-y-5">

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      ⚠️ {error}
                    </div>
                  )}

                  {/* Bill Summary */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-400 uppercase font-semibold mb-3">Bill Summary</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Bill ID</span>
                        <span className="font-medium text-gray-800">#{selectedBill.bill_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Doctor</span>
                        <span className="font-medium text-gray-800">{selectedBill.doctor_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Appointment Date</span>
                        <span className="font-medium text-gray-800">{selectedBill.appt_date}</span>
                      </div>
                      <div className="border-t pt-2 mt-1 flex justify-between">
                        <span className="font-bold text-gray-700">Total Amount</span>
                        <span className="font-bold text-blue-600 text-lg">₹{selectedBill.amount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Mode */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Select Payment Mode</p>
                    <div className="grid grid-cols-2 gap-2">
                      {PAYMENT_MODES.map(mode => {
                        const icons = { Cash:"💵", Card:"💳", UPI:"📱", "Net Banking":"🏦" };
                        return (
                          <button
                            key={mode}
                            onClick={() => setPayMode(mode)}
                            className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-2
                              ${payMode === mode
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-200 text-gray-600 hover:border-blue-300"
                              }`}
                          >
                            <span>{icons[mode]}</span> {mode}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mode hints */}
                  {payMode === "UPI" && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs text-purple-700">
                      📱 UPI ID: <b>clinic@upi</b> — Scan QR at reception or pay online
                    </div>
                  )}
                  {payMode === "Card" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                      💳 Card payment processed at reception counter
                    </div>
                  )}
                  {payMode === "Cash" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-700">
                      💵 Please pay cash at the reception before your appointment
                    </div>
                  )}
                  {payMode === "Net Banking" && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-700">
                      🏦 Account: <b>CLINIC001</b> — IFSC: <b>HDFC0001234</b>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={closeModal}
                      className="flex-1 border border-gray-300 text-gray-600 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePayment}
                      disabled={payLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
                    >
                      {payLoading ? "Processing..." : `Pay ₹${selectedBill.amount}`}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Success Screen */
              <div className="p-8 text-center space-y-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-4xl">✅</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Payment Successful!</h3>
                <p className="text-gray-500 text-sm">Your bill has been paid successfully</p>

                <div className="bg-gray-50 rounded-xl p-4 text-sm text-left space-y-2 border border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bill ID</span>
                    <span className="font-medium">#{selectedBill.bill_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Doctor</span>
                    <span className="font-medium">{selectedBill.doctor_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount Paid</span>
                    <span className="font-bold text-blue-600">₹{selectedBill.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Mode</span>
                    <span className="font-medium">{modeIcon(payMode)} {payMode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="text-green-600 font-semibold">Paid ✓</span>
                  </div>
                </div>

                <button
                  onClick={closeModal}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}