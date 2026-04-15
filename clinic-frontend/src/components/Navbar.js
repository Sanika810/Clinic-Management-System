import React from "react";

export default function Navbar({ activePage, user }) {
  const pageNames = {
    dashboard: "Dashboard",
    register: "Register Patient",
    patients: "All Patients",
    doctors: "All Doctors",
    schedules: "Doctor Schedules",
    book: "Book Appointment",
    consultation: "Consultation",
    prescriptions: "Prescriptions",
    records: "Medical Records",
    billing: "Billing & Payments",
    appointments: "My Appointments",
    history: "Patient History",
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">

      {/* Page Title */}
      <div>
        <h2 className="text-lg font-bold text-gray-800">
          {pageNames[activePage] || "Dashboard"}
        </h2>
        <p className="text-xs text-gray-400">{today}</p>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">

        {/* Role Badge */}
        <div className="hidden sm:flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full">
          <span className="text-sm">
            {user?.role === "admin" ? "👨‍💼"
              : user?.role === "doctor" ? "👨‍⚕️"
                : user?.role === "patient" ? "🧑"
                  : "🧑‍💼"}
          </span>
          <span className="text-xs font-semibold text-blue-700 capitalize">
            {user?.role}
          </span>
        </div>

        {/* User Avatar */}
        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
          {user?.full_name?.charAt(0).toUpperCase()}
        </div>

      </div>
    </div>
  );
}