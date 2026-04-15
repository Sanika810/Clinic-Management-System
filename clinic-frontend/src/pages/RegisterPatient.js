import React, { useState } from "react";
import { registerUser, registerPatient } from "../services/api";

export default function RegisterPatient() {
  const [form, setForm] = useState({
    full_name: "", email: "", password: "Password123",
    dob: "", gender: "Male", phone: "", address: "", blood_group: ""
  });
  const [msg, setMsg]     = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setMsg(""); setError(""); setLoading(true);
    try {
      // Step 1: Create user account
      const userRes = await registerUser({
        full_name: form.full_name,
        email:     form.email,
        password:  form.password,
        role:      "patient"
      });

      // Step 2: Get user_id from login
      const { loginUser } = await import("../services/api");
      const loginRes = await loginUser({ email: form.email, password: form.password });
      const user_id  = loginRes.data.user_id;

      // Step 3: Create patient record
      await registerPatient({ ...form, user_id });
      setMsg("✅ Patient registered successfully!");
      setForm({ full_name:"",email:"",password:"Password123",dob:"",gender:"Male",phone:"",address:"",blood_group:"" });
    } catch (e) {
      setError(e.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key:"full_name", label:"Full Name",    type:"text",   placeholder:"John Doe" },
    { key:"email",     label:"Email",        type:"email",  placeholder:"john@email.com" },
    { key:"password",  label:"Password",     type:"text",   placeholder:"Default: Password123" },
    { key:"dob",       label:"Date of Birth",type:"date",   placeholder:"" },
    { key:"phone",     label:"Phone",        type:"text",   placeholder:"9876543210" },
    { key:"address",   label:"Address",      type:"text",   placeholder:"City, State" },
    { key:"blood_group",label:"Blood Group", type:"text",   placeholder:"A+, B-, O+" },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Register Patient</h2>
        <p className="text-gray-500 text-sm mb-6">Add a new patient to the system</p>

        {msg   && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{msg}</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">⚠️ {error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              value={form.gender}
              onChange={e => setForm({ ...form, gender: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register Patient"}
        </button>
      </div>
    </div>
  );
}