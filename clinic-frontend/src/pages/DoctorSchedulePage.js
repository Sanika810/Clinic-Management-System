import React, { useEffect, useState } from "react";
import { getDoctors, getDoctorSchedule } from "../services/api";

const DAY_ORDER = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default function DoctorSchedulePage() {
  const [doctors,   setDoctors]   = useState([]);
  const [schedules, setSchedules] = useState({});
  const [selected,  setSelected]  = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    getDoctors()
      .then(async r => {
        setDoctors(r.data);
        // Load all schedules at once
        const all = {};
        await Promise.all(r.data.map(async doc => {
          try {
            const s = await getDoctorSchedule(doc.doctor_id);
            all[doc.doctor_id] = s.data;
          } catch {
            all[doc.doctor_id] = [];
          }
        }));
        setSchedules(all);
        if (r.data.length > 0) setSelected(r.data[0].doctor_id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const selectedDoc      = doctors.find(d => d.doctor_id === selected);
  const selectedSchedule = schedules[selected] || [];
  const sortedSchedule   = [...selectedSchedule].sort(
    (a, b) => DAY_ORDER.indexOf(a.day_of_week) - DAY_ORDER.indexOf(b.day_of_week)
  );

  if (loading) return <div className="p-6 text-gray-400">Loading schedules...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Doctor Schedules</h2>
        <p className="text-gray-500 text-sm mt-1">Browse available doctors and their working hours</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Doctor List */}
        <div className="md:col-span-1 space-y-2">
          <p className="text-xs text-gray-400 uppercase font-semibold px-1 mb-3">Select Doctor</p>
          {doctors.map(doc => (
            <div
              key={doc.doctor_id}
              onClick={() => setSelected(doc.doctor_id)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selected === doc.doctor_id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-blue-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  {doc.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{doc.full_name}</p>
                  <p className="text-xs text-gray-500">{doc.specialization}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Schedule Detail */}
        <div className="md:col-span-2">
          {selectedDoc && (
            <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">

              {/* Doctor Info Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-2xl">
                    {selectedDoc.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedDoc.full_name}</h3>
                    <p className="text-blue-200 text-sm">{selectedDoc.specialization}</p>
                    <div className="flex gap-3 mt-2">
                      <span className="bg-white bg-opacity-20 text-white text-xs px-3 py-1 rounded-full">
                        🏥 {selectedDoc.dept_name}
                      </span>
                      <span className="bg-white bg-opacity-20 text-white text-xs px-3 py-1 rounded-full">
                        💰 ₹{selectedDoc.fee} per visit
                      </span>
                      {selectedDoc.phone && (
                        <span className="bg-white bg-opacity-20 text-white text-xs px-3 py-1 rounded-full">
                          📞 {selectedDoc.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Grid */}
              <div className="p-6">
                <p className="text-xs text-gray-400 uppercase font-semibold mb-4">Weekly Availability</p>
                {sortedSchedule.length === 0 ? (
                  <p className="text-gray-400 text-sm">No schedule available.</p>
                ) : (
                  <div className="space-y-3">
                    {DAY_ORDER.map(day => {
                      const slot = sortedSchedule.find(s => s.day_of_week === day);
                      return (
                        <div key={day} className={`flex items-center justify-between p-3 rounded-lg border ${
                          slot ? "border-green-200 bg-green-50" : "border-gray-100 bg-gray-50"
                        }`}>
                          <div className="flex items-center gap-3">
                            <span className={`w-2.5 h-2.5 rounded-full ${slot ? "bg-green-500" : "bg-gray-300"}`}/>
                            <span className={`text-sm font-medium ${slot ? "text-gray-800" : "text-gray-400"}`}>
                              {day}
                            </span>
                          </div>
                          {slot ? (
                            <span className="text-sm font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-lg">
                              {slot.start_time} – {slot.end_time}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-lg">
                              Not Available
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}