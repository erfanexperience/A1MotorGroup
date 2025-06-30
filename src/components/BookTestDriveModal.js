import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';

const today = new Date();
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Helper to check if a date is Sunday
function isSunday(dateStr) {
  const d = new Date(dateStr);
  return d.getDay() === 0;
}

// Helper to get all time slots
const TIME_SLOTS = [
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
];

// Simple hash for deterministic randomization
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getBusySlotsForDate(dateStr) {
  // 30% of 7 slots = 2 slots
  const numBusy = 2;
  const hash = hashString(dateStr);
  // Deterministically pick 2 unique slots
  const slots = [...Array(TIME_SLOTS.length).keys()];
  let busy = [];
  let h = hash;
  while (busy.length < numBusy) {
    const idx = h % TIME_SLOTS.length;
    if (!busy.includes(idx)) busy.push(idx);
    h = Math.floor(h / 2) + 17;
  }
  return busy;
}

const BookTestDriveModal = ({ isOpen, onClose, cars, preselectedCarVin, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [selectedCarVin, setSelectedCarVin] = useState(preselectedCarVin || '');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (preselectedCarVin) setSelectedCarVin(preselectedCarVin);
    if (isOpen) {
      setStep(1);
      setSuccess(false);
      setErrors({});
    }
  }, [isOpen, preselectedCarVin]);

  // Generate time slots from 10 AM to 4 PM
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 10; hour <= 16; hour++) {
      slots.push(`${hour}:00`);
      if (hour !== 16) slots.push(`${hour}:30`);
    }
    return slots;
  }, []);

  // Generate random busy slots (30% of slots)
  const busySlots = useMemo(() => {
    const busy = new Set();
    const totalSlots = timeSlots.length;
    const busyCount = Math.floor(totalSlots * 0.3);
    
    while (busy.size < busyCount) {
      const randomIndex = Math.floor(Math.random() * totalSlots);
      busy.add(randomIndex);
    }
    
    return busy;
  }, [timeSlots]);

  // Filter out Sundays and busy slots
  const availableTimeSlots = useMemo(() => {
    return timeSlots.filter((_, index) => !busySlots.has(index));
  }, [timeSlots, busySlots]);

  // Set default date to next available day (not Sunday)
  useEffect(() => {
    if (!selectedDate) {
      const today = new Date();
      let nextDay = new Date(today);
      nextDay.setDate(today.getDate() + 1);
      
      // Skip Sundays
      while (nextDay.getDay() === 0) {
        nextDay.setDate(nextDay.getDate() + 1);
      }
      
      setSelectedDate(nextDay.toISOString().split('T')[0]);
    }
  }, [selectedDate]);

  // Set default time to first available slot
  useEffect(() => {
    if (!selectedTime && availableTimeSlots.length > 0) {
      setSelectedTime(availableTimeSlots[0]);
    }
  }, [selectedTime, availableTimeSlots]);

  if (!isOpen) return null;

  const carOptions = cars || [];
  const selectedCar = carOptions.find(c => c.vin === selectedCarVin);

  const validateStep = () => {
    let errs = {};
    if (step === 1 && !selectedCarVin) errs.selectedCarVin = 'Please select a car.';
    if (step === 2) {
      if (!selectedDate) errs.date = 'Please select a date.';
      if (isSunday(selectedDate)) errs.date = 'We are closed on Sundays.';
      if (!selectedTime) errs.time = 'Please select a time.';
    }
    if (step === 3) {
      if (!userInfo.name.trim()) errs.name = 'Full name required.';
      if (!userInfo.phone.trim()) errs.phone = 'Phone required.';
      if (!userInfo.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(userInfo.email)) errs.email = 'Valid email required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(step + 1);
  };
  const handleBack = () => setStep(step - 1);

  const handleDateChange = e => {
    const val = e.target.value;
    if (!isSunday(val)) setSelectedDate(val);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!validateStep()) return;
    setSuccess(true);
    if (onSubmit) {
      onSubmit({
        carVin: selectedCarVin,
        date: selectedDate,
        time: selectedTime,
        fullName: userInfo.name,
        phone: userInfo.phone,
        email: userInfo.email,
      });
    }
  };

  // For disabling Sundays in the date picker
  const minDate = formatDate(today);
  const maxDate = formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14));

  return (
    <>
      <BlurOverlay onClick={onClose} />
      <ModalContainer role="dialog" aria-modal="true">
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <ModalContent>
          <ModalTitle>Book a Test Drive</ModalTitle>
          {success ? (
            <SuccessMessage>
              <h2>Thank you!</h2>
              <p>Your test drive request has been received.<br />We will contact you soon.</p>
              <SuccessButton onClick={onClose}>Close</SuccessButton>
            </SuccessMessage>
          ) : (
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <FormStep>
                  <Label htmlFor="car-select">Select a Car</Label>
                  <Select
                    id="car-select"
                    value={selectedCarVin}
                    onChange={e => setSelectedCarVin(e.target.value)}
                    required
                  >
                    <option value="">-- Choose a car --</option>
                    {carOptions.map(car => (
                      <option key={car.vin} value={car.vin}>
                        {car.modelYear || car.year} {car.make} {car.model}
                      </option>
                    ))}
                  </Select>
                  {errors.selectedCarVin && <ErrorMsg>{errors.selectedCarVin}</ErrorMsg>}
                  <StepActions>
                    <NextButton type="button" onClick={handleNext}>Next</NextButton>
                  </StepActions>
                </FormStep>
              )}
              {step === 2 && (
                <FormStep>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    min={minDate}
                    max={maxDate}
                    value={selectedDate}
                    onChange={handleDateChange}
                    required
                  />
                  {errors.date && <ErrorMsg>{errors.date}</ErrorMsg>}
                  <Label>Time</Label>
                  <Select
                    value={selectedTime}
                    onChange={e => setSelectedTime(e.target.value)}
                    required
                  >
                    {availableTimeSlots.map((slot, idx) => (
                      <option
                        key={slot}
                        value={slot}
                        style={busySlots.has(idx) ? { color: '#aaa', background: '#f3f4f6' } : {}}
                      >
                        {slot}
                      </option>
                    ))}
                  </Select>
                  {errors.time && <ErrorMsg>{errors.time}</ErrorMsg>}
                  <StepActions>
                    <BackButton type="button" onClick={handleBack}>Back</BackButton>
                    <NextButton type="button" onClick={handleNext}>Next</NextButton>
                  </StepActions>
                </FormStep>
              )}
              {step === 3 && (
                <FormStep>
                  <Label>Full Name</Label>
                  <Input
                    type="text"
                    value={userInfo.name}
                    onChange={e => setUserInfo({ ...userInfo, name: e.target.value })}
                    required
                  />
                  {errors.name && <ErrorMsg>{errors.name}</ErrorMsg>}
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    value={userInfo.phone}
                    onChange={e => setUserInfo({ ...userInfo, phone: e.target.value })}
                    required
                  />
                  {errors.phone && <ErrorMsg>{errors.phone}</ErrorMsg>}
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={userInfo.email}
                    onChange={e => setUserInfo({ ...userInfo, email: e.target.value })}
                    required
                  />
                  {errors.email && <ErrorMsg>{errors.email}</ErrorMsg>}
                  <StepActions>
                    <BackButton type="button" onClick={handleBack}>Back</BackButton>
                    <SubmitButton type="submit">Submit</SubmitButton>
                  </StepActions>
                </FormStep>
              )}
            </form>
          )}
        </ModalContent>
      </ModalContainer>
    </>
  );
};

const blur = keyframes`
  from { backdrop-filter: blur(0px); }
  to { backdrop-filter: blur(6px); }
`;
const BlurOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(30,41,59,0.18);
  z-index: 1000;
  animation: ${blur} 0.2s ease;
  backdrop-filter: blur(6px);
`;
const ModalContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(30,41,59,0.18);
  z-index: 1001;
  width: 98vw;
  max-width: 420px;
  padding: 0;
  overflow: hidden;
`;
const ModalContent = styled.div`
  padding: 2.2rem 2rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;
const ModalTitle = styled.h2`
  font-size: 1.6rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1.2rem;
  text-align: center;
`;
const CloseButton = styled.button`
  position: absolute;
  top: 1.1rem;
  right: 1.1rem;
  background: none;
  border: none;
  font-size: 2rem;
  color: #888;
  cursor: pointer;
  z-index: 2;
  &:hover { color: #2c3e50; }
`;
const FormStep = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
`;
const Label = styled.label`
  font-size: 1.05rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.2rem;
`;
const Select = styled.select`
  padding: 0.7rem 1rem;
  border-radius: 8px;
  border: 1.5px solid #e2e8f0;
  font-size: 1rem;
  background: #f7fafc;
  margin-bottom: 0.2rem;
`;
const Input = styled.input`
  padding: 0.7rem 1rem;
  border-radius: 8px;
  border: 1.5px solid #e2e8f0;
  font-size: 1rem;
  background: #f7fafc;
  margin-bottom: 0.2rem;
`;
const StepActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.2rem;
`;
const NextButton = styled.button`
  background: #3182ce;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #2b6cb0; }
`;
const BackButton = styled.button`
  background: #f0f4f8;
  color: #2d3748;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #e2e8f0; }
`;
const SubmitButton = styled.button`
  background: #2196F3;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #1769aa; }
`;
const ErrorMsg = styled.div`
  color: #e53e3e;
  font-size: 0.95rem;
  margin-bottom: 0.2rem;
`;
const SuccessMessage = styled.div`
  text-align: center;
  padding: 2rem 0;
  h2 { color: #2196F3; margin-bottom: 0.7rem; }
  p { color: #2c3e50; font-size: 1.1rem; }
`;
const SuccessButton = styled.button`
  margin-top: 1.5rem;
  background: #3182ce;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #2b6cb0; }
`;

export default BookTestDriveModal; 