import React, { useEffect, useState } from "react";
import { getPatients } from "../services/api";

export default function AllPatients() {
  const [patients, setPatients] = useState([]);
  const [search,   setSearch]   = useState("");
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getPatients()
      .then(r => setPatients(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter(p =>
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search) ||
    p.blood_group?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-6 text-gray-400">Loading patients...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">All Patients</h2>
          <p className="text-gray-500 text-sm mt-1">{patients.length} registered patients</p>
        </div>
        <input
          type="text"
          placeholder="Search by name, phone, blood group..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["#","Name","Gender","DOB","Phone","Address","Blood Group","Registered"].map(h => (
                <th key={h} className="text-left px-5 py-4 font-semibold text-gray-600 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-12 text-gray-300">No patients found.</td>
              </tr>
            ) : filtered.map((p, i) => (
              <tr key={p.patient_id} className="hover:bg-gray-50">
                <td className="px-5 py-4 text-gray-400">{i + 1}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {p.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800">{p.full_name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-600">{p.gender || "—"}</td>
                <td className="px-5 py-4 text-gray-600">{p.dob ? p.dob.substring(0,10) : "—"}</td>
                <td className="px-5 py-4 text-gray-600">{p.phone || "—"}</td>
                <td className="px-5 py-4 text-gray-600">{p.address || "—"}</td>
                <td className="px-5 py-4">
                  {p.blood_group ? (
                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-semibold">
                      {p.blood_group}
                    </span>
                  ) : "—"}
                </td>
                <td className="px-5 py-4 text-gray-400 text-xs">
                  {p.created_at ? p.created_at.substring(0,10) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}