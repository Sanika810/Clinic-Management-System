import React, { useEffect, useState } from "react";
import {
  getDoctors, getDoctorSchedule, getBookedSlots,
  bookAppointment, getBilling, makePayment
} from "../services/api";

// Generate 30-min slots between start and end time
function generateSlots(startTime, endTime) {
  const slots = [];
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  let h = startH;
  let m = startM;

  while (h < endH || (h === endH && m < endM)) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += 30;
    if (m >= 60) { h += 1; m = 0; }
  }
  return slots;
}

const PAYMENT_MODES = ["Cash", "Card", "UPI", "Net Banking"];

export default function BookAppointment({ user }) {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [date, setDate] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Payment modal state
  const [showPayModal, setShowPayModal] = useState(false);
  const [newBill, setNewBill] = useState(null);
  const [payMode, setPayMode] = useState("UPI");
  const [payLoading, setPayLoading] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  useEffect(() => {
    getDoctors().then(r => setDoctors(r.data)).catch(console.error);
  }, []);

  const handleDocSelect = async (doc) => {
    setSelectedDoc(doc); setDate(""); setBookedSlots([]); setSelectedSlot("");
    const res = await getDoctorSchedule(doc.doctor_id);
    setSchedule(res.data);
  };

  const handleDateChange = async (d) => {
    setDate(d); setSelectedSlot(""); setBookedSlots([]);
    if (!selectedDoc || !d) return;
    const res = await getBookedSlots(selectedDoc.doctor_id, d);
    setBookedSlots(res.data.booked_slots || []);
  };

  const handleBook = async () => {
    setError(""); setLoading(true);
    try {
      await bookAppointment({
        patient_id: user.patient_id,
        doctor_id: selectedDoc.doctor_id,
        appt_date: date,
        time_slot: selectedSlot
      });

      // Fetch the newly created bill for this patient
      const billRes = await getBilling({ patient_id: user.patient_id });
      const pending = billRes.data.filter(b => b.status === "Pending");
      const latest = pending[0]; // most recent pending bill

      setNewBill(latest);
      setShowPayModal(true);
      setSelectedSlot("");
    } catch (e) {
      setError(e.response?.data?.error || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!newBill) return;
    setPayLoading(true);
    try {
      await makePayment({
        bill_id: newBill.bill_id,
        patient_id: user.patient_id,
        amount: newBill.amount,
        payment_mode: payMode
      });
      setPaySuccess(true);
    } catch (e) {
      setError(e.response?.data?.error || "Payment failed");
      setShowPayModal(false);
    } finally {
      setPayLoading(false);
    }
  };

  const closeModal = () => {
    setShowPayModal(false);
    setPaySuccess(false);
    setNewBill(null);
    setPayMode("UPI");
    setSelectedDoc(null);
    setSchedule([]);
    setDate("");
  };

  const getScheduleForDate = (dateStr) => {
    if (!dateStr || schedule.length === 0) return null;
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = days[new Date(dateStr).getDay()];
    return schedule.find(s => s.day_of_week === dayName) || null;
  };

  const isDateAvailable = (dateStr) => !!getScheduleForDate(dateStr);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Book Appointment</h2>
        <p className="text-gray-500 text-sm mt-1">Select a doctor, date and available time slot</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Step 1: Select Doctor */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Step 1 — Select Doctor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {doctors.map(doc => (
            <div
              key={doc.doctor_id}
              onClick={() => handleDocSelect(doc)}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${selectedDoc?.doctor_id === doc.doctor_id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">👨‍⚕️</div>
                <div>
                  <p className="font-semibold text-gray-800">{doc.full_name}</p>
                  <p className="text-xs text-gray-500">{doc.specialization} • {doc.dept_name}</p>
                  <p className="text-xs text-blue-600 font-medium mt-0.5">₹{doc.fee} per visit</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Info */}
      {selectedDoc && schedule.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-sm font-semibold text-blue-700 mb-2">
            📅 {selectedDoc.full_name}'s Schedule
          </p>
          <div className="flex flex-wrap gap-2">
            {schedule.map(s => (
              <span key={s.schedule_id} className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                {s.day_of_week}: {s.start_time}–{s.end_time}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select Date */}
      {selectedDoc && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Step 2 — Select Date</h3>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().split("T")[0]}
            onChange={e => handleDateChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {date && !isDateAvailable(date) && (
            <p className="text-orange-500 text-sm mt-2">
              ⚠️ Doctor not available on this day.
            </p>
          )}
        </div>
      )}

      {/* Step 3: Select Slot */}
      {date && isDateAvailable(date) && (() => {
        const daySchedule = getScheduleForDate(date);
        const availableSlots = generateSlots(daySchedule.start_time, daySchedule.end_time);
        return (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-700 mb-1">Step 3 — Select Time Slot</h3>
            <p className="text-xs text-gray-400 mb-4">
              Available: {daySchedule.start_time} – {daySchedule.end_time}
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {availableSlots.map(slot => {
                const isBooked = bookedSlots.includes(slot);
                const isSelected = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    disabled={isBooked}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all
                ${isBooked
                        ? "bg-red-100 text-red-400 border-red-200 cursor-not-allowed line-through"
                        : isSelected
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-400"
                      }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-4 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-600 rounded inline-block"></span> Selected</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-100 border border-red-200 rounded inline-block"></span> Booked</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-50 border border-gray-200 rounded inline-block"></span> Available</span>
            </div>
          </div>
        );
      })()}

      {/* Confirm Button */}
      {selectedSlot && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-semibold text-gray-800">{selectedDoc.full_name}</p>
              <p className="text-sm text-gray-500">{date} at {selectedSlot}</p>
              <p className="text-blue-600 font-medium text-sm">Fee: ₹{selectedDoc.fee}</p>
            </div>
            <button
              onClick={handleBook}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? "Booking..." : "Confirm Appointment →"}
            </button>
          </div>
        </div>
      )}

      {/* ── PAYMENT MODAL ── */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

            {!paySuccess ? (
              <>
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                  <h3 className="text-xl font-bold">💳 Complete Payment</h3>
                  <p className="text-blue-200 text-sm mt-1">Appointment booked! Pay now to confirm</p>
                </div>

                <div className="p-6 space-y-5">
                  {/* Bill Summary */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-400 uppercase font-semibold mb-3">Bill Summary</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Doctor</span>
                        <span className="font-medium text-gray-800">{newBill?.doctor_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date</span>
                        <span className="font-medium text-gray-800">{newBill?.appt_date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time</span>
                        <span className="font-medium text-gray-800">{newBill?.time_slot}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-bold text-gray-700">Total Amount</span>
                        <span className="font-bold text-blue-600 text-lg">₹{newBill?.amount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Mode */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Select Payment Mode</p>
                    <div className="grid grid-cols-2 gap-2">
                      {PAYMENT_MODES.map(mode => {
                        const icons = { Cash: "💵", Card: "💳", UPI: "📱", "Net Banking": "🏦" };
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

                  {/* UPI hint */}
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

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={closeModal}
                      className="flex-1 border border-gray-300 text-gray-600 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-all"
                    >
                      Pay Later
                    </button>
                    <button
                      onClick={handlePayment}
                      disabled={payLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
                    >
                      {payLoading ? "Processing..." : `Pay ₹${newBill?.amount}`}
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
                <p className="text-gray-500 text-sm">
                  ₹{newBill?.amount} paid via <b>{payMode}</b>
                </p>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-left space-y-2 border border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Doctor</span>
                    <span className="font-medium">{newBill?.doctor_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium">{newBill?.appt_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Mode</span>
                    <span className="font-medium">{payMode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="text-green-600 font-semibold">Paid ✓</span>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all mt-2"
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