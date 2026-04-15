CREATE OR REPLACE TRIGGER trg_no_slot_collision
BEFORE INSERT ON APPOINTMENTS
FOR EACH ROW
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM APPOINTMENTS
  WHERE doctor_id  = :NEW.doctor_id
    AND appt_date  = :NEW.appt_date
    AND time_slot  = :NEW.time_slot
    AND status    != 'Cancelled';

  IF v_count > 0 THEN
    RAISE_APPLICATION_ERROR(
      -20001,
      'Slot already booked: Doctor ' || :NEW.doctor_id ||
      ' on ' || TO_CHAR(:NEW.appt_date,'YYYY-MM-DD') ||
      ' at ' || :NEW.time_slot
    );
  END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_auto_billing
AFTER INSERT ON APPOINTMENTS
FOR EACH ROW
DECLARE
  v_fee NUMBER(10,2);
BEGIN
  SELECT fee INTO v_fee
  FROM DOCTORS
  WHERE doctor_id = :NEW.doctor_id;

  INSERT INTO BILLING (appointment_id, patient_id, amount, status)
  VALUES (:NEW.appointment_id, :NEW.patient_id, v_fee, 'Pending');
END;
/