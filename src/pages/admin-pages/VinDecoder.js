import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

// Master feature list (de-duplicated, sorted A-Z)
export const MASTER_FEATURES = Array.from(new Set([
  '4WD/AWD', 'ABS Brakes', 'Active Air Suspension', 'Adaptive Suspension', 'Adjustable Foot Pedals',
  'Advanced Driver Assistance Systems', 'Air Conditioning', 'All-Wheel Drive System', 'Alloy Wheels',
  'AMG Performance 4MATIC+', 'Automatic Headlights', 'Automatic Load-Leveling', 'Auxiliary heating',
  'Bluetooth', 'Cargo Area Cover', 'Cargo Area Tiedowns', 'Cargo Net', 'CD player', 'Central locking',
  'Child Safety Door Locks', 'Climate Control', 'Compound Brakes', 'Conditioner', 'Cruise Control',
  'Daytime Running Lights', 'Deep Tinted Glass', 'Driver Airbag', 'Driver Multi-Adjustable Power Seat',
  'Electrochromic Exterior Rearview Mirror', 'Electrochromic Interior Rearview Mirror',
  'Electronic Brake Assistance', 'Electronic Parking Aid', 'ESP', 'Features', 'First Aid Kit', 'Fog Lights',
  'Front Air Dam', 'Front Heated Seat', 'Front Power Lumbar Support', 'Front Power Memory Seat',
  'Front Side Airbag', 'Front Side Airbag with Head Protection', 'Front Split Bench Seat',
  'Full Size Spare Tire', 'Genuine Wood Trim', 'Glass Rear Window on Convertible', 'Heated Exterior Mirror',
  'Heated Steering Wheel', 'High Intensity Discharge Headlights', 'Interval Wipers', 'Keyless Entry',
  'Leather Seat', 'Leather Steering Wheel', 'Limited Slip Differential', 'Load Bearing Exterior Rack',
  'Locking Differential', 'Locking Pickup Truck Tailgate', 'My new feature', 'Navigation Aid', 'Nitro',
  'Passenger Airbag', 'Passenger Multi-Adjustable Power Seat', 'Pickup Truck Bed Liner',
  'Pickup Truck Cargo Box Light', 'Power Adjustable Exterior Mirror', 'Power Door Locks', 'Power Sunroof',
  'Power Windows', 'Premium Materials', 'Rain Sensing Wipers', 'Rear Spoiler', 'Rear Window Defogger',
  'Rear Wiper', 'Remote Ignition', 'Removable Top', 'Run Flat Tires', 'Second Row Folding Seat',
  'Second Row Multi-Adjustable Power Seat', 'Second Row Side Airbag',
  'Separate Driver/Front Passenger Climate Controls', 'Side Head Curtain Airbag', 'Skid Plate',
  'Splash Guards', 'Steel Wheels', 'Steering Wheel Mounted Controls', 'Subwoofer', 'Tachometer',
  'Telematics System', 'Telescopic Steering Column', 'test hidden feature', 'Tilt Steering',
  'Tilt Steering Column', 'Tire Pressure Monitor', 'Tow Hitch Receiver', 'Traction Control',
  'Trip Computer', 'Trunk Anti-Trap Device', 'Turbo-engine', 'Vehicle Anti-Theft',
  'Vehicle Stability Control System', 'Voice Activated Telephone'
])).sort();

const VinDecoder = ({ onVehicleData, existingData }) => {
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vehicleData, setVehicleData] = useState(existingData || {
    vin: '',
    stockNumber: '',
    make: '',
    model: '',
    modelYear: '',
    body: '',
    description: '',
    features: [],
    engine: {
      type: '',
      transmission: '',
      drive: '',
      fuelType: '',
      cylinders: '',
      displacement: ''
    },
    exterior: {
      color: ''
    },
    interior: {
      color: ''
    },
    mileage: '',
    condition: 'Used',
    pricing: {
      price: '',
      salesPrice: '',
      financingPerMonth: ''
    },
    images: [],
    additionalFeatures: [],
    safety: []
  });
  const [bulkFeatures, setBulkFeatures] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`);
      const results = response.data.Results;
      console.log('NHTSA VIN decode results:', results); // Debug: log all results

      // Fallback logic for transmission and horsepower
      const getTransmission = (data) => {
        return data.engine?.transmission || 
               data.transmission || 
               data.vehicle?.engine?.transmission ||
               data.vehicle?.transmission ||
               'N/A';
      };

      const getBody = (data) => {
        return data.body || 
               data.bodyClass || 
               data.vehicle?.body ||
               data.vehicle?.bodyClass ||
               'N/A';
      };
      
      const newData = {
        ...vehicleData,
        vin,
        make: findValue(results, 'Make'),
        model: findValue(results, 'Model'),
        modelYear: findValue(results, 'Model Year'),
        body: getBody(results),
        engine: {
          ...vehicleData.engine,
          type: `${findValue(results, 'Engine Configuration')} ${findValue(results, 'Displacement (L)')}L`,
          transmission: getTransmission(results),
          drive: findValue(results, 'Drive Type'),
          fuelType: findValue(results, 'Fuel Type - Primary'),
          cylinders: findValue(results, 'Engine Number of Cylinders'),
          displacement: findValue(results, 'Displacement (L)')
        },
        exterior: { ...vehicleData.exterior, color: vehicleData.exterior.color },
        interior: { ...vehicleData.interior, color: vehicleData.interior.color }
      };
      setVehicleData(newData);
      onVehicleData(newData);
    } catch (err) {
      setError('Failed to decode VIN. Please try again.');
      console.error('VIN decoding error:', err);
    } finally {
      setLoading(false);
    }
  };

  const findValue = (results, variable) => {
    const item = results.find(r => r.Variable === variable);
    return item ? item.Value || 'N/A' : 'N/A';
  };

  const handleInputChange = (section, field, value) => {
    const newData = { ...vehicleData };
    if (section) {
      newData[section][field] = value;
    } else {
      newData[field] = value;
    }
    setVehicleData(newData);
    onVehicleData(newData);
  };

  // Handle feature checkbox change
  const handleFeatureToggle = (feature) => {
    setVehicleData(prev => {
      const features = prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature];
      const updated = { ...prev, features };
      onVehicleData(updated);
      return updated;
    });
  };

  // Bulk select features from textarea
  const handleBulkSelect = () => {
    const lines = bulkFeatures.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const selected = MASTER_FEATURES.filter(f => lines.some(line => line.toLowerCase() === f.toLowerCase()));
    setVehicleData(prev => {
      const features = Array.from(new Set([...(prev.features || []), ...selected]));
      const updated = { ...prev, features };
      onVehicleData(updated);
      return updated;
    });
  };

  // Generate a 3-line description based on car details and features
  const handleGenerateDescription = () => {
    const { modelYear, make, model, body, engine, features } = vehicleData;
    const year = modelYear || '';
    const makeStr = make || '';
    const modelStr = model || '';
    const bodyStr = body || '';
    const engineStr = engine?.type || '';
    const featureList = (features || []).slice(0, 5).join(', ');
    const desc = `${year} ${makeStr} ${modelStr} ${bodyStr ? '(' + bodyStr + ')' : ''}.
` +
      `Equipped with ${engineStr}${featureList ? ', and features like ' + featureList : ''}.
` +
      `A great choice for those seeking comfort, performance, and reliability.`;
    setVehicleData(prev => { const updated = { ...prev, description: desc }; onVehicleData(updated); return updated; });
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Label>Enter VIN</Label>
          <Input
            type="text"
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            placeholder="Enter 17-digit VIN"
            pattern="[A-HJ-NPR-Z0-9]{17}"
            title="Please enter a valid 17-character VIN"
            required
          />
        </InputGroup>
        <Button type="submit" disabled={loading}>
          {loading ? 'Decoding...' : 'Decode VIN'}
        </Button>
      </Form>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {vehicleData.vin && (
        <Results>
          <ResultTitle>Vehicle Information</ResultTitle>
          <ResultGrid>
            <Section>
              <SectionTitle>Basic Information</SectionTitle>
              <Field>
                <Label>Stock Number</Label>
                <Input
                  value={vehicleData.stockNumber}
                  onChange={(e) => handleInputChange(null, 'stockNumber', e.target.value)}
                  placeholder="Enter stock number"
                />
              </Field>
              <Field>
                <Label>Make</Label>
                <Input
                  value={vehicleData.make}
                  onChange={(e) => handleInputChange(null, 'make', e.target.value)}
                />
              </Field>
              <Field>
                <Label>Model</Label>
                <Input
                  value={vehicleData.model}
                  onChange={(e) => handleInputChange(null, 'model', e.target.value)}
                />
              </Field>
              <Field>
                <Label>Year</Label>
                <Input
                  value={vehicleData.modelYear}
                  onChange={(e) => handleInputChange(null, 'modelYear', e.target.value)}
                />
              </Field>
              <Field>
                <Label>Body</Label>
                <Input
                  value={vehicleData.body}
                  onChange={(e) => handleInputChange(null, 'body', e.target.value)}
                  placeholder="Enter body type (e.g. SUV)"
                />
              </Field>
              <Field>
                <Label>Mileage</Label>
                <Input
                  type="number"
                  value={vehicleData.mileage}
                  onChange={(e) => handleInputChange(null, 'mileage', e.target.value)}
                  placeholder="Enter mileage"
                />
              </Field>
              <Field>
                <Label>Condition</Label>
                <Select
                  value={vehicleData.condition}
                  onChange={(e) => handleInputChange(null, 'condition', e.target.value)}
                >
                  <option value="Used">Used</option>
                  <option value="New">New</option>
                </Select>
              </Field>
              <Field>
                <Label>Description</Label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <TextArea
                    value={vehicleData.description}
                    onChange={e => {
                      setVehicleData(prev => { const updated = { ...prev, description: e.target.value }; onVehicleData(updated); return updated; });
                    }}
                    placeholder="Enter a description for this vehicle"
                    rows={3}
                  />
                  <Button type="button" style={{ height: 'fit-content', marginTop: 2 }} onClick={handleGenerateDescription}>
                    Generate Description
                  </Button>
                </div>
              </Field>
              <Field>
                <Label>Features</Label>
                <FeatureList>
                  {MASTER_FEATURES.map(feature => (
                    <FeatureItem key={feature}>
                      <input
                        type="checkbox"
                        checked={vehicleData.features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        id={`feature-${feature}`}
                      />
                      <label htmlFor={`feature-${feature}`}>{feature}</label>
                    </FeatureItem>
                  ))}
                </FeatureList>
                <div style={{ marginTop: '1rem' }}>
                  <TextArea
                    value={bulkFeatures}
                    onChange={e => setBulkFeatures(e.target.value)}
                    placeholder="Paste features here, one per line, then click 'Choose Features'"
                    rows={3}
                  />
                  <Button type="button" style={{ marginTop: 8 }} onClick={handleBulkSelect}>
                    Choose Features
                  </Button>
                </div>
              </Field>
            </Section>

            <Section>
              <SectionTitle>Engine & Performance</SectionTitle>
              <Field>
                <Label>Engine Type</Label>
                <Input
                  value={vehicleData.engine.type}
                  onChange={(e) => handleInputChange('engine', 'type', e.target.value)}
                />
              </Field>
              <Field>
                <Label>Transmission</Label>
                <Input
                  value={vehicleData.engine.transmission}
                  onChange={(e) => handleInputChange('engine', 'transmission', e.target.value)}
                />
              </Field>
              <Field>
                <Label>Drive Type</Label>
                <Input
                  value={vehicleData.engine.drive}
                  onChange={(e) => handleInputChange('engine', 'drive', e.target.value)}
                />
              </Field>
              <Field>
                <Label>Fuel Type</Label>
                <Input
                  value={vehicleData.engine.fuelType}
                  onChange={(e) => handleInputChange('engine', 'fuelType', e.target.value)}
                />
              </Field>
            </Section>

            <Section>
              <SectionTitle>Colors</SectionTitle>
              <Field>
                <Label>Exterior Color</Label>
                <Input
                  value={vehicleData.exterior.color}
                  onChange={(e) => handleInputChange('exterior', 'color', e.target.value)}
                  placeholder="Enter exterior color"
                />
              </Field>
              <Field>
                <Label>Interior Color</Label>
                <Input
                  value={vehicleData.interior.color}
                  onChange={(e) => handleInputChange('interior', 'color', e.target.value)}
                  placeholder="Enter interior color"
                />
              </Field>
            </Section>
          </ResultGrid>
        </Results>
      )}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
`;

const Form = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const InputGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #4a5568;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
  }

  @media (max-width: 768px) {
    padding: 0.875rem;
    font-size: 1rem;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
  }

  @media (max-width: 768px) {
    padding: 0.875rem;
    font-size: 1rem;
    min-height: 100px;
  }
`;

const Button = styled.button`
  align-self: flex-end;
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2b6cb0;
  }

  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    align-self: stretch;
    padding: 1rem 1.5rem;
    font-size: 1.1rem;
  }
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  background: #fff5f5;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
`;

const Results = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;

  @media (max-width: 900px) {
    padding: 1.5rem;
  }

  @media (max-width: 600px) {
    padding: 1rem;
  }
`;

const ResultTitle = styled.h2`
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    font-size: 1.25rem;
    margin-bottom: 1.5rem;
  }
`;

const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const Section = styled.div`
  ${props => props.fullWidth && `
    grid-column: 1 / -1;
  `}
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  color: #2d3748;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const Field = styled.div`
  margin-bottom: 1rem;
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FeatureItem = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;

  @media (max-width: 768px) {
    gap: 0.75rem;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
  }

  @media (max-width: 768px) {
    padding: 0.875rem;
    font-size: 1rem;
  }
`;

export default VinDecoder; 