-- Run this to clean up if re-running setup
BEGIN
  FOR t IN (
    SELECT table_name FROM user_tables
    WHERE table_name IN (
      'BILLING','PRESCRIPTIONS','CONSULTATIONS',
      'APPOINTMENTS','SCHEDULES','PATIENTS',
      'DOCTORS','DEPARTMENTS','USERS'
    )
  ) LOOP
    EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS';
  END LOOP;
END;
/
CREATE TABLE DEPARTMENTS (
  department_id   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  dept_name       VARCHAR2(100) NOT NULL,
  description     VARCHAR2(255)
);
CREATE TABLE USERS (
  user_id         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name       VARCHAR2(100) NOT NULL,
  email           VARCHAR2(150) NOT NULL UNIQUE,
  password_hash   VARCHAR2(255) NOT NULL,
  role            VARCHAR2(20)  NOT NULL CHECK (role IN ('admin','doctor','patient','staff')),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE DOCTORS (
  doctor_id       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id         NUMBER NOT NULL UNIQUE,
  department_id   NUMBER NOT NULL,
  specialization  VARCHAR2(100) NOT NULL,
  phone           VARCHAR2(15),
  fee             NUMBER(10,2) DEFAULT 500,
  CONSTRAINT fk_doc_user FOREIGN KEY (user_id)        REFERENCES USERS(user_id),
  CONSTRAINT fk_doc_dept FOREIGN KEY (department_id)  REFERENCES DEPARTMENTS(department_id)
);

CREATE TABLE PATIENTS (
  patient_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id         NUMBER UNIQUE,
  full_name       VARCHAR2(100) NOT NULL,
  dob             DATE,
  gender          VARCHAR2(10) CHECK (gender IN ('Male','Female','Other')),
  phone           VARCHAR2(15),
  address         VARCHAR2(255),
  blood_group     VARCHAR2(5),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pat_user FOREIGN KEY (user_id) REFERENCES USERS(user_id)
);

CREATE TABLE SCHEDULES (
  schedule_id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  doctor_id       NUMBER NOT NULL,
  day_of_week     VARCHAR2(10) NOT NULL CHECK (day_of_week IN (
                    'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
  start_time      VARCHAR2(8) NOT NULL,
  end_time        VARCHAR2(8) NOT NULL,
  CONSTRAINT fk_sch_doc FOREIGN KEY (doctor_id) REFERENCES DOCTORS(doctor_id),
  CONSTRAINT uq_schedule UNIQUE (doctor_id, day_of_week, start_time)
);

CREATE TABLE APPOINTMENTS (
  appointment_id  NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  patient_id      NUMBER NOT NULL,
  doctor_id       NUMBER NOT NULL,
  appt_date       DATE NOT NULL,
  time_slot       VARCHAR2(8) NOT NULL,
  status          VARCHAR2(20) DEFAULT 'Scheduled' CHECK (
                    status IN ('Scheduled','Completed','Cancelled')),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_appt_pat FOREIGN KEY (patient_id) REFERENCES PATIENTS(patient_id),
  CONSTRAINT fk_appt_doc FOREIGN KEY (doctor_id)  REFERENCES DOCTORS(doctor_id),
  CONSTRAINT uq_appt_slot UNIQUE (doctor_id, appt_date, time_slot)
);

CREATE TABLE CONSULTATIONS (
  consultation_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  appointment_id  NUMBER NOT NULL UNIQUE,
  symptoms        VARCHAR2(500),
  diagnosis       VARCHAR2(500),
  notes           VARCHAR2(1000),
  consulted_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_con_appt FOREIGN KEY (appointment_id) REFERENCES APPOINTMENTS(appointment_id)
);

CREATE TABLE PRESCRIPTIONS (
  prescription_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  consultation_id NUMBER NOT NULL,
  medicine_name   VARCHAR2(100) NOT NULL,
  dosage          VARCHAR2(50)  NOT NULL,
  frequency       VARCHAR2(50)  NOT NULL,
  duration        VARCHAR2(50)  NOT NULL,
  CONSTRAINT fk_pres_con FOREIGN KEY (consultation_id) REFERENCES CONSULTATIONS(consultation_id)
);

CREATE TABLE BILLING (
  bill_id         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  appointment_id  NUMBER NOT NULL UNIQUE,
  patient_id      NUMBER NOT NULL,
  amount          NUMBER(10,2) NOT NULL,
  status          VARCHAR2(20) DEFAULT 'Pending' CHECK (status IN ('Pending','Paid','Cancelled')),
  generated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bill_appt FOREIGN KEY (appointment_id) REFERENCES APPOINTMENTS(appointment_id),
  CONSTRAINT fk_bill_pat  FOREIGN KEY (patient_id)     REFERENCES PATIENTS(patient_id)
);

CREATE TABLE PAYMENTS (
  payment_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  bill_id         NUMBER NOT NULL UNIQUE,
  patient_id      NUMBER NOT NULL,
  amount          NUMBER(10,2) NOT NULL,
  payment_mode    VARCHAR2(20) NOT NULL CHECK (payment_mode IN ('Cash','Card','UPI','Net Banking')),
  payment_status  VARCHAR2(20) DEFAULT 'Paid' CHECK (payment_status IN ('Paid','Failed','Refunded')),
  paid_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pay_bill FOREIGN KEY (bill_id)    REFERENCES BILLING(bill_id),
  CONSTRAINT fk_pay_pat  FOREIGN KEY (patient_id) REFERENCES PATIENTS(patient_id)
);

