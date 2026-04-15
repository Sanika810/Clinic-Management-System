import React, { useState } from "react";
import { registerUser, registerPatient, loginUser } from "../services/api";

export default function Register({ onBackToLogin }) {
  const [step, setStep]     = useState(1);
  const [role, setRole]     = useState("patient");
  const [form, setForm]     = useState({
    full_name:   "",
    email:       "",
    password:    "",
    confirm:     "",
    dob:         "",
    gender:      "Male",
    phone:       "",
    address:     "",
    blood_group: ""
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleStep1 = () => {
    setError("");
    if (!form.full_name || !form.email || !form.password) {
      setError("All fields are required"); return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match"); return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters"); return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      // Step 1: Create user
      await registerUser({
        full_name: form.full_name,
        email:     form.email,
        password:  form.password,
        role:      role
      });

      // Step 2: If patient, create patient profile too
      if (role === "patient") {
        // Login to get user_id
        const loginRes = await loginUser({
          email:    form.email,
          password: form.password
        });
        const user_id = loginRes.data.user_id;

        await registerPatient({
          user_id,
          full_name:   form.full_name,
          dob:         form.dob || "2000-01-01",
          gender:      form.gender,
          phone:       form.phone,
          address:     form.address,
          blood_group: form.blood_group
        });
      }

      // Done — go back to login
      onBackToLogin("Account created successfully! Please login.");
    } catch (e) {
      setError(e.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-6xl">🏥</span>
          <h1 className="text-3xl font-bold text-white mt-3">MediCare</h1>
          <p className="text-blue-200 mt-1">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">

          {/* Progress Bar */}
          <div className="flex items-center mb-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 rounded ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}/>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
              2
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Step 1: Account Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Account Details</h2>

              {/* Role Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
                <div className="grid grid-cols-2 gap-2">
                  {["patient","staff"].map(r => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`py-2 px-4 rounded-lg border-2 text-sm font-medium capitalize transition-all
                        ${role === r
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-600 hover:border-blue-300"}`}
                    >
                      {r === "patient" ? "🧑 Patient" : "🧑‍💼 Staff"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.full_name}
                  onChange={e => update("full_name", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="john@email.com"
                  value={form.email}
                  onChange={e => update("email", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={e => update("password", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={form.confirm}
                  onChange={e => update("confirm", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleStep1}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all"
              >
                Next →
              </button>
            </div>
          )}

          {/* Step 2: Profile Info */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                {role === "patient" ? "Patient Profile" : "Staff Profile"}
              </h2>

              {role === "patient" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={form.dob}
                        onChange={e => update("dob", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select
                        value={form.gender}
                        onChange={e => update("gender", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      placeholder="9876543210"
                      value={form.phone}
                      onChange={e => update("phone", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      placeholder="City, State"
                      value={form.address}
                      onChange={e => update("address", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                    <select
                      value={form.blood_group}
                      onChange={e => update("blood_group", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select</option>
                      {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => (
                        <option key={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {role === "staff" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    value={form.phone}
                    onChange={e => update("phone", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-300 text-gray-600 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Account"}
                </button>
              </div>
            </div>
          )}

          {/* Back to Login */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <button
              onClick={() => onBackToLogin("")}
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}