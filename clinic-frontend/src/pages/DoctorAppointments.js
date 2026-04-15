import React, { useEffect, useState } from "react";
import { getAppointments } from "../services/api";

export default function DoctorAppointments({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState("All");

  useEffect(() => {
    if (!user.doctor_id) return;
    getAppointments({ doctor_id: user.doctor_id })
      .then(r => setAppointments(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = filter === "All"
    ? appointments
    : appointments.filter(a => a.status === filter);

  const statusColor = s =>
    s === "Completed"  ? "bg-green-100 text-green-700"
    : s === "Cancelled"? "bg-red-100 text-red-700"
    : "bg-yellow-100 text-yellow-700";

  const counts = {
    All:       appointments.length,
    Scheduled: appointments.filter(a => a.status === "Scheduled").length,
    Completed: appointments.filter(a => a.status === "Completed").length,
    Cancelled: appointments.filter(a => a.status === "Cancelled").length,
  };

  if (loading) return <div className="p-6 text-gray-400">Loading appointments...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">My Appointments</h2>
        <p className="text-gray-500 text-sm mt-1">All your appointments across all dates</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {["All","Scheduled","Completed","Cancelled"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              filter === f
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
            }`}
          >
            {f}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
              filter === f ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"
            }`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["#","Patient","Phone","Date","Time","Status"].map(h => (
                <th key={h} className="text-left px-5 py-4 font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-12 text-gray-300">
                  <p className="text-4xl mb-2">📅</p>
                  <p className="text-sm">No {filter.toLowerCase()} appointments.</p>
                </td>
              </tr>
            ) : filtered.map((a, i) => (
              <tr key={a.appointment_id} className="hover:bg-gray-50">
                <td className="px-5 py-4 text-gray-400">{i + 1}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {a.patient_name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800">{a.patient_name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-500">{a.phone || "—"}</td>
                <td className="px-5 py-4 text-gray-600">{a.appt_date}</td>
                <td className="px-5 py-4 text-gray-600">{a.time_slot}</td>
                <td className="px-5 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(a.status)}`}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}