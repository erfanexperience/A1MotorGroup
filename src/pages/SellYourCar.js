import React, { useState } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import buyImg from '../assests/buy.webp';

const initialCarState = { vin: '', make: '', model: '', year: '', mileage: '' };
const initialUserState = { firstName: '', lastName: '', email: '', phone: '' };

const SellYourCar = () => {
  const [step, setStep] = useState(1);
  const [car, setCar] = useState(initialCarState);
  const [user, setUser] = useState(initialUserState);
  const [loading, setLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [vinError, setVinError] = useState('');

  // Responsive: only show image on desktop
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Simulate API call to fetch car info by VIN
  const fetchCarInfo = async (vin) => {
    setLoading(true);
    setVinError('');
    try {
      // Replace with your real API endpoint
      const response = await fetch(`/api/vehicles?vin=${vin}`);
      if (!response.ok) throw new Error('Not found');
      const data = await response.json();
      if (data && data.length > 0) {
        const vehicle = data[0];
        setCar({
          vin: vehicle.vin || vin,
          make: vehicle.make || '',
          model: vehicle.model || '',
          year: vehicle.modelYear || vehicle.year || '',
          mileage: '',
        });
      } else {
        setVinError('No vehicle found for this VIN. Please enter details manually.');
      }
    } catch (err) {
      setVinError('No vehicle found for this VIN. Please enter details manually.');
    }
    setLoading(false);
  };

  const handleCarChange = e => {
    setCar({ ...car, [e.target.name]: e.target.value });
  };

  const handleUserChange = e => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleVinSubmit = async e => {
    e.preventDefault();
    if (car.vin.length >= 11) {
      await fetchCarInfo(car.vin);
    }
  };

  const handleNext = e => {
    e.preventDefault();
    setStep(step + 1);
  };

  const handleBack = e => {
    e.preventDefault();
    setStep(step - 1);
  };

  const handleSubmit = e => {
    e.preventDefault();
    setShowThankYou(true);
    // TODO: Send data to backend
  };

  return (
    <>
      <Header />
      <SellPageOuter>
        <SellFlex>
          <SellFormCol>
            <SellTitle>Sell Your Vehicle</SellTitle>
            <SellSubheading>We pay cash for your car the same day you bring it to our dealership.</SellSubheading>
            <SellSteps>
              <SellStep active={step === 1}>1</SellStep>
              <SellStepLine />
              <SellStep active={step === 2}>2</SellStep>
            </SellSteps>
            {step === 1 && (
              <form onSubmit={handleNext} autoComplete="off">
                <StepLabel>Enter your VIN (or fill manually):</StepLabel>
                <VinRow>
                  <VinInput
                    name="vin"
                    value={car.vin}
                    onChange={handleCarChange}
                    placeholder="VIN Number"
                    maxLength={17}
                  />
                  <VinButton type="button" onClick={handleVinSubmit} disabled={loading || !car.vin || car.vin.length < 11}>
                    {loading ? 'Loading...' : 'Auto-Fill'}
                  </VinButton>
                </VinRow>
                {vinError && <VinError>{vinError}</VinError>}
                <FormRow>
                  <FormField>
                    <label>Make</label>
                    <input name="make" value={car.make} onChange={handleCarChange} required />
                  </FormField>
                  <FormField>
                    <label>Model</label>
                    <input name="model" value={car.model} onChange={handleCarChange} required />
                  </FormField>
                </FormRow>
                <FormRow>
                  <FormField>
                    <label>Year</label>
                    <input name="year" value={car.year} onChange={handleCarChange} required />
                  </FormField>
                  <FormField>
                    <label>Mileage</label>
                    <input name="mileage" value={car.mileage} onChange={handleCarChange} required />
                  </FormField>
                </FormRow>
                <StepButtons>
                  <NextButton type="submit">Next</NextButton>
                </StepButtons>
              </form>
            )}
            {step === 2 && (
              <form onSubmit={handleSubmit} autoComplete="off">
                <StepLabel>Your Contact Information:</StepLabel>
                <FormRow>
                  <FormField>
                    <label>First Name</label>
                    <input name="firstName" value={user.firstName} onChange={handleUserChange} required />
                  </FormField>
                  <FormField>
                    <label>Last Name</label>
                    <input name="lastName" value={user.lastName} onChange={handleUserChange} required />
                  </FormField>
                </FormRow>
                <FormRow>
                  <FormField>
                    <label>Email</label>
                    <input name="email" type="email" value={user.email} onChange={handleUserChange} required />
                  </FormField>
                  <FormField>
                    <label>Phone</label>
                    <input name="phone" value={user.phone} onChange={handleUserChange} required />
                  </FormField>
                </FormRow>
                <StepButtons>
                  <BackButton onClick={handleBack}>Back</BackButton>
                  <NextButton type="submit">Submit</NextButton>
                </StepButtons>
              </form>
            )}
          </SellFormCol>
          {!isMobile && (
            <SellImageCol>
              <SellImage
                src={buyImg}
                alt="Sell your car"
              />
            </SellImageCol>
          )}
        </SellFlex>
        {showThankYou && (
          <ThankYouModal>
            <ThankYouCard>
              <h2>Thank you so much!</h2>
              <p>We will be in touch with you shortly and look forward to seeing you at A1 Motor Group.</p>
              <CloseButton onClick={() => setShowThankYou(false)}>Close</CloseButton>
            </ThankYouCard>
          </ThankYouModal>
        )}
      </SellPageOuter>
      <Footer />
    </>
  );
};

const SellPageOuter = styled.div`
  width: 100vw;
  min-height: 100vh;
  background: #f8fcff;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0;
  margin-top: 88px;
  padding-bottom: 0;
  @media (max-width: 900px) {
    margin-top: 70px;
    padding-bottom: 0;
  }
`;

const SellFlex = styled.div`
  display: flex;
  flex-direction: row;
  width: 100vw;
  min-height: calc(100vh - 88px);
  @media (max-width: 900px) {
    flex-direction: column;
    min-height: unset;
  }
`;

const SellFormCol = styled.div`
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4vw 6vw 4vw 8vw;
  min-width: 0;
  @media (max-width: 1200px) {
    padding: 3vw 2vw 3vw 3vw;
  }
  @media (max-width: 900px) {
    padding: 2rem 1.2rem 1.2rem 1.2rem;
    width: 100vw;
  }
`;

const SellImageCol = styled.div`
  flex: 1 1 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  min-width: 0;
  @media (max-width: 900px) {
    width: 100vw;
    min-height: 220px;
    padding-bottom: 2rem;
    order: 2;
  }
`;

const SellImage = styled.img`
  width: 100%;
  max-width: 500px;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(44,62,80,0.08);
  object-fit: cover;
  height: auto;
  @media (max-width: 1200px) {
    max-width: 350px;
  }
  @media (max-width: 900px) {
    max-width: 98vw;
    border-radius: 12px;
    margin: 0 auto;
    height: 220px;
    max-height: 40vw;
    object-fit: contain;
    background: #e0eafc;
  }
`;

const SellTitle = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  color: #2E4154;
  margin-bottom: 0.7rem;
`;

const SellSubheading = styled.div`
  font-size: 1.18rem;
  color: #3a4a5d;
  font-weight: 500;
  margin-bottom: 1.5rem;
  margin-top: 0.2rem;
  line-height: 1.5;
  @media (max-width: 900px) {
    font-size: 1.04rem;
    margin-bottom: 1.1rem;
  }
`;

const SellSteps = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 1.2rem;
`;

const SellStep = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.active ? 'linear-gradient(90deg, #2E4154 0%, #4F8DFD 100%)' : '#e0eafc'};
  color: ${props => props.active ? '#fff' : '#2E4154'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.15rem;
  box-shadow: 0 1px 4px rgba(44,62,80,0.07);
`;

const SellStepLine = styled.div`
  width: 40px;
  height: 3px;
  background: #e0eafc;
  border-radius: 2px;
`;

const StepLabel = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2E4154;
  margin-bottom: 0.7rem;
`;

const VinRow = styled.div`
  display: flex;
  gap: 0.7rem;
  align-items: center;
  margin-bottom: 0.7rem;
`;

const VinInput = styled.input`
  flex: 2;
  border: 1.5px solid #e0eafc;
  border-radius: 7px;
  padding: 0.7rem 1rem;
  font-size: 1rem;
  font-family: inherit;
  outline: none;
  transition: border 0.18s;
  background: #fff;
`;

const VinButton = styled.button`
  flex: 1;
  background: linear-gradient(90deg, #2E4154 0%, #4F8DFD 100%);
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  border-radius: 7px;
  padding: 0.7rem 1.2rem;
  cursor: pointer;
  transition: background 0.18s;
  box-shadow: 0 1px 4px rgba(44,62,80,0.07);
  &:hover {
    background: linear-gradient(90deg, #4F8DFD 0%, #2E4154 100%);
  }
`;

const VinError = styled.div`
  color: #c0392b;
  font-size: 0.98rem;
  margin-bottom: 0.7rem;
`;

const FormRow = styled.div`
  display: flex;
  gap: 1.2rem;
  width: 100%;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 0.7rem;
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.3rem;
  label {
    font-size: 1rem;
    font-weight: 500;
    color: #2E4154;
    margin-bottom: 0.2rem;
  }
  input, textarea {
    border: 1.5px solid #e0eafc;
    border-radius: 7px;
    padding: 0.7rem 1rem;
    font-size: 1rem;
    font-family: inherit;
    outline: none;
    transition: border 0.18s;
    background: #fff;
    resize: none;
    width: 100%;
    box-sizing: border-box;
  }
  input:focus, textarea:focus {
    border-color: #2E4154;
  }
`;

const StepButtons = styled.div`
  display: flex;
  gap: 1.2rem;
  margin-top: 1.2rem;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 0.7rem;
  }
`;

const NextButton = styled.button`
  background: linear-gradient(90deg, #2E4154 0%, #4F8DFD 100%);
  color: #fff;
  font-weight: 700;
  font-size: 1.1rem;
  border: none;
  border-radius: 8px;
  padding: 0.9rem 2.2rem;
  cursor: pointer;
  transition: background 0.18s;
  box-shadow: 0 1px 4px rgba(44,62,80,0.07);
  &:hover {
    background: linear-gradient(90deg, #4F8DFD 0%, #2E4154 100%);
  }
  width: fit-content;
  @media (max-width: 900px) {
    width: 100%;
    padding: 0.9rem 0;
  }
`;

const BackButton = styled.button`
  background: #e0eafc;
  color: #2E4154;
  font-weight: 700;
  font-size: 1.1rem;
  border: none;
  border-radius: 8px;
  padding: 0.9rem 2.2rem;
  cursor: pointer;
  transition: background 0.18s;
  box-shadow: 0 1px 4px rgba(44,62,80,0.07);
  &:hover {
    background: #d0e0f7;
  }
  width: fit-content;
  @media (max-width: 900px) {
    width: 100%;
    padding: 0.9rem 0;
  }
`;

const ThankYouModal = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(30,41,59,0.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ThankYouCard = styled.div`
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 18px rgba(44,62,80,0.13);
  padding: 2.5rem 2.2rem;
  max-width: 400px;
  text-align: center;
`;

const CloseButton = styled.button`
  background: linear-gradient(90deg, #2E4154 0%, #4F8DFD 100%);
  color: #fff;
  font-weight: 700;
  font-size: 1.1rem;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 2rem;
  margin-top: 1.2rem;
  cursor: pointer;
  transition: background 0.18s;
  box-shadow: 0 1px 4px rgba(44,62,80,0.07);
  &:hover {
    background: linear-gradient(90deg, #4F8DFD 0%, #2E4154 100%);
  }
`;

export default SellYourCar; 