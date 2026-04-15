import React, { useEffect, useState } from "react";
import { getPatientRecords } from "../services/api";

export default function MedicalRecords({ user }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatientRecords(user.patient_id)
      .then(r => setRecords(r.data.records || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="p-6 text-gray-400">Loading records...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">My Medical Records</h2>

      {records.length === 0
        ? <div className="bg-white rounded-xl shadow p-12 text-center text-gray-300">
            <p className="text-5xl">📋</p>
            <p className="mt-3 text-sm">No medical records found.</p>
          </div>
        : records.map((r, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-6 border border-gray-100">
              {/* Appointment Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold text-gray-800">{r.appointment.doctor_name}</p>
                  <p className="text-sm text-gray-500">{r.appointment.dept_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{r.appointment.appt_date} at {r.appointment.time_slot}</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    r.appointment.status === "Completed" ? "bg-green-100 text-green-700"
                    : r.appointment.status === "Cancelled" ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                  }`}>{r.appointment.status}</span>
                </div>
              </div>

              {r.consultation ? (
                <div className="border-t pt-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div><p className="text-xs text-gray-400 uppercase font-semibold">Symptoms</p><p className="text-gray-700 mt-1">{r.consultation.symptoms || "—"}</p></div>
                    <div><p className="text-xs text-gray-400 uppercase font-semibold">Diagnosis</p><p className="text-gray-700 mt-1">{r.consultation.diagnosis || "—"}</p></div>
                    <div><p className="text-xs text-gray-400 uppercase font-semibold">Notes</p><p className="text-gray-700 mt-1">{r.consultation.notes || "—"}</p></div>
                  </div>

                  {r.consultation.prescriptions?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Medicines</p>
                      <div className="flex flex-wrap gap-2">
                        {r.consultation.prescriptions.map((p, j) => (
                          <span key={j} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-200">
                            💊 {p.medicine_name} — {p.dosage} / {p.frequency} / {p.duration}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-sm border-t pt-3">No consultation recorded yet.</p>
              )}
            </div>
          ))
      }
    </div>
  );
}