import React, { useEffect, useState } from "react";
import { getAppointments, getConsultation } from "../services/api";

export default function PrescriptionPage({ user }) {
  const [appointments,  setAppointments]  = useState([]);
  const [consultation,  setConsultation]  = useState(null);
  const [selectedAppt,  setSelectedAppt]  = useState(null);
  const [loading,       setLoading]       = useState(false);

  useEffect(() => {
    getAppointments({ patient_id: user.patient_id })
      .then(r => setAppointments(r.data.filter(a => a.status === "Completed")))
      .catch(console.error);
  }, [user]);

  const viewPrescription = async (appt) => {
    setLoading(true); setConsultation(null); setSelectedAppt(appt);
    try {
      const res = await getConsultation(appt.appointment_id);
      setConsultation(res.data);
    } catch {
      setConsultation(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">My Prescriptions</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appointment List */}
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Completed Appointments</h3>
          {appointments.length === 0
            ? <p className="text-gray-400 text-sm">No completed appointments yet.</p>
            : <div className="space-y-2">
                {appointments.map(a => (
                  <div
                    key={a.appointment_id}
                    onClick={() => viewPrescription(a)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedAppt?.appointment_id === a.appointment_id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <p className="font-medium text-gray-800 text-sm">{a.doctor_name}</p>
                    <p className="text-xs text-gray-500">{a.appt_date} at {a.time_slot}</p>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Prescription Details */}
        <div className="bg-white rounded-xl shadow p-5">
          {!selectedAppt && (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 py-12">
              <span className="text-5xl">💊</span>
              <p className="mt-3 text-sm">Select an appointment to view prescription</p>
            </div>
          )}

          {loading && <p className="text-gray-400 text-sm text-center py-12">Loading...</p>}

          {!loading && selectedAppt && !consultation && (
            <p className="text-gray-400 text-sm text-center py-12">No prescription found for this appointment.</p>
          )}

          {!loading && consultation && (
            <div className="space-y-4">
              <div className="border-b pb-3">
                <p className="text-xs text-gray-400 uppercase font-semibold">Appointment</p>
                <p className="font-semibold text-gray-800">{selectedAppt.doctor_name}</p>
                <p className="text-sm text-gray-500">{selectedAppt.appt_date}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">Symptoms</p>
                <p className="text-sm text-gray-700 mt-1">{consultation.symptoms || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">Diagnosis</p>
                <p className="text-sm text-gray-700 mt-1">{consultation.diagnosis || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">Notes</p>
                <p className="text-sm text-gray-700 mt-1">{consultation.notes || "—"}</p>
              </div>

              {consultation.prescriptions?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Medicines</p>
                  <div className="space-y-2">
                    {consultation.prescriptions.map((p, i) => (
                      <div key={i} className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <p className="font-semibold text-blue-800 text-sm">{p.medicine_name}</p>
                        <div className="grid grid-cols-3 gap-1 mt-1">
                          <div>
                            <p className="text-xs text-gray-400">Dosage</p>
                            <p className="text-xs font-medium text-gray-700">{p.dosage}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Frequency</p>
                            <p className="text-xs font-medium text-gray-700">{p.frequency}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Duration</p>
                            <p className="text-xs font-medium text-gray-700">{p.duration}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}