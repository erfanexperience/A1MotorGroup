import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import VinDecoder from './VinDecoder';
import { MASTER_FEATURES } from './VinDecoder';

const AddVehicle = ({ onSuccess, existingData }) => {
  const [activeSection, setActiveSection] = useState(existingData ? 'details' : 'vin');
  const [vehicleData, setVehicleData] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [certificates, setCertificates] = useState({
    carfax: null,
    windowSticker: null
  });
  const [pricing, setPricing] = useState({
    price: '',
    salesPrice: '',
    financingPerMonth: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bulkFeatures, setBulkFeatures] = useState('');
  const [formData, setFormData] = useState({
    // ... existing code ...
  });

  // Initialize with existing data if provided
  useEffect(() => {
    if (existingData) {
      setVehicleData(existingData);
      setPricing(existingData.pricing || {
        price: '',
        salesPrice: '',
        financingPerMonth: ''
      });

      // Convert existing images to the format expected by the component
      if (existingData.images && existingData.images.length > 0) {
        console.log('Loading existing images:', existingData.images);
        const formattedImages = existingData.images.map(image => {
          const imagePath = image.url || image.path || image;
          console.log('Processing image:', imagePath);
          return {
            file: null,
            preview: imagePath,
            path: imagePath
          };
        });
        console.log('Formatted images:', formattedImages);
        setImages(formattedImages);
      }

      // Set certificates if they exist
      if (existingData.certificates) {
        setCertificates({
          carfax: existingData.certificates.carfax ? {
            file: null,
            name: 'Existing Carfax',
            preview: existingData.certificates.carfax
          } : null,
          windowSticker: existingData.certificates.windowSticker ? {
            file: null,
            name: 'Existing Window Sticker',
            preview: existingData.certificates.windowSticker
          } : null
        });
      }
    }
  }, [existingData]);

  const handleVehicleData = (data) => {
    setVehicleData(data);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages([...images, ...newImages]);
  };

  const handleCertificateUpload = (type, file) => {
    if (file) {
      setCertificates(prev => ({
        ...prev,
        [type]: {
          file,
          name: file.name,
          preview: URL.createObjectURL(file)
        }
      }));
    }
  };

  const removeCertificate = (type) => {
    if (certificates[type]?.preview) {
      URL.revokeObjectURL(certificates[type].preview);
    }
    setCertificates(prev => ({
      ...prev,
      [type]: null
    }));
  };

  const toggleImageSelection = (index) => {
    setSelectedImages(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const removeSelectedImages = () => {
    if (selectedImages.length === 0) return;

    const imagesToRemove = selectedImages.map(index => images[index]);
    const newImages = images.filter((_, index) => !selectedImages.includes(index));
    
    // Add removed images to deletedImages if they were existing images
    const newDeletedImages = imagesToRemove
      .filter(img => img.path && !img.file)
      .map(img => img.path);
    
    setImages(newImages);
    setSelectedImages([]);
    setDeletedImages(prev => [...prev, ...newDeletedImages]);
  };

  // Helper for monthly payment calculation
  function calculateFinancingPerMonth(price) {
    if (!price || isNaN(price) || Number(price) <= 0) return '';
    const principal = Number(price) * 1.09375; // Add 9.375% CA sales tax
    const apr = 10.09 / 100;
    const n = 72;
    const r = apr / 12;
    const M = principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(M);
  }

  const handlePricingChange = (field, value) => {
    let newPricing = { ...pricing, [field]: value };
    // Auto-calculate financingPerMonth if price or salesPrice changes
    if (field === 'price' || field === 'salesPrice') {
      const base = newPricing.salesPrice || newPricing.price;
      if (base && !isNaN(base) && Number(base) > 0) {
        newPricing.financingPerMonth = calculateFinancingPerMonth(base);
      } else {
        newPricing.financingPerMonth = '';
      }
    }
    setPricing(newPricing);
  };

  const handleSave = async () => {
    if (!vehicleData?.vin) {
      setError('Please decode a VIN first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create FormData object
      const formData = new FormData();
      
      // Create a clean copy of vehicleData without any file-related fields
      const cleanVehicleData = { ...vehicleData };
      delete cleanVehicleData.images; // Remove images array as we'll handle files separately
      
      const dataToSend = {
        ...cleanVehicleData,
        pricing,
        deletedImages,
        timestamp: new Date().toISOString()
      };
      
      // First append the vehicle data
      formData.append('vehicleData', JSON.stringify(dataToSend));
      
      // Then append any files
      if (images.length > 0) {
      images.forEach(image => {
        if (image.file) {
          formData.append('images', image.file);
        }
      });
      }

      if (certificates.carfax?.file) {
        formData.append('carfax', certificates.carfax.file);
      }

      if (certificates.windowSticker?.file) {
        formData.append('windowSticker', certificates.windowSticker.file);
      }

      // Log the form data for debugging
      console.log('Form data contents:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name}`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const response = await fetch('/api/vehicles', {
        method: existingData ? 'PUT' : 'POST',
        body: formData
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage;
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json();
          errorMessage = result.error;
        } else {
          errorMessage = await response.text();
        }
        throw new Error(errorMessage || 'Failed to save vehicle');
      }

      const result = await response.json();
      console.log('Server response:', result);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error saving vehicle:', err);
      setError(err.message || 'Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {existingData ? (
        // --- EDIT MODE: Unified form, all fields visible, no tabs, no VIN Decoder ---
        <>
          <SectionContent>
            {/* Vehicle Details */}
            <VehicleDetailsForm vehicleData={vehicleData} onVehicleData={handleVehicleData} isEditing={true} />

            {/* Description */}
            <SectionTitle>Description</SectionTitle>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 16 }}>
              <textarea
                style={{ flex: 1, minHeight: 80, borderRadius: 8, border: '1.5px solid #e2e8f0', padding: 12, fontSize: 16 }}
                value={vehicleData?.description || ''}
                onChange={e => handleVehicleData({ ...vehicleData, description: e.target.value })}
                placeholder="Enter a description for this vehicle"
                rows={3}
              />
              <button
                type="button"
                style={{ height: 'fit-content', marginTop: 2, background: '#3182ce', color: 'white', border: 'none', borderRadius: 8, padding: '0.7rem 1.5rem', fontWeight: 500, cursor: 'pointer' }}
                onClick={() => {
                  const { modelYear, make, model, body, engine, features } = vehicleData;
                  const year = modelYear || '';
                  const makeStr = make || '';
                  const modelStr = model || '';
                  const bodyStr = body || '';
                  const engineStr = engine?.type || '';
                  const featureList = (features || []).slice(0, 5).join(', ');
                  const desc = `${year} ${makeStr} ${modelStr} ${bodyStr ? '(' + bodyStr + ')' : ''}.
Equipped with ${engineStr}${featureList ? ', and features like ' + featureList : ''}.
A great choice for those seeking comfort, performance, and reliability.`;
                  handleVehicleData({ ...vehicleData, description: desc });
                }}
              >
                Generate Description
              </button>
            </div>

            {/* Features */}
            <SectionTitle>Features</SectionTitle>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {MASTER_FEATURES.map(feature => (
                  <label key={feature} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 15 }}>
                    <input
                      type="checkbox"
                      checked={vehicleData?.features?.includes(feature) || false}
                      onChange={() => {
                        const features = vehicleData?.features || [];
                        const updated = features.includes(feature)
                          ? features.filter(f => f !== feature)
                          : [...features, feature];
                        handleVehicleData({ ...vehicleData, features: updated });
                      }}
                    />
                    {feature}
                  </label>
                ))}
              </div>
              <div style={{ marginTop: 12 }}>
                <textarea
                  style={{ width: '100%', minHeight: 50, borderRadius: 8, border: '1.5px solid #e2e8f0', padding: 8, fontSize: 15 }}
                  value={bulkFeatures}
                  onChange={e => setBulkFeatures(e.target.value)}
                  placeholder="Paste features here, one per line, then click 'Choose Features'"
                  rows={2}
                />
                <button
                  type="button"
                  style={{ marginTop: 8, background: '#3182ce', color: 'white', border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontWeight: 500, cursor: 'pointer' }}
                  onClick={() => {
                    const lines = bulkFeatures.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                    const selected = MASTER_FEATURES.filter(f => lines.some(line => line.toLowerCase() === f.toLowerCase()));
                    const features = Array.from(new Set([...(vehicleData?.features || []), ...selected]));
                    handleVehicleData({ ...vehicleData, features });
                  }}
                >
                  Choose Features
                </button>
              </div>
            </div>

            {/* Photos & Videos */}
            <PhotosSection>
              <SectionTitle>Photos & Videos</SectionTitle>
              <UploadArea>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  id="image-upload"
                />
                <UploadButton as="label" htmlFor="image-upload">
                  Upload Images
                </UploadButton>
              </UploadArea>
              <ImageGrid>
                {images.map((image, index) => (
                  <ImageContainer 
                    key={index}
                    selected={selectedImages.includes(index)}
                    onClick={() => toggleImageSelection(index)}
                  >
                    <Image src={image.preview || image.path} alt={`Vehicle ${index + 1}`} />
                    <SelectionOverlay selected={selectedImages.includes(index)}>
                      {selectedImages.includes(index) && <Checkmark>✓</Checkmark>}
                    </SelectionOverlay>
                  </ImageContainer>
                ))}
              </ImageGrid>
              {selectedImages.length > 0 && (
                <DeleteButton onClick={removeSelectedImages}>
                  Delete Selected Images ({selectedImages.length})
                </DeleteButton>
              )}
            </PhotosSection>

            {/* Certificates */}
            <CertificatesSection>
              <SectionTitle>Certificates</SectionTitle>
              <CertificateUpload>
                <CertificateTitle>Carfax Report</CertificateTitle>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,image/png,image/jpeg"
                  onChange={(e) => handleCertificateUpload('carfax', e.target.files[0])}
                  style={{ display: 'none' }}
                  id="carfax-upload"
                />
                <UploadButton as="label" htmlFor="carfax-upload">
                  {certificates.carfax ? 'Replace Carfax' : 'Upload Carfax'}
                </UploadButton>
                {certificates.carfax && (
                  <CertificatePreview>
                    <CertificateName>{certificates.carfax.name}</CertificateName>
                    <DeleteButton 
                      onClick={() => removeCertificate('carfax')}
                      style={{ padding: '0.5rem 1rem', margin: 0 }}
                    >
                      Remove
                    </DeleteButton>
                  </CertificatePreview>
                )}
              </CertificateUpload>
              <CertificateUpload>
                <CertificateTitle>Window Sticker</CertificateTitle>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,image/png,image/jpeg"
                  onChange={(e) => handleCertificateUpload('windowSticker', e.target.files[0])}
                  style={{ display: 'none' }}
                  id="window-sticker-upload"
                />
                <UploadButton as="label" htmlFor="window-sticker-upload">
                  {certificates.windowSticker ? 'Replace Window Sticker' : 'Upload Window Sticker'}
                </UploadButton>
                {certificates.windowSticker && (
                  <CertificatePreview>
                    <CertificateName>{certificates.windowSticker.name}</CertificateName>
                    <DeleteButton 
                      onClick={() => removeCertificate('windowSticker')}
                      style={{ padding: '0.5rem 1rem', margin: 0 }}
                    >
                      Remove
                    </DeleteButton>
                  </CertificatePreview>
                )}
              </CertificateUpload>
            </CertificatesSection>

            {/* Pricing */}
            <PricingSection>
              <SectionTitle>Pricing</SectionTitle>
              <PricingField>
                <Label>Price</Label>
                <Input
                  type="number"
                  value={pricing.price}
                  onChange={(e) => handlePricingChange('price', e.target.value)}
                  placeholder="Enter price"
                />
              </PricingField>
              <PricingField>
                <Label>Sales Price</Label>
                <Input
                  type="number"
                  value={pricing.salesPrice}
                  onChange={(e) => handlePricingChange('salesPrice', e.target.value)}
                  placeholder="Enter sales price"
                />
              </PricingField>
              <PricingField>
                <Label>Financing Per Month</Label>
                <Input
                  type="number"
                  value={pricing.financingPerMonth}
                  onChange={(e) => handlePricingChange('financingPerMonth', e.target.value)}
                  placeholder="Enter monthly financing amount"
                />
              </PricingField>
            </PricingSection>
          </SectionContent>
          <ActionButtons>
            <SaveButton onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Vehicle'}
            </SaveButton>
          </ActionButtons>
        </>
      ) : (
        // --- ADD MODE: Keep existing tabbed/sectioned UI ---
        <>
      <Sections>
        <SectionTabs>
            <SectionTab 
              active={activeSection === 'vin'} 
              onClick={() => setActiveSection('vin')}
            >
              VIN Decoder
            </SectionTab>
          <SectionTab 
            active={activeSection === 'photos'} 
            onClick={() => setActiveSection('photos')}
          >
            Photos & Videos
          </SectionTab>
          <SectionTab 
            active={activeSection === 'certificates'} 
            onClick={() => setActiveSection('certificates')}
          >
            Certificates
          </SectionTab>
          <SectionTab 
            active={activeSection === 'pricing'} 
            onClick={() => setActiveSection('pricing')}
          >
            Pricing
          </SectionTab>
        </SectionTabs>
        <SectionContent>
              {activeSection === 'vin' && (
            <VinDecoder onVehicleData={handleVehicleData} existingData={vehicleData} />
          )}
          {activeSection === 'photos' && (
            <PhotosSection>
              <UploadArea>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  id="image-upload"
                />
                <UploadButton as="label" htmlFor="image-upload">
                  Upload Images
                </UploadButton>
              </UploadArea>
              <ImageGrid>
                {images.map((image, index) => (
                  <ImageContainer 
                    key={index}
                    selected={selectedImages.includes(index)}
                    onClick={() => toggleImageSelection(index)}
                  >
                    <Image src={image.preview || image.path} alt={`Vehicle ${index + 1}`} />
                    <SelectionOverlay selected={selectedImages.includes(index)}>
                      {selectedImages.includes(index) && <Checkmark>✓</Checkmark>}
                    </SelectionOverlay>
                  </ImageContainer>
                ))}
              </ImageGrid>
              {selectedImages.length > 0 && (
                <DeleteButton onClick={removeSelectedImages}>
                  Delete Selected Images ({selectedImages.length})
                </DeleteButton>
              )}
            </PhotosSection>
          )}
          {activeSection === 'certificates' && (
            <CertificatesSection>
              <CertificateUpload>
                <CertificateTitle>Carfax Report</CertificateTitle>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,image/png,image/jpeg"
                  onChange={(e) => handleCertificateUpload('carfax', e.target.files[0])}
                  style={{ display: 'none' }}
                  id="carfax-upload"
                />
                <UploadButton as="label" htmlFor="carfax-upload">
                  {certificates.carfax ? 'Replace Carfax' : 'Upload Carfax'}
                </UploadButton>
                {certificates.carfax && (
                  <CertificatePreview>
                    <CertificateName>{certificates.carfax.name}</CertificateName>
                    <DeleteButton 
                      onClick={() => removeCertificate('carfax')}
                      style={{ padding: '0.5rem 1rem', margin: 0 }}
                    >
                      Remove
                    </DeleteButton>
                  </CertificatePreview>
                )}
              </CertificateUpload>
              <CertificateUpload>
                <CertificateTitle>Window Sticker</CertificateTitle>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,image/png,image/jpeg"
                  onChange={(e) => handleCertificateUpload('windowSticker', e.target.files[0])}
                  style={{ display: 'none' }}
                  id="window-sticker-upload"
                />
                <UploadButton as="label" htmlFor="window-sticker-upload">
                  {certificates.windowSticker ? 'Replace Window Sticker' : 'Upload Window Sticker'}
                </UploadButton>
                {certificates.windowSticker && (
                  <CertificatePreview>
                    <CertificateName>{certificates.windowSticker.name}</CertificateName>
                    <DeleteButton 
                      onClick={() => removeCertificate('windowSticker')}
                      style={{ padding: '0.5rem 1rem', margin: 0 }}
                    >
                      Remove
                    </DeleteButton>
                  </CertificatePreview>
                )}
              </CertificateUpload>
            </CertificatesSection>
          )}
          {activeSection === 'pricing' && (
            <PricingSection>
              <PricingField>
                <Label>Price</Label>
                <Input
                  type="number"
                  value={pricing.price}
                  onChange={(e) => handlePricingChange('price', e.target.value)}
                  placeholder="Enter price"
                />
              </PricingField>
              <PricingField>
                <Label>Sales Price</Label>
                <Input
                  type="number"
                  value={pricing.salesPrice}
                  onChange={(e) => handlePricingChange('salesPrice', e.target.value)}
                  placeholder="Enter sales price"
                />
              </PricingField>
              <PricingField>
                <Label>Financing Per Month</Label>
                <Input
                  type="number"
                  value={pricing.financingPerMonth}
                  onChange={(e) => handlePricingChange('financingPerMonth', e.target.value)}
                  placeholder="Enter monthly financing amount"
                />
              </PricingField>
            </PricingSection>
          )}
        </SectionContent>
      </Sections>
      <ActionButtons>
        <SaveButton onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Vehicle'}
        </SaveButton>
      </ActionButtons>
        </>
      )}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  padding: 2rem;

  @media (max-width: 900px) {
    padding: 1rem;
  }

  @media (max-width: 600px) {
    padding: 0.5rem;
  }
`;

const SaveButton = styled.button`
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;

  &:hover {
    background: #2b6cb0;
  }

  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
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

const Sections = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const SectionTabs = styled.div`
  display: flex;
  border-bottom: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const SectionTab = styled.button`
  padding: 1rem 2rem;
  background: none;
  border: none;
  font-size: 1rem;
  color: ${props => props.active ? '#3182ce' : '#4a5568'};
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? '#3182ce' : 'transparent'};
  transition: all 0.2s;

  &:hover {
    color: #3182ce;
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1.5rem;
    font-size: 0.9rem;
    flex: 1;
    min-width: 120px;
  }

  @media (max-width: 600px) {
    padding: 1rem 1.5rem;
    font-size: 1rem;
    border-bottom: 1px solid #e2e8f0;
    border-right: none;
    text-align: left;
  }
`;

const SectionContent = styled.div`
  padding: 2rem;

  @media (max-width: 900px) {
    padding: 1.5rem;
  }

  @media (max-width: 600px) {
    padding: 1rem;
  }
`;

const PhotosSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const UploadArea = styled.div`
  text-align: center;
`;

const UploadButton = styled(SaveButton)`
  display: inline-block;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.75rem;
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.5rem;
  }
`;

const ImageContainer = styled.div`
  position: relative;
  cursor: pointer;
  border: 3px solid ${props => props.selected ? '#3182ce' : 'transparent'};
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.02);
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
`;

const SelectionOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.selected ? 'rgba(49, 130, 206, 0.3)' : 'rgba(0, 0, 0, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.selected ? 1 : 0};
  transition: all 0.2s;

  ${ImageContainer}:hover & {
    opacity: 1;
  }
`;

const Checkmark = styled.div`
  color: white;
  font-size: 2rem;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);

  @media (max-width: 600px) {
    font-size: 1.5rem;
  }
`;

const CertificatesSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const CertificateUpload = styled.div`
  background: #f7fafc;
  padding: 1.5rem;
  border-radius: 8px;
  border: 2px dashed #e2e8f0;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const CertificateTitle = styled.h3`
  font-size: 1.25rem;
  color: #2d3748;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const CertificatePreview = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }
`;

const CertificateName = styled.span`
  font-size: 0.875rem;
  color: #4a5568;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const PricingSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 400px;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const PricingField = styled.div`
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
  transition: all 0.2s;

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

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;

  @media (max-width: 768px) {
    margin-top: 1.5rem;
  }
`;

const DeleteButton = styled.button`
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  margin: 1rem 0;

  &:hover {
    background: #c53030;
  }

  &:disabled {
    background: #fc8181;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
    margin: 0.75rem 0;
  }
`;

const VehicleDetailsForm = ({ vehicleData, onVehicleData, isEditing }) => {
  // Helper to update nested fields
  const handleNestedChange = (path, value) => {
    const keys = path.split('.');
    const updated = { ...vehicleData };
    let obj = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    onVehicleData(updated);
  };

  return (
    <FormContainer>
      <FormField>
        <Label>Make</Label>
        <Input
          type="text"
          value={vehicleData?.make || ''}
          onChange={e => onVehicleData({ ...vehicleData, make: e.target.value })}
          placeholder="Enter make"
        />
      </FormField>
      <FormField>
        <Label>Model</Label>
        <Input
          type="text"
          value={vehicleData?.model || ''}
          onChange={e => onVehicleData({ ...vehicleData, model: e.target.value })}
          placeholder="Enter model"
        />
      </FormField>
      <FormField>
        <Label>Year</Label>
        <Input
          type="number"
          value={vehicleData?.modelYear || vehicleData?.year || ''}
          onChange={e => onVehicleData({ ...vehicleData, modelYear: e.target.value, year: e.target.value })}
          placeholder="Enter year"
        />
      </FormField>
      <FormField>
        <Label>VIN</Label>
        <Input
          type="text"
          value={vehicleData?.vin || ''}
          onChange={e => onVehicleData({ ...vehicleData, vin: e.target.value })}
          placeholder="Enter VIN"
          disabled={isEditing}
        />
      </FormField>
      <FormField>
        <Label>Stock Number</Label>
        <Input
          type="text"
          value={vehicleData?.stockNumber || ''}
          onChange={e => onVehicleData({ ...vehicleData, stockNumber: e.target.value })}
          placeholder="Enter stock number"
        />
      </FormField>
      <FormField>
        <Label>Mileage</Label>
        <Input
          type="number"
          value={vehicleData?.mileage || ''}
          onChange={e => onVehicleData({ ...vehicleData, mileage: e.target.value })}
          placeholder="Enter mileage"
        />
      </FormField>
      <FormField>
        <Label>Condition</Label>
        <Select
          value={vehicleData?.condition || ''}
          onChange={e => onVehicleData({ ...vehicleData, condition: e.target.value })}
        >
          <option value="">Select condition</option>
          <option value="New">New</option>
          <option value="Used">Used</option>
          <option value="Certified">Certified</option>
        </Select>
      </FormField>
      <FormField>
        <Label>Exterior Color</Label>
        <Input
          type="text"
          value={vehicleData?.exterior?.color || ''}
          onChange={e => handleNestedChange('exterior.color', e.target.value)}
          placeholder="Enter exterior color"
        />
      </FormField>
      <FormField>
        <Label>Interior Color</Label>
        <Input
          type="text"
          value={vehicleData?.interior?.color || ''}
          onChange={e => handleNestedChange('interior.color', e.target.value)}
          placeholder="Enter interior color"
        />
      </FormField>
      <FormField>
        <Label>Transmission</Label>
        <Select
          value={vehicleData?.engine?.transmission || ''}
          onChange={e => handleNestedChange('engine.transmission', e.target.value)}
        >
          <option value="">Select transmission</option>
          <option value="Automatic">Automatic</option>
          <option value="Manual">Manual</option>
          <option value="CVT">CVT</option>
        </Select>
      </FormField>
      <FormField>
        <Label>Fuel Type</Label>
        <Select
          value={vehicleData?.engine?.fuelType || ''}
          onChange={e => handleNestedChange('engine.fuelType', e.target.value)}
        >
          <option value="">Select fuel type</option>
          <option value="Gasoline">Gasoline</option>
          <option value="Diesel">Diesel</option>
          <option value="Electric">Electric</option>
          <option value="Hybrid">Hybrid</option>
        </Select>
      </FormField>
      <FormField>
        <Label>Engine</Label>
        <Input
          type="text"
          value={vehicleData?.engine?.type || ''}
          onChange={e => handleNestedChange('engine.type', e.target.value)}
          placeholder="Enter engine details"
        />
      </FormField>
      <FormField>
        <Label>Drive</Label>
        <Input
          type="text"
          value={vehicleData?.engine?.drive || ''}
          onChange={e => handleNestedChange('engine.drive', e.target.value)}
          placeholder="Enter drive type (e.g. 4WD, AWD, FWD, etc.)"
        />
      </FormField>
      <FormField>
        <Label>Body</Label>
        <Input
          type="text"
          value={vehicleData?.body || ''}
          onChange={e => onVehicleData({ ...vehicleData, body: e.target.value })}
          placeholder="Enter body type (e.g. SUV, Sedan, etc.)"
        />
      </FormField>
    </FormContainer>
  );
};

const FormContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  padding: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
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

const FormSection = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #2563eb;
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  color: #059669;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const Checkbox = styled.input`
  width: 1rem;
  height: 1rem;
`;

const CheckboxLabel = styled.label`
  font-size: 0.875rem;
  color: #374151;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 1rem;
  background: #f9fafb;
`;

const BulkFeaturesTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  min-height: 80px;
  resize: vertical;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const BulkFeaturesButton = styled.button`
  padding: 0.5rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 1rem;
  
  &:hover {
    background: #059669;
  }
`;

export default AddVehicle; 