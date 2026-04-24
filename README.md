# 🏥 Clinic Management System

A full-stack **Clinic Management System** designed to streamline clinical operations such as patient management, appointment scheduling, consultation, prescription handling, billing, and secure role-based access.

---

## 🚀 Overview

This system provides an end-to-end solution for managing a clinic digitally. It ensures:

* Efficient patient registration
* Organized doctor scheduling
* Conflict-free appointment booking
* Structured consultation & prescriptions
* Automated billing
* Secure login with role-based dashboards

---

## 🧩 Tech Stack

| Layer    | Technology                |
| -------- | ------------------------- |
| Database | Oracle SQL (SQL*Plus)     |
| Backend  | Python Flask (REST APIs)  |
| Frontend | React (SPA)               |
| Styling  | Tailwind CSS (CDN आधारित) |

---

## 🔐 Authentication System

### 👥 Supported Roles

1. **Admin 🛠️**

   * Manage doctors, departments
   * View system reports

2. **Doctor 👨‍⚕️**

   * View appointments
   * Add consultation & prescriptions

3. **Patient 👤**

   * Register/Login
   * Book appointments
   * View medical records

---

### 🔑 Login Flow

1. User enters:

   * Email / Username
   * Password

2. System:

   * Verifies credentials from database
   * Uses **hashed passwords**

3. On success:

   * Redirects to role-specific dashboard

4. On failure:

   * Displays error message

---

## ⚙️ Core Functional Modules

### 👤 Patient Registration

* Stores:

  * Name, Age, Gender
  * Contact details
  * Address
* Generates unique **Patient ID**

---

### 👨‍⚕️ Doctor Management

* Each doctor:

  * Belongs to **one department**
  * Has defined availability schedule

---

### 📅 Appointment Scheduling

* Patient selects doctor
* System shows available slots
* Prevents **slot collision**
* Stores:

  * Patient ID
  * Doctor ID
  * Date & Time

---

### 🩺 Consultation & Prescription

* Only for completed appointments

**Prescription Format (Strict):**

* Medicine Name
* Dosage
* Frequency
* Duration

---

### 📂 Medical Records

Displays:

* Completed Appointments
* Pending Appointments

Includes:

* Doctor details
* Prescription
* Billing

---

### 💰 Billing System

* Automatically generated per appointment
* Stores:

  * Billing ID
  * Appointment ID
  * Amount
  * Payment Status

---

## 🗄️ Database Design

### 🔑 Main Entities

* Patient
* Doctor
* Department
* Appointment
* Consultation
* Prescription
* Medication
* Billing

---

### 🔗 Relationships

* Patient → Appointment (1:M)
* Doctor → Appointment (1:M)
* Appointment → Consultation (1:1)
* Consultation → Prescription (1:M)
* Appointment → Billing (1:1)

---

## 🔥 Database Triggers

### 1️⃣ Prevent Slot Collision

* Trigger: **Before INSERT on Appointment**
* Logic:

  * Reject if same doctor has same time slot

---

### 2️⃣ Automatic Billing

* Trigger: **After INSERT on Appointment**
* Logic:

  * Fetch doctor consultation fee
  * Auto-create billing record
  * Set status = *Pending*

---

## 📁 Project Structure

### Backend

```
backend/
│── app.py
│── routes/
│── models/
│── db/
```

### Frontend

```
frontend/
│── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── App.jsx
```

---

## 🛠️ Setup Instructions

### 1️⃣ Database

* Connect using:

```
sqlplus system/sanika123@localhost:1521/XE
```

* Run schema + triggers + seed data

---

### 2️⃣ Backend

* Create virtual environment
* Install dependencies:

  * Flask
  * Flask-CORS
  * cx_Oracle

---

### 3️⃣ Frontend

* Create React app
* Use Tailwind via CDN:

```html
<script src="https://cdn.tailwindcss.com"></script>
```

⚠️ Do NOT install Tailwind via npm

---

## ⚡ Key Features

✔ Role-Based Access Control (RBAC)
✔ Slot conflict prevention
✔ Automatic billing generation
✔ Structured prescriptions
✔ Modular architecture
✔ Clean API design

---

## 🚨 Important Constraints

* ❌ No double booking allowed
* ✔ Doctor belongs to exactly one department
* ✔ Billing must exist for every appointment
* ✔ Prescription only after consultation

---

## 🎯 Goal

To build a **robust, scalable, and cleanly structured clinic system** where:

* Data integrity is maintained
* Operations are automated
* User experience is smooth

---

## 💡 Note

This project strictly follows:

* Clean architecture
* Step-by-step development
* Fully working integration (DB + Backend + Frontend)

---

✨ *Designed for clarity, reliability, and real-world usability.*
