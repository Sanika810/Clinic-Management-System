import React from "react";

const navItems = {
  admin: [
    { label: "Dashboard",        icon: "🏠", path: "dashboard"    },
    { label: "All Patients",     icon: "👥", path: "patients"     },
    { label: "All Doctors",      icon: "👨‍⚕️", path: "doctors"      },
    { label: "Register Patient", icon: "➕", path: "register"     },
    { label: "Billing Record",          icon: "💳", path: "billing"      },
  ],
  doctor: [
    { label: "Dashboard",        icon: "🏠", path: "dashboard"    },
    { label: "My Appointments",  icon: "📅", path: "appointments" },
    { label: "Consultation",     icon: "🩺", path: "consultation" },
    { label: "Patient History",  icon: "📋", path: "history"      },
  ],
  patient: [
    { label: "Dashboard",        icon: "🏠", path: "dashboard"     },
    { label: "Book Appointment", icon: "📅", path: "book"          },
    { label: "Doctor Schedules", icon: "🗓️", path: "schedules"     },
    { label: "My Records",       icon: "📋", path: "records"       },
    { label: "Prescriptions",    icon: "💊", path: "prescriptions" },
    { label: "Billing",          icon: "💳", path: "billing"       },
  ],
  staff: [
    { label: "Dashboard",        icon: "🏠", path: "dashboard"     },
    { label: "Register Patient", icon: "➕", path: "register"      },
    { label: "Doctor Schedules", icon: "🗓️", path: "schedules"     },
    { label: "Appointments",     icon: "📅", path: "appointments"  },
    { label: "Billing",          icon: "💳", path: "billing"       },
  ],
};

export default function Sidebar({ user, activePage, setActivePage, onLogout }) {
  const items = navItems[user?.role] || [];

  return (
    <div className="w-64 min-h-screen bg-gradient-to-b from-blue-700 to-blue-900 text-white flex flex-col shadow-xl fixed left-0 top-0 z-10">

      {/* Logo */}
      <div className="p-6 border-b border-blue-600">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏥</span>
          <div>
            <p className="font-bold text-lg leading-tight">MediCare</p>
            <p className="text-blue-200 text-xs">Clinic Management</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-blue-600 bg-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white text-blue-700 flex items-center justify-center font-bold text-lg">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-sm truncate">{user?.full_name}</p>
            <span className="text-xs bg-blue-500 px-2 py-0.5 rounded-full capitalize">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <button
            key={item.path}
            onClick={() => setActivePage(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
              ${activePage === item.path
                ? "bg-white text-blue-700 shadow-md font-bold"
                : "text-blue-100 hover:bg-blue-600 hover:text-white"
              }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-blue-600">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-blue-100 hover:bg-red-500 hover:text-white transition-all"
        >
          <span className="text-lg">🚪</span>
          <span>Logout</span>
        </button>
      </div>

    </div>
  );
}