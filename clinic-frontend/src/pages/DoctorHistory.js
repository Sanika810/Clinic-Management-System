import React, { useEffect, useState } from "react";
import { getAppointments, getConsultation } from "../services/api";

export default function DoctorHistory({ user }) {
    const [appointments, setAppointments] = useState([]);
    const [expanded, setExpanded] = useState(null);
    const [consultation, setConsultation] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user.doctor_id) return; // safety guard
        getAppointments({ doctor_id: user.doctor_id })
            .then(r => setAppointments(r.data.filter(a => a.status === "Completed")))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    const toggleExpand = async (appt) => {
        if (expanded === appt.appointment_id) {
            setExpanded(null);
            return;
        }
        setExpanded(appt.appointment_id);
        if (!consultation[appt.appointment_id]) {
            try {
                const res = await getConsultation(appt.appointment_id);
                setConsultation(prev => ({ ...prev, [appt.appointment_id]: res.data }));
            } catch {
                setConsultation(prev => ({ ...prev, [appt.appointment_id]: null }));
            }
        }
    };

    if (loading) return <div className="p-6 text-gray-400">Loading history...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Patient History</h2>
                <p className="text-gray-500 text-sm mt-1">All completed consultations and prescriptions</p>
            </div>

            {appointments.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-12 text-center text-gray-300">
                    <p className="text-5xl">📋</p>
                    <p className="mt-3 text-sm">No completed appointments yet.</p>
                </div>
            ) : (
                appointments.map(appt => {
                    const con = consultation[appt.appointment_id];
                    const isOpen = expanded === appt.appointment_id;

                    return (
                        <div key={appt.appointment_id} className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">

                            {/* Header Row */}
                            <div
                                onClick={() => toggleExpand(appt)}
                                className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                        {appt.patient_name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{appt.patient_name}</p>
                                        <p className="text-xs text-gray-400">{appt.appt_date} at {appt.time_slot}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                                        Completed
                                    </span>
                                    <span className="text-gray-400 text-sm">{isOpen ? "▲" : "▼"}</span>
                                </div>
                            </div>

                            {/* Expanded Detail */}
                            {isOpen && (
                                <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">
                                    {con === undefined ? (
                                        <p className="text-gray-400 text-sm">Loading...</p>
                                    ) : con === null ? (
                                        <p className="text-gray-400 text-sm">No consultation record found.</p>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {[
                                                    { label: "Symptoms", value: con.symptoms },
                                                    { label: "Diagnosis", value: con.diagnosis },
                                                    { label: "Notes", value: con.notes },
                                                ].map(f => (
                                                    <div key={f.label} className="bg-white rounded-lg p-4 border border-gray-200">
                                                        <p className="text-xs text-gray-400 uppercase font-semibold mb-1">{f.label}</p>
                                                        <p className="text-sm text-gray-700">{f.value || "—"}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {con.prescriptions?.length > 0 && (
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase font-semibold mb-2">💊 Prescriptions</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {con.prescriptions.map((p, i) => (
                                                            <div key={i} className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                                                <p className="font-semibold text-blue-800 text-sm">{p.medicine_name}</p>
                                                                <div className="flex gap-4 mt-1">
                                                                    <span className="text-xs text-gray-500">Dosage: <b>{p.dosage}</b></span>
                                                                    <span className="text-xs text-gray-500">Freq: <b>{p.frequency}</b></span>
                                                                    <span className="text-xs text-gray-500">Duration: <b>{p.duration}</b></span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <p className="text-xs text-gray-400">
                                                Consulted at: {con.consulted_at}
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}