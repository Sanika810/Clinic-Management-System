import React, { useState } from "react";
import Login              from "./pages/Login";
import Register           from "./pages/Register";
import Dashboard          from "./pages/Dashboard";
import RegisterPatient    from "./pages/RegisterPatient";
import BookAppointment    from "./pages/BookAppointment";
import ConsultationPage   from "./pages/ConsultationPage";
import PrescriptionPage   from "./pages/PrescriptionPage";
import MedicalRecords     from "./pages/MedicalRecords";
import BillingPage        from "./pages/BillingPage";
import DoctorHistory      from "./pages/DoctorHistory";
import DoctorAppointments from "./pages/DoctorAppointments";
import AllPatients        from "./pages/AllPatients";
import AllDoctors         from "./pages/AllDoctors";
import DoctorSchedulePage from "./pages/DoctorSchedulePage";
import Sidebar            from "./components/Sidebar";
import Navbar             from "./components/Navbar";

export default function App() {
  const [user,       setUser]       = useState(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [showReg,    setShowReg]    = useState(false);
  const [loginMsg,   setLoginMsg]   = useState("");

  const handleLogin = (userData) => {
    setUser(userData);
    setActivePage("dashboard");
    setShowReg(false);
  };

  const handleLogout = () => {
    setUser(null);
    setActivePage("dashboard");
  };

  const goToRegister = () => {
    setLoginMsg("");
    setShowReg(true);
  };

  const backToLogin = (msg = "") => {
    setShowReg(false);
    setLoginMsg(msg);
  };

  if (!user) {
    if (showReg) return <Register onBackToLogin={backToLogin} />;
    return (
      <Login
        onLogin={handleLogin}
        onRegister={goToRegister}
        successMessage={loginMsg}
      />
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":     return <Dashboard          user={user} />;
      case "register":      return <RegisterPatient    user={user} />;
      case "patients":      return <AllPatients        />;
      case "doctors":       return <AllDoctors         />;
      case "schedules":     return <DoctorSchedulePage />;
      case "book":          return <BookAppointment    user={user} />;
      case "consultation":  return <ConsultationPage   user={user} />;
      case "prescriptions": return <PrescriptionPage   user={user} />;
      case "records":       return <MedicalRecords     user={user} />;
      case "billing":       return <BillingPage        user={user} />;
      case "history":       return <DoctorHistory      user={user} />;

      // appointments now goes to the RIGHT page per role
      case "appointments":
        if (user.role === "doctor") return <DoctorAppointments user={user} />;
        return <BillingPage user={user} />;  // admin/staff see billing-style appointments

      default:              return <Dashboard          user={user} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        user={user}
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col ml-64">
        <Navbar activePage={activePage} user={user} />
        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}