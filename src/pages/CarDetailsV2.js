import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';
import placeholderImage from '../assests/palceholder.webp';
import ImageGallery from '../components/ImageGallery';

// --- Styled Components ---
const PageContainer = styled.div`
  background: #f7f8fa;
  min-height: 100vh;
`;
const MainSection = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem 3rem 1rem;
`;
const GallerySection = styled.div`
  margin-bottom: 2.5rem;
`;
const TitleRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;
const CarTitle = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  color: #222;
`;
const Price = styled.div`
  font-size: 1.5rem;
  color: #0d6efd;
  font-weight: 600;
`;
const SpecsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.2rem;
  margin-bottom: 2rem;
`;
const SpecItem = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;
const SpecLabel = styled.span`
  color: #888;
  font-size: 0.95rem;
  text-transform: uppercase;
`;
const SpecValue = styled.span`
  color: #222;
  font-size: 1.1rem;
  font-weight: 600;
`;
const DescriptionBlock = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`;
const FeaturesBlock = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`;
const FeaturesList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  list-style: none;
  padding: 0;
  margin: 0;
`;
const FeatureItem = styled.li`
  color: #0d6efd;
  font-weight: 500;
  background: #e9f1ff;
  border-radius: 6px;
  padding: 0.4rem 1rem;
  font-size: 1rem;
`;
const ActionsRow = styled.div`
  display: flex;
  gap: 1.2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;
const ActionButton = styled.a`
  background: #0d6efd;
  color: #fff;
  padding: 0.9rem 2.2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
  &:hover {
    background: #084298;
  }
`;

// --- Main Component ---
const CarDetailsV2 = () => {
  const { id } = useParams();
  const vin = id;
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await axios.get('/api/vehicles');
        let foundCar = response.data.find(vehicle => vehicle.vin === vin);
        if (foundCar) {
          foundCar = {
            ...foundCar,
            pricing: {
              price: foundCar.price,
              salesPrice: foundCar.sales_price,
              financingPerMonth: foundCar.financing_per_month
            },
            images: Array.isArray(foundCar.images)
              ? foundCar.images.map(img => img.url || img)
              : []
          };
          setCar(foundCar);
        } else {
          setError('Car not found');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load car details');
        setLoading(false);
      }
    };
    fetchCarDetails();
  }, [vin]);

  if (loading) return <div style={{padding:'2rem',textAlign:'center'}}>Loading...</div>;
  if (error) return <div style={{padding:'2rem',textAlign:'center',color:'#c00'}}>{error}</div>;
  if (!car) return <div style={{padding:'2rem',textAlign:'center',color:'#c00'}}>Car not found</div>;

  // --- Render ---
  return (
    <PageContainer>
      <Header />
      <MainSection>
        <GallerySection>
          <ImageGallery images={car.images || []} />
        </GallerySection>
        <TitleRow>
          <CarTitle>{car.year} {car.make} {car.model}</CarTitle>
          <Price>${car.pricing?.salesPrice || car.pricing?.price || 'N/A'}</Price>
        </TitleRow>
        <SpecsGrid>
          <SpecItem>
            <SpecLabel>VIN</SpecLabel>
            <SpecValue>{car.vin}</SpecValue>
          </SpecItem>
          <SpecItem>
            <SpecLabel>Mileage</SpecLabel>
            <SpecValue>{car.mileage ? car.mileage.toLocaleString() : 'N/A'}</SpecValue>
          </SpecItem>
          <SpecItem>
            <SpecLabel>Engine</SpecLabel>
            <SpecValue>{car.engine || 'N/A'}</SpecValue>
          </SpecItem>
          <SpecItem>
            <SpecLabel>Transmission</SpecLabel>
            <SpecValue>{car.transmission || 'N/A'}</SpecValue>
          </SpecItem>
          <SpecItem>
            <SpecLabel>Drivetrain</SpecLabel>
            <SpecValue>{car.drivetrain || 'N/A'}</SpecValue>
          </SpecItem>
          <SpecItem>
            <SpecLabel>Color</SpecLabel>
            <SpecValue>{car.color || 'N/A'}</SpecValue>
          </SpecItem>
        </SpecsGrid>
        <DescriptionBlock>
          <h2>Description</h2>
          <p>{car.description || 'No description available.'}</p>
        </DescriptionBlock>
        {car.features && car.features.length > 0 && (
          <FeaturesBlock>
            <h2>Features</h2>
            <FeaturesList>
              {car.features.map((feature, idx) => (
                <FeatureItem key={feature || idx}>{feature}</FeatureItem>
              ))}
            </FeaturesList>
          </FeaturesBlock>
        )}
        <ActionsRow>
          <ActionButton href="/contact">Contact Dealer</ActionButton>
          <ActionButton href="/financing">Get Financing</ActionButton>
          <ActionButton href="/test-drive">Book Test Drive</ActionButton>
        </ActionsRow>
      </MainSection>
      <Footer />
    </PageContainer>
  );
};

export default CarDetailsV2; 