import React, { useEffect, useState } from "react";
import { getAppointments, saveConsultation } from "../services/api";

const EMPTY_MED = { medicine_name: "", dosage: "", frequency: "", duration: "" };

export default function ConsultationPage({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ symptoms: "", diagnosis: "", notes: "" });
  const [medicines, setMedicines] = useState([{ ...EMPTY_MED }]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user.doctor_id) return; // safety guard
    getAppointments({ doctor_id: user.doctor_id })
      .then(r => setAppointments(r.data.filter(a => a.status === "Scheduled")))
      .catch(console.error);
  }, [user]);

  const addMedicine = () => setMedicines([...medicines, { ...EMPTY_MED }]);
  const removeMedicine = (i) => setMedicines(medicines.filter((_, idx) => idx !== i));
  const updateMed = (i, key, val) => {
    const updated = [...medicines];
    updated[i][key] = val;
    setMedicines(updated);
  };

  const handleSubmit = async () => {
    setMsg(""); setError(""); setLoading(true);
    try {
      const validMeds = medicines.filter(m => m.medicine_name.trim());
      await saveConsultation({
        appointment_id: selected.appointment_id,
        ...form,
        medicines: validMeds
      });
      setMsg("✅ Consultation saved successfully!");
      setSelected(null);
      setForm({ symptoms: "", diagnosis: "", notes: "" });
      setMedicines([{ ...EMPTY_MED }]);
      // Refresh list
      const r = await getAppointments({ doctor_id: user.doctor_id });
      setAppointments(r.data.filter(a => a.status === "Scheduled"));
    } catch (e) {
      setError(e.response?.data?.error || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Consultation</h2>

      {msg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{msg}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">⚠️ {error}</div>}

      {/* Appointment List */}
      {!selected && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Today's Scheduled Appointments</h3>
          {appointments.length === 0
            ? <p className="text-gray-400 text-sm">No scheduled appointments.</p>
            : <div className="space-y-3">
              {appointments.map(a => (
                <div key={a.appointment_id}
                  className="flex items-center justify-between border border-gray-200 rounded-xl p-4 hover:bg-gray-50"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{a.patient_name}</p>
                    <p className="text-sm text-gray-500">{a.appt_date} at {a.time_slot}</p>
                  </div>
                  <button
                    onClick={() => setSelected(a)}
                    className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Start Consultation
                  </button>
                </div>
              ))}
            </div>
          }
        </div>
      )}

      {/* Consultation Form */}
      {selected && (
        <div className="bg-white rounded-xl shadow p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Patient: {selected.patient_name}</h3>
              <p className="text-sm text-gray-500">{selected.appt_date} at {selected.time_slot}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
          </div>

          {[
            { key: "symptoms", label: "Symptoms", rows: 3 },
            { key: "diagnosis", label: "Diagnosis", rows: 3 },
            { key: "notes", label: "Notes", rows: 2 },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <textarea
                rows={f.rows}
                value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Enter ${f.label.toLowerCase()}...`}
              />
            </div>
          ))}

          {/* Prescriptions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">💊 Prescriptions</label>
              <button onClick={addMedicine} className="text-blue-600 text-sm hover:underline">+ Add Medicine</button>
            </div>
            <div className="space-y-3">
              {medicines.map((med, i) => (
                <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-gray-50 p-3 rounded-lg">
                  {[
                    { key: "medicine_name", placeholder: "Medicine Name" },
                    { key: "dosage", placeholder: "Dosage (e.g. 500mg)" },
                    { key: "frequency", placeholder: "Frequency (e.g. 2x/day)" },
                    { key: "duration", placeholder: "Duration (e.g. 5 days)" },
                  ].map(f => (
                    <input
                      key={f.key}
                      placeholder={f.placeholder}
                      value={med[f.key]}
                      onChange={e => updateMed(i, f.key, e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  ))}
                  {medicines.length > 1 && (
                    <button onClick={() => removeMedicine(i)}
                      className="text-red-400 hover:text-red-600 text-xs col-span-2 md:col-span-4 text-right">
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Consultation & Prescriptions"}
          </button>
        </div>
      )}
    </div>
  );
}