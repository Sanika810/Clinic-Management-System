import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const loginUser       = (data)              => API.post("/login", data);
export const registerUser    = (data)              => API.post("/register", data);
export const registerPatient = (data)              => API.post("/patients", data);
export const getPatients     = ()                  => API.get("/patients");
export const getDoctors      = ()                  => API.get("/doctors");
export const getDoctorSchedule  = (id)             => API.get(`/doctors/${id}/schedule`);
export const getBookedSlots  = (id, date)          => API.get(`/doctors/${id}/booked-slots?date=${date}`);
export const bookAppointment = (data)              => API.post("/appointments", data);
export const getAppointments = (params)            => API.get("/appointments", { params });
export const saveConsultation= (data)              => API.post("/consultations", data);
export const getConsultation = (appointmentId)     => API.get(`/consultations/${appointmentId}`);
export const getPatientRecords = (patientId)       => API.get(`/patient-records/${patientId}`);
export const getBilling      = (params)            => API.get("/billing", { params });
export const updateBillStatus= (id, status)        => API.patch(`/billing/${id}/status`, { status });
export const updateApptStatus= (id, status)        => API.patch(`/appointments/${id}/status`, { status });
export const makePayment    = (data)       => API.post("/payments", data);
export const getPayments    = (params)     => API.get("/payments", { params });