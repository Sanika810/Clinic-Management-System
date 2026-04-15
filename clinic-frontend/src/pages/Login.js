import React, { useState } from "react";
import { loginUser } from "../services/api";

export default function Login({ onLogin, onRegister }) {
  const [form,    setForm]    = useState({ email: "", password: "" });
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      const res = await loginUser(form);
      onLogin(res.data);
    } catch (e) {
      setError(e.response?.data?.error || "Login failed. Check email and password.");
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
          <p className="text-blue-200 mt-1">Clinic Management System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Sign In</h2>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
              ✅ {success}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>

          {/* Test Accounts */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 mb-2">TEST ACCOUNTS (password: Password123)</p>
            <div className="space-y-1 text-xs text-gray-600">
              {[
                { icon:"👨‍💼", label:"Admin",   email:"admin@clinic.com"  },
                { icon:"👨‍⚕️", label:"Doctor",  email:"anjali@clinic.com" },
                { icon:"🧑",  label:"Patient", email:"priya@gmail.com"   },
                { icon:"🧑‍💼", label:"Staff",   email:"sneha@clinic.com"  },
              ].map(a => (
                <div
                  key={a.email}
                  onClick={() => setForm({ email: a.email, password: "Password123" })}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                >
                  <span>{a.icon}</span>
                  <span className="font-medium">{a.label}:</span>
                  <span className="text-blue-600">{a.email}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">💡 Click any account to auto-fill</p>
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            New patient?{" "}
            <button
              onClick={onRegister}
              className="text-blue-600 font-semibold hover:underline"
            >
              Create Account
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}