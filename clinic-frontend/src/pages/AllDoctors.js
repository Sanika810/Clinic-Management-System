import React, { useEffect, useState } from "react";
import { getDoctors, getDoctorSchedule } from "../services/api";

export default function AllDoctors() {
  const [doctors,  setDoctors]  = useState([]);
  const [schedule, setSchedule] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [search,   setSearch]   = useState("");
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getDoctors()
      .then(r => setDoctors(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleSchedule = async (doctor_id) => {
    if (expanded === doctor_id) { setExpanded(null); return; }
    setExpanded(doctor_id);
    if (!schedule[doctor_id]) {
      try {
        const res = await getDoctorSchedule(doctor_id);
        setSchedule(prev => ({ ...prev, [doctor_id]: res.data }));
      } catch {
        setSchedule(prev => ({ ...prev, [doctor_id]: [] }));
      }
    }
  };

  const filtered = doctors.filter(d =>
    d.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase()) ||
    d.dept_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-6 text-gray-400">Loading doctors...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">All Doctors</h2>
          <p className="text-gray-500 text-sm mt-1">{doctors.length} doctors on staff</p>
        </div>
        <input
          type="text"
          placeholder="Search by name, specialization..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center text-gray-300">
            <p className="text-5xl">👨‍⚕️</p>
            <p className="mt-3 text-sm">No doctors found.</p>
          </div>
        ) : filtered.map(doc => (
          <div key={doc.doctor_id} className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                  {doc.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{doc.full_name}</p>
                  <p className="text-sm text-gray-500">{doc.specialization}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">{doc.dept_name}</span>
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">₹{doc.fee}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-400 hidden sm:block">{doc.phone || "—"}</p>
                <button
                  onClick={() => toggleSchedule(doc.doctor_id)}
                  className="text-blue-600 border border-blue-200 hover:bg-blue-50 text-xs px-3 py-2 rounded-lg transition-all"
                >
                  {expanded === doc.doctor_id ? "Hide Schedule ▲" : "View Schedule ▼"}
                </button>
              </div>
            </div>

            {expanded === doc.doctor_id && (
              <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                <p className="text-xs text-gray-400 uppercase font-semibold mb-3">Weekly Schedule</p>
                {!schedule[doc.doctor_id] ? (
                  <p className="text-gray-400 text-sm">Loading...</p>
                ) : schedule[doc.doctor_id].length === 0 ? (
                  <p className="text-gray-400 text-sm">No schedule set.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {schedule[doc.doctor_id].map(s => (
                      <div key={s.schedule_id} className="bg-blue-100 text-blue-800 text-xs px-4 py-2 rounded-lg font-medium">
                        📅 {s.day_of_week}: {s.start_time} – {s.end_time}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}