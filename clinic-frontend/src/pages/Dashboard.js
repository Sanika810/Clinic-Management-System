import React, { useEffect, useState } from "react";
import { getAppointments, getPatients, getDoctors, getBilling } from "../services/api";

export default function Dashboard({ user }) {
  const [stats, setStats] = useState({ patients: 0, appointments: 0, doctors: 0, billing: 0 });
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        if (user.role === "admin" || user.role === "staff") {
          const [p, a, d, b] = await Promise.all([
            getPatients(), getAppointments({}), getDoctors(), getBilling({})
          ]);
          setStats({
            patients: p.data.length,
            appointments: a.data.length,
            doctors: d.data.length,
            billing: b.data.filter(x => x.status === "Pending").length
          });
          setAppointments(a.data.slice(0, 5));
        } else if (user.role === "doctor" && user.doctor_id) {
          const a = await getAppointments({ doctor_id: user.doctor_id });
          setAppointments(a.data.slice(0, 5));
          setStats({ appointments: a.data.length, patients: 0, doctors: 0, billing: 0 });
        } else if (user.role === "patient") {
          const a = await getAppointments({ patient_id: user.patient_id });
          setAppointments(a.data.slice(0, 5));
          setStats({ appointments: a.data.length, patients: 0, doctors: 0, billing: 0 });
        }
      } catch (e) { console.error(e); }
    };
    load();
  }, [user]);

  const statCards = user.role === "admin" || user.role === "staff"
    ? [
      { label: "Total Patients", value: stats.patients, icon: "👥", color: "bg-blue-500" },
      { label: "Appointments", value: stats.appointments, icon: "📅", color: "bg-green-500" },
      { label: "Doctors", value: stats.doctors, icon: "👨‍⚕️", color: "bg-purple-500" },
      { label: "Pending Bills", value: stats.billing, icon: "💳", color: "bg-orange-500" },
    ]
    : [
      { label: "My Appointments", value: stats.appointments, icon: "📅", color: "bg-blue-500" },
    ];

  const statusColor = (s) =>
    s === "Completed" ? "bg-green-100 text-green-700"
      : s === "Cancelled" ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700";

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {user.full_name} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's what's happening today</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
            <div className={`${card.color} text-white rounded-full w-12 h-12 flex items-center justify-center text-xl`}>
              {card.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Appointments</h2>
        {appointments.length === 0 ? (
          <p className="text-gray-400 text-sm">No appointments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3 font-medium">
                    {user.role === "patient" ? "Doctor" : "Patient"}
                  </th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {appointments.map((a) => (
                  <tr key={a.appointment_id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-800">
                      {user.role === "patient" ? a.doctor_name : a.patient_name || a.doctor_name}
                    </td>
                    <td className="py-3 text-gray-600">{a.appt_date}</td>
                    <td className="py-3 text-gray-600">{a.time_slot}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(a.status)}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}