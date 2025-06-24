import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaChevronLeft, FaChevronRight, FaCheck, FaUser, FaCar, FaHandshake, FaFileAlt } from 'react-icons/fa';

const Financing = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [formData, setFormData] = useState({
    selectedCarVin: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    ssn: '',
    driverLicense: '',
    driverLicenseExpiry: '',
    maritalStatus: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    residenceType: '',
    timeAtAddress: '',
    employer: '',
    occupation: '',
    employerType: '',
    monthlyIncome: '',
    employerAddress: '',
    employerPhone: '',
    employerCity: '',
    employerState: '',
    employerZip: '',
    timeAtJob: '',
    hasCoBuyer: false,
    coBuyerFirstName: '',
    coBuyerLastName: '',
    coBuyerDateOfBirth: '',
    coBuyerSsn: '',
    coBuyerEmail: '',
    coBuyerPhone: '',
    coBuyerAddress: '',
    downPayment: '',
    additionalComments: '',
    creditConsent: false,
    communicationConsent: false
  });

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await fetch('/api/vehicles');
        const data = await res.json();
        setCars(data);
      } catch (error) {
        console.error('Error fetching cars:', error);
      }
    };
    fetchCars();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCarSelect = (car) => {
    setSelectedCar(car);
    setFormData(prev => ({
      ...prev,
      selectedCarVin: car.vin
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for your financing application! We will contact you soon.');
  };

  const steps = [
    { number: 1, title: 'Select Vehicle', icon: <FaCar /> },
    { number: 2, title: 'Personal Information', icon: <FaUser /> },
    { number: 3, title: 'Co-buyer (Optional)', icon: <FaHandshake /> },
    { number: 4, title: 'Final Details', icon: <FaFileAlt /> }
  ];

  return (
    <>
      <Header />
      <Container>
        <Content>
          <Title>Vehicle Financing Application</Title>
          <Subtitle>Get pre-approved for your dream car in minutes</Subtitle>
          
          <ProgressContainer>
            {steps.map((step, index) => (
              <ProgressStep key={step.number}>
                <StepIcon active={currentStep >= step.number} completed={currentStep > step.number}>
                  {currentStep > step.number ? <FaCheck /> : step.icon}
                </StepIcon>
                <StepInfo>
                  <StepNumber>Step {step.number}</StepNumber>
                  <StepTitle>{step.title}</StepTitle>
                </StepInfo>
              </ProgressStep>
            ))}
          </ProgressContainer>

          <FormContainer>
            {currentStep === 1 && (
              <div>
                <StepTitle>Select Your Vehicle</StepTitle>
                <p>Choose the vehicle you'd like to finance from our inventory</p>
                
                <CarList>
                  {cars.map(car => (
                    <CarListItem
                      key={car.vin}
                      selected={selectedCar?.vin === car.vin}
                      onClick={() => handleCarSelect(car)}
                    >
                      <CarListImage src={car.images?.[0] || car.mainImage || '/placeholder-car.jpg'} alt={`${car.modelYear || car.year} ${car.make} ${car.model}`} />
                      <CarListInfo>
                        <CarListTitle>{car.modelYear || car.year} {car.make} {car.model}</CarListTitle>
                        <CarListPrice>${car.pricing?.price ? Number(car.pricing.price).toLocaleString() : 'Contact for price'}</CarListPrice>
                        <CarListSpecs>
                          <span>{car.mileage ? `${Number(car.mileage).toLocaleString()} mi` : 'Mileage N/A'}</span>
                          <span>{car.engine?.transmission || 'Transmission N/A'}</span>
                        </CarListSpecs>
                      </CarListInfo>
                      <CarListSelectIndicator selected={selectedCar?.vin === car.vin}>
                        {selectedCar?.vin === car.vin && <FaCheck />}
                      </CarListSelectIndicator>
                    </CarListItem>
                  ))}
                </CarList>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <StepTitle>Personal Information</StepTitle>
                <p className="personal-info-desc">Please provide your personal and employment details</p>
                
                <FormSection>
                  <SectionTitle>Personal Details</SectionTitle>
                  <FormGrid>
                    <FormField>
                      <Label>First Name *</Label>
                      <Input 
                        type="text" 
                        name="firstName" 
                        value={formData.firstName} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </FormField>
                    <FormField>
                      <Label>Last Name *</Label>
                      <Input 
                        type="text" 
                        name="lastName" 
                        value={formData.lastName} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </FormField>
                    <FormField>
                      <Label>Date of Birth *</Label>
                      <Input 
                        type="date" 
                        name="dateOfBirth" 
                        value={formData.dateOfBirth} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </FormField>
                    <FormField>
                      <Label>Social Security Number *</Label>
                      <Input 
                        type="text" 
                        name="ssn" 
                        value={formData.ssn} 
                        onChange={handleInputChange} 
                        placeholder="XXX-XX-XXXX"
                        required 
                      />
                    </FormField>
                    <FormField>
                      <Label>Driver's License Number *</Label>
                      <Input 
                        type="text" 
                        name="driverLicense" 
                        value={formData.driverLicense} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </FormField>
                    <FormField>
                      <Label>Driver's License Expiry Date *</Label>
                      <Input 
                        type="date" 
                        name="driverLicenseExpiry" 
                        value={formData.driverLicenseExpiry} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </FormField>
                    <FormField>
                      <Label>Marital Status *</Label>
                      <Select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} required>
                        <option value="">Select Status</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
                      </Select>
                    </FormField>
                    <FormField>
                      <Label>Email Address *</Label>
                      <Input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </FormField>
                    <FormField>
                      <Label>Phone Number *</Label>
                      <Input 
                        type="tel" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </FormField>
                  </FormGrid>
                </FormSection>

                <FormSection>
                  <SectionTitle>Residential Information</SectionTitle>
                  <FormGrid>
                    <FormField fullWidth>
                      <Label>Address *</Label>
                      <Input 
                        type="text" 
                        name="address" 
                        value={formData.address} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </FormField>
                    <FormField>
                      <Label>City *</Label>
                      <Input 
                        type="text" 
                        name="city" 
                        value={formData.city} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </FormField>
                    <FormField>
                      <Label>State *</Label>
                      <Input 
                        type="text" 
                        name="state" 
                        value={formData.state} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </FormField>
                    <FormField>
                      <Label>ZIP Code *</Label>
                      <Input 
                        type="text" 
                        name="zip" 
                        value={formData.zip} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </FormField>
                    <FormField>
                      <Label>Residence Type *</Label>
                      <Select name="residenceType" value={formData.residenceType} onChange={handleInputChange} required>
                        <option value="">Select Type</option>
                        <option value="rent">Rent</option>
                        <option value="own">Own</option>
                        <option value="mortgage">Mortgage</option>
                        <option value="other">Other</option>
                      </Select>
                    </FormField>
                    <FormField>
                      <Label>Time at Current Address *</Label>
                      <Input 
                        type="text" 
                        name="timeAtAddress" 
                        value={formData.timeAtAddress} 
                        onChange={handleInputChange} 
                        placeholder="e.g., 2 years 6 months"
                        required 
                      />
                    </FormField>
                  </FormGrid>
                </FormSection>

                <FormSection>
                  <SectionTitle>Employment Information</SectionTitle>
                  <FormGrid>
                    <FormField>
                      <Label>Employer *</Label>
                      <Input 
                        type="text" 
                        name="employer" 
                        value={formData.employer} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </FormField>
                    <FormField>
                      <Label>Occupation *</Label>
                      <Input 
                        type="text" 
                        name="occupation" 
                        value={formData.occupation} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </FormField>
                    <FormField>
                      <Label>Employer Type *</Label>
                      <Select name="employerType" value={formData.employerType} onChange={handleInputChange} required>
                        <option value="">Select Type</option>
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="self-employed">Self-employed</option>
                        <option value="retired">Retired</option>
                        <option value="unemployed">Unemployed</option>
                      </Select>
                    </FormField>
                    <FormField>
                      <Label>Monthly Income *</Label>
                      <Input 
                        type="number" 
                        name="monthlyIncome" 
                        value={formData.monthlyIncome} 
                        onChange={handleInputChange} 
                        placeholder="$"
                        required 
                      />
                    </FormField>
                    <FormField fullWidth>
                      <Label>Employer Address *</Label>
                      <Input 
                        type="text" 
                        name="employerAddress" 
                        value={formData.employerAddress} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </FormField>
                    <FormField>
                      <Label>Employer Phone *</Label>
                      <Input 
                        type="tel" 
                        name="employerPhone" 
                        value={formData.employerPhone} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </FormField>
                    <FormField>
                      <Label>Employer City *</Label>
                      <Input 
                        type="text" 
                        name="employerCity" 
                        value={formData.employerCity} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </FormField>
                    <FormField>
                      <Label>Employer State *</Label>
                      <Input 
                        type="text" 
                        name="employerState" 
                        value={formData.employerState} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </FormField>
                    <FormField>
                      <Label>Employer ZIP *</Label>
                      <Input 
                        type="text" 
                        name="employerZip" 
                        value={formData.employerZip} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </FormField>
                    <FormField>
                      <Label>Time at Current Job *</Label>
                      <Input 
                        type="text" 
                        name="timeAtJob" 
                        value={formData.timeAtJob} 
                        onChange={handleInputChange} 
                        placeholder="e.g., 1 year 3 months"
                        required 
                      />
                    </FormField>
                  </FormGrid>
                </FormSection>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <StepTitle>Co-buyer Information (Optional)</StepTitle>
                <p>Add a co-buyer if you're applying jointly</p>
                
                <CoBuyerToggle>
                  <CheckboxLabel>
                    <Checkbox 
                      type="checkbox" 
                      name="hasCoBuyer" 
                      checked={formData.hasCoBuyer} 
                      onChange={handleInputChange} 
                    />
                    <CheckboxText>I have a co-buyer</CheckboxText>
                  </CheckboxLabel>
                </CoBuyerToggle>

                {formData.hasCoBuyer && (
                  <FormSection>
                    <SectionTitle>Co-buyer Details</SectionTitle>
                    <FormGrid>
                      <FormField>
                        <Label>First Name *</Label>
                        <Input 
                          type="text" 
                          name="coBuyerFirstName" 
                          value={formData.coBuyerFirstName} 
                          onChange={handleInputChange} 
                          required={formData.hasCoBuyer}
                        />
                      </FormField>
                      <FormField>
                        <Label>Last Name *</Label>
                        <Input 
                          type="text" 
                          name="coBuyerLastName" 
                          value={formData.coBuyerLastName} 
                          onChange={handleInputChange} 
                          required={formData.hasCoBuyer}
                        />
                      </FormField>
                      <FormField>
                        <Label>Date of Birth *</Label>
                        <Input 
                          type="date" 
                          name="coBuyerDateOfBirth" 
                          value={formData.coBuyerDateOfBirth} 
                          onChange={handleInputChange} 
                          required={formData.hasCoBuyer}
                        />
                      </FormField>
                      <FormField>
                        <Label>Social Security Number *</Label>
                        <Input 
                          type="text" 
                          name="coBuyerSsn" 
                          value={formData.coBuyerSsn} 
                          onChange={handleInputChange} 
                          placeholder="XXX-XX-XXXX"
                          required={formData.hasCoBuyer}
                        />
                      </FormField>
                      <FormField>
                        <Label>Email Address *</Label>
                        <Input 
                          type="email" 
                          name="coBuyerEmail" 
                          value={formData.coBuyerEmail} 
                          onChange={handleInputChange} 
                          required={formData.hasCoBuyer}
                        />
                      </FormField>
                      <FormField>
                        <Label>Phone Number *</Label>
                        <Input 
                          type="tel" 
                          name="coBuyerPhone" 
                          value={formData.coBuyerPhone} 
                          onChange={handleInputChange} 
                          required={formData.hasCoBuyer}
                        />
                      </FormField>
                      <FormField fullWidth>
                        <Label>Address *</Label>
                        <Input 
                          type="text" 
                          name="coBuyerAddress" 
                          value={formData.coBuyerAddress} 
                          onChange={handleInputChange} 
                          required={formData.hasCoBuyer}
                        />
                      </FormField>
                    </FormGrid>
                  </FormSection>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <StepTitle>Final Details & Consents</StepTitle>
                <p>Complete your application with payment details and required consents</p>
                
                <FormSection>
                  <SectionTitle>Payment Information</SectionTitle>
                  <FormGrid>
                    <FormField>
                      <Label>Down Payment Amount *</Label>
                      <Input 
                        type="number" 
                        name="downPayment" 
                        value={formData.downPayment} 
                        onChange={handleInputChange} 
                        placeholder="$"
                        required 
                      />
                    </FormField>
                    <FormField fullWidth>
                      <Label>Additional Comments</Label>
                      <TextArea 
                        name="additionalComments" 
                        value={formData.additionalComments} 
                        onChange={handleInputChange} 
                        placeholder="Any additional information you'd like to share..."
                        rows="4"
                      />
                    </FormField>
                  </FormGrid>
                </FormSection>

                <FormSection>
                  <SectionTitle>Required Consents</SectionTitle>
                  
                  <ConsentBox>
                    <CheckboxLabel>
                      <Checkbox 
                        type="checkbox" 
                        name="creditConsent" 
                        checked={formData.creditConsent} 
                        onChange={handleInputChange} 
                        required
                      />
                      <ConsentText>
                        <strong>Credit Application Consent *</strong><br />
                        I certify that the above information is complete and accurate to the best of my knowledge. 
                        Creditors receiving this application will retain the application whether or not it is approved. 
                        Creditors may rely on this application in deciding whether to grant the requested credit. 
                        False statements may subject me to criminal penalties. I authorize the creditors to obtain 
                        credit reports about me on an ongoing basis during this credit transaction and to check my 
                        credit and employment history on an ongoing basis during the term of the credit transaction. 
                        If this application is approved, I authorize the creditor to give credit information about me to its affiliates.
                      </ConsentText>
                    </CheckboxLabel>
                  </ConsentBox>

                  <ConsentBox>
                    <CheckboxLabel>
                      <Checkbox 
                        type="checkbox" 
                        name="communicationConsent" 
                        checked={formData.communicationConsent} 
                        onChange={handleInputChange} 
                        required
                      />
                      <ConsentText>
                        <strong>Communication Consent *</strong><br />
                        I hereby consent to receive text messages or phone calls from or on behalf of the dealer 
                        or their employees to the mobile phone number I provided above. By opting in, I understand 
                        that message and data rates may apply. This acknowledgement constitutes my written consent 
                        to receive text messages to my cell phone and phone calls, including communications sent 
                        using an auto-dialer or pre-recorded message. You may withdraw your consent at any time by texting "STOP".
                      </ConsentText>
                    </CheckboxLabel>
                  </ConsentBox>
                </FormSection>
              </div>
            )}

            <ButtonContainer>
              {currentStep > 1 && (
                <Button type="button" onClick={prevStep} variant="secondary">
                  <FaChevronLeft /> Previous
                </Button>
              )}
              {currentStep < 4 ? (
                <Button type="button" onClick={nextStep} variant="primary">
                  Next <FaChevronRight />
                </Button>
              ) : (
                <Button type="submit" onClick={handleSubmit} variant="primary">
                  Submit Application
                </Button>
              )}
            </ButtonContainer>
          </FormContainer>
        </Content>
      </Container>
      <Footer />
    </>
  );
};

// Styled Components
const Container = styled.div`
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fcff 0%, #e3f2fd 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 88px 0 0 0;
  
  @media (max-width: 900px) {
    padding: 70px 0 0 0;
  }
`;

const Content = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  text-align: center;
  margin-bottom: 3rem;
`;

const ProgressContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  position: relative;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const ProgressStep = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  flex: 1;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StepIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.completed ? '#4CAF50' : props.active ? '#2196F3' : '#e0e0e0'};
  color: white;
  font-size: 1.2rem;
  margin-right: 1rem;
  transition: all 0.3s ease;
`;

const StepInfo = styled.div`
  flex: 1;
`;

const StepNumber = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.2rem;
`;

const StepTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
`;

const FormContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const CarList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  width: 100%;
  padding-top: 2rem;
`;

const CarListItem = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  background: ${props => props.selected ? '#f0f8ff' : '#fff'};
  border: 2px solid ${props => props.selected ? '#2196F3' : '#e0e0e0'};
  border-radius: 10px;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(33,150,243,0.04);
  position: relative;
  &:hover {
    border-color: #2196F3;
    background: #f8fcff;
  }
`;

const CarListImage = styled.img`
  width: 140px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 1.5rem;
  background: #f5f5f5;
`;

const CarListInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const CarListTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
`;

const CarListPrice = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #2196F3;
`;

const CarListSpecs = styled.div`
  font-size: 0.95rem;
  color: #666;
  display: flex;
  gap: 1.2rem;
`;

const CarListSelectIndicator = styled.div`
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${props => props.selected ? '#4CAF50' : 'transparent'};
  border: 2px solid ${props => props.selected ? '#4CAF50' : '#e0e0e0'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
`;

const FormSection = styled.div`
  margin-bottom: 2.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  grid-column: ${props => props.fullWidth ? '1 / -1' : 'auto'};
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
  }
`;

const CoBuyerToggle = styled.div`
  margin-bottom: 2rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  margin-top: 0.2rem;
  cursor: pointer;
`;

const CheckboxText = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
`;

const ConsentBox = styled.div`
  background: #f8fcff;
  border: 2px solid #e3f2fd;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const ConsentText = styled.div`
  font-size: 0.9rem;
  line-height: 1.6;
  color: #333;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.variant === 'primary' && `
    background: linear-gradient(135deg, #2196F3, #1976D2);
    color: white;
    
    &:hover {
      background: linear-gradient(135deg, #1976D2, #1565C0);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
    }
  `}
  
  ${props => props.variant === 'secondary' && `
    background: #f5f5f5;
    color: #666;
    border: 2px solid #e0e0e0;
    
    &:hover {
      background: #e0e0e0;
      color: #333;
    }
  `}
`;

export default Financing;
 