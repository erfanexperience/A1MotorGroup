import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import heroImg from '../assests/hero-img.png';
import { FaRegHeart, FaHeart, FaImages } from 'react-icons/fa';
import logoMain from '../assests/logo-main.png';
import Footer from '../components/Footer';
import BookTestDriveModal from '../components/BookTestDriveModal';
import placeholderImage from '../assests/palceholder.png';

const Home = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [searchType, setSearchType] = useState('make');
  const [selectedMake, setSelectedMake] = useState('');
  const [budget, setBudget] = useState(50000);
  const [availableMakes, setAvailableMakes] = useState([]);
  const [sortBy, setSortBy] = useState('price');
  const [favorites, setFavorites] = useState([]);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookCarVin, setBookCarVin] = useState(null);

  useEffect(() => {
    // Fetch vehicles from the API
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/vehicles');
        const data = await response.json();
        setVehicles(data);
        
        // Extract unique makes
        const makes = [...new Set(data.map(vehicle => vehicle.make))];
        setAvailableMakes(makes);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
    };

    fetchVehicles();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchType === 'make' && selectedMake) {
      params.append('make', selectedMake);
    } else if (searchType === 'budget') {
      params.append('maxPrice', budget);
    }
    navigate(`/inventory?${params.toString()}`);
  };

  const sortedVehicles = [...vehicles].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'year') return b.year - a.year;
    if (sortBy === 'mileage') return a.mileage - b.mileage;
    return 0;
  });

  const toggleFavorite = (id) => {
    setFavorites(favs => favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id]);
  };

  const handleViewDetails = (carId) => {
    navigate(`/car/${carId}`);
  };

  return (
    <PageContainer>
      <Header />
      <HeroSection>
        <HeroOverlay />
        <HeroContent>
          <HeroTitle>Luxury • Affordability • Excellence</HeroTitle>
          <HeroSubtitle>Discover premium pre-owned vehicles that combine luxury with exceptional value</HeroSubtitle>
        </HeroContent>
        <SearchBoxWrapper>
          <SearchCard>
            <ToggleRow>
              <SearchTypeToggle>
                <ToggleButton 
                  active={searchType === 'make'} 
                  onClick={() => setSearchType('make')}
                >
                  Search by Make
                </ToggleButton>
                <ToggleButton 
                  active={searchType === 'budget'} 
                  onClick={() => setSearchType('budget')}
                >
                  Search by Budget
                </ToggleButton>
              </SearchTypeToggle>
            </ToggleRow>
            {searchType === 'make' ? (
              <>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <SearchLabel>What brand are you looking for?</SearchLabel>
                  <SearchCardContentRow>
            <SearchSelect value={selectedMake} onChange={e => setSelectedMake(e.target.value)}>
              <option value="">Select a Make</option>
              {availableMakes.map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </SearchSelect>
                    <SearchButton onClick={handleSearch}>Search</SearchButton>
                  </SearchCardContentRow>
                </div>
              </>
            ) : (
              <>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <SearchLabel>What's your budget to get your dream car?</SearchLabel>
                  <SearchCardContentRow>
                    <BudgetContainer>
                <BudgetLabel>Your Budget: ${budget.toLocaleString()}</BudgetLabel>
                <BudgetSlider
                  type="range"
                  min="0"
                  max="200000"
                  step="1000"
                  value={budget}
                  onChange={e => setBudget(Number(e.target.value))}
                />
                <BudgetRange>
                  <span>$0</span>
                  <span>$200,000</span>
                </BudgetRange>
              </BudgetContainer>
                    <SearchButton onClick={handleSearch}>Search</SearchButton>
                  </SearchCardContentRow>
                </div>
              </>
            )}
          </SearchCard>
        </SearchBoxWrapper>
      </HeroSection>

      {/* Car List Section */}
      <CarListSection>
        <SortBar>
          <SortLabel>Sort by:</SortLabel>
          <SortSelect value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="price">Price</option>
            <option value="year">Year</option>
            <option value="mileage">Mileage</option>
          </SortSelect>
        </SortBar>
        <CarGrid>
          {sortedVehicles.map(car => {
            const carDetailsUrl = `/car/${car.vin}`;
            return (
              <CarCard key={car.vin}>
                <a
                  href={carDetailsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                  tabIndex={-1}
                >
                  <CarImageWrapper as="div">
                    <CarImage src={car.mainImage || placeholderImage} alt={`${car.modelYear || car.year || ''} ${car.make} ${car.model}`} />
                    <ImageOverlay />
                    <DealershipLogo src={logoMain} alt="A1 Motor Group" />
                  </CarImageWrapper>
                  <CarInfo>
                    <CarTitle>{(car.modelYear || car.year || 'N/A')} {car.make} {car.model}</CarTitle>
                    <CarPrice>
                      {car.pricing && car.pricing.salesPrice && car.pricing.salesPrice !== car.pricing.price ? (
                        <>
                          <span style={{ textDecoration: 'line-through', color: '#b0b8c1', marginRight: 8 }}>
                            ${Number(car.pricing.price).toLocaleString()}
                          </span>
                          <span style={{ color: '#2196F3', fontWeight: 700, fontSize: '1.15em' }}>
                            ${Number(car.pricing.salesPrice).toLocaleString()}
                          </span>
                        </>
                      ) : car.pricing && car.pricing.price ? (
                        `$${Number(car.pricing.price).toLocaleString()}`
                      ) : 'N/A'}
                    </CarPrice>
                    <KeySpecsRow>
                      <Spec>{car.mileage !== undefined && car.mileage !== null ? `${Number(car.mileage).toLocaleString()} mi` : 'N/A'}</Spec>
                      <Spec>{car.engine?.transmission || '-'}</Spec>
                      <Spec>{car.engine?.fuelType || '-'}</Spec>
                      <Spec>{car.exterior?.color || '-'}</Spec>
                    </KeySpecsRow>
                  </CarInfo>
                </a>
                <CarActions>
                  <BookButton onClick={() => { setIsBookModalOpen(true); setBookCarVin(car.vin); }}>Book Test Drive</BookButton>
                  <a
                    href={carDetailsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', color: '#2c3e50', fontWeight: 600, fontSize: '1.02rem', border: 'none', borderRadius: 8, padding: '0.6rem 0', cursor: 'pointer', boxShadow: '0 2px 8px 0 rgba(44, 62, 80, 0.06)', transition: 'all 0.2s', textDecoration: 'none' }}
                  >
                    View Details
                  </a>
                </CarActions>
              </CarCard>
            );
          })}
        </CarGrid>
      </CarListSection>

      {/* We Buy Cars Section */}
      <WeBuySection>
        <WeBuyOverlay />
        <WeBuyContent>
          <WeBuyTitle>Not Like Other Websites</WeBuyTitle>
          <WeBuySubtitle>We are NOT buying your car 100% online. As a small dealership, we believe in face-to-face conversations about your vehicle.</WeBuySubtitle>
        </WeBuyContent>
        <WeBuySearchBoxWrapper>
          <WeBuySearchCard>
            <WeBuySearchLabel>Enter your vehicle information</WeBuySearchLabel>
            <WeBuySearchCardContentRow>
              <WeBuySearchInput 
                type="text" 
                placeholder="Enter License Plate or VIN"
                maxLength={17}
              />
              <WeBuySearchButton onClick={() => window.location.href = '/sell'}>Get a Quote</WeBuySearchButton>
            </WeBuySearchCardContentRow>
          </WeBuySearchCard>
        </WeBuySearchBoxWrapper>
      </WeBuySection>

      {/* Contact Section */}
      <ContactSection>
        <ContactInfoCol>
          <ContactTitle>Find Us</ContactTitle>
          <ContactItem>
            <ContactLabel>Phone</ContactLabel>
            <ContactValue><a href="tel:+14089825456">(408) 982-5456</a></ContactValue>
          </ContactItem>
          <ContactItem>
            <ContactLabel>Working Hours</ContactLabel>
            <ContactValue>Mon - Saturday 10AM - 5PM</ContactValue>
          </ContactItem>
          <ContactItem>
            <ContactLabel>Our Address</ContactLabel>
            <ContactValue>345 Saratoga Ave, San Jose, CA 95129</ContactValue>
          </ContactItem>
        </ContactInfoCol>
        <MapCol>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3172.3327925305077!2d-121.9473!3d37.3022!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808e33c9c6c3c6b1%3A0x9c7c6c3c6c3c6c3c!2s345%20Saratoga%20Ave%2C%20San%20Jose%2C%20CA%2095129!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Map"
          ></iframe>
        </MapCol>
      </ContactSection>

      {/* Financing Section */}
      <FinancingSection>
        <FinancingOverlay />
        <FinancingContent>
          <FinancingTitle>Personalized Financing Solutions</FinancingTitle>
          <FinancingDescription>
            Every customer's situation is unique. We believe in face-to-face conversations at our dealership to create a financing plan that works specifically for you.
          </FinancingDescription>
          <FinancingButton onClick={() => window.location.href = '/financing'}>
            Start Your Application
          </FinancingButton>
        </FinancingContent>
      </FinancingSection>

      <BookTestDriveModal
        isOpen={isBookModalOpen}
        onClose={() => { setIsBookModalOpen(false); setBookCarVin(null); }}
        cars={vehicles}
        preselectedCarVin={bookCarVin}
        onSubmit={() => { setIsBookModalOpen(false); setBookCarVin(null); }}
      />

      <Footer />
    </PageContainer>
  );
};

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  overflow: hidden;
`;

const HeroSection = styled.section`
  position: relative;
  width: 100vw;
  height: 70vh;
  min-height: 420px;
  background: url(${heroImg}) center center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  @media (max-width: 900px) {
    height: 340px;
    min-height: 220px;
  }
`;

const HeroOverlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(90deg, rgba(30,41,59,0.85) 0%, rgba(30,41,59,0.4) 40%, rgba(30,41,59,0) 70%);
  z-index: 1;
`;

const HeroContent = styled.div`
  position: absolute;
  top: 0; left: 0; bottom: 0;
  width: 40vw;
  min-width: 320px;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  z-index: 2;
  color: #fff;
  text-align: left;
  padding-left: 6rem;
  pointer-events: none;
  @media (max-width: 900px) {
    width: 90vw;
    min-width: unset;
    max-width: unset;
    padding-left: 2rem;
  }
`;

const HeroTitle = styled.h1`
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: #fff;
  @media (max-width: 900px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  font-weight: 400;
  margin-bottom: 2.2rem;
  color: #f3f4f6;
  @media (max-width: 900px) {
    font-size: 1rem;
    margin-bottom: 1.2rem;
  }
`;

const SearchBoxWrapper = styled.div`
  position: absolute;
  left: 50%;
  bottom: -40px;
  transform: translateX(-50%);
  z-index: 3;
  width: 900px;
  max-width: 98vw;
  pointer-events: auto;
  @media (max-width: 1200px) {
    width: 98vw;
    left: 50%;
    bottom: -30px;
    transform: translateX(-50%);
  }
`;

const SearchCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 12px 0 rgba(30,41,59,0.10);
  padding: 1.1rem 1.3rem 1.5rem 1.3rem;
  min-height: 90px;
  width: 100%;
  @media (max-width: 900px) {
    padding: 0.7rem;
    border-radius: 12px;
    min-height: unset;
  }
`;

const ToggleRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  margin-top: 0.1rem;
`;

const SearchTypeToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #f3f4f6;
  padding: 0.12rem;
  border-radius: 10px;
  width: fit-content;
`;

const ToggleButton = styled.button`
  background: ${props => props.active ? '#2c3e50' : 'transparent'};
  color: ${props => props.active ? '#fff' : '#1a1a1a'};
  border: none;
  border-radius: 7px;
  padding: 0.38rem 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  font-size: 1rem;
  position: relative;
  z-index: 1;
  min-width: 90px;
  &:hover {
    color: ${props => props.active ? '#fff' : '#2c3e50'};
  }
`;

const SearchCardContentRow = styled.div`
  display: flex;
  width: 90%;
  align-items: center;
  gap: 1.1rem;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 0.7rem;
    width: 100%;
  }
`;

const SearchCardLeft = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex: 1;
  min-width: 0;
`;

const SearchLabel = styled.div`
  font-size: 1rem;
  color: #2c3e50;
  margin-bottom: 0.4rem;
  font-weight: 500;
  text-align: left;
`;

const SearchSelect = styled.select`
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 7px;
  padding: 0.6rem 1rem;
  height: 48px;
  font-size: 1rem;
  color: #2c3e50;
  outline: none;
  min-width: 140px;
  flex: 1;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  &:focus {
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.08);
  }
`;

const BudgetContainer = styled.div`
  margin-bottom: 0;
  flex: 1;
`;

const BudgetLabel = styled.div`
  font-size: 0.98rem;
  color: #1a1a1a;
  margin-bottom: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.01em;
`;

const BudgetSlider = styled.input`
  width: 100%;
  height: 3px;
  background: #e5e7eb;
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
  margin-bottom: 0.5rem;
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    background: #2c3e50;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
    border: 2px solid white;
    &:hover {
      transform: scale(1.08);
      background: #3498db;
    }
  }
`;

const BudgetRange = styled.div`
  display: flex;
  justify-content: space-between;
  color: #4a4a4a;
  font-size: 0.85rem;
  font-weight: 500;
`;

const SearchButton = styled.button`
  background: linear-gradient(90deg, #2c3e50 0%, #3498db 100%);
  color: #fff;
  font-weight: 700;
  font-size: 1.05rem;
  border: none;
  border-radius: 10px;
  padding: 0 1.5rem;
  height: 48px;
  line-height: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
  max-width: 200px;
  cursor: pointer;
  box-shadow: 0 1px 4px 0 rgba(44, 62, 80, 0.08);
  transition: all 0.2s ease;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(44, 62, 80, 0.13);
  }
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 4px rgba(44, 62, 80, 0.08);
  }
`;

// --- Car List Section Styles ---
const CarListSection = styled.section`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 4rem 2rem 2rem 2rem;
`;

const SortBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 2rem;
  gap: 1rem;
`;

const SortLabel = styled.span`
  font-size: 1.1rem;
  color: #222;
  font-weight: 500;
`;

const SortSelect = styled.select`
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  color: #2c3e50;
  outline: none;
  transition: all 0.2s ease;
  &:focus {
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.08);
  }
`;

const CarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const CarCard = styled.div`
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 6px 32px 0 rgba(30,41,59,0.10);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s, transform 0.2s;
  position: relative;
  min-width: 0;
  max-width: 420px;
  margin: 0 auto;
  border: 1.5px solid #f3f4f6;
  &:hover {
    box-shadow: 0 12px 32px 0 rgba(30,41,59,0.18);
    transform: translateY(-4px) scale(1.025);
    border-color: #e5e7eb;
  }
`;

const CarImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16/10;
  background: #f3f4f6;
  overflow: hidden;
  cursor: pointer;
`;

const CarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
  ${CarCard}:hover & {
    transform: scale(1.04);
  }
`;

const ImageOverlay = styled.div`
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 38%;
  background: linear-gradient(0deg, rgba(30,41,59,0.55) 60%, rgba(30,41,59,0.0) 100%);
  z-index: 2;
`;

const DealershipLogo = styled.img`
  position: absolute;
  top: 0.7rem;
  left: 0.7rem;
  width: 60px;
  height: auto;
  opacity: 0.85;
  z-index: 3;
  pointer-events: none;
`;

const CarInfo = styled.div`
  padding: 1.1rem 1.1rem 0.3rem 1.1rem;
  flex: 1;
`;

const CarTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.3rem;
`;

const CarPrice = styled.div`
  font-size: 1.18rem;
  font-weight: 700;
  color: #3498db;
  margin-bottom: 0.5rem;
`;

const CarSpecs = styled.div`
  display: flex;
  gap: 0.7rem;
  font-size: 0.98rem;
  color: #4a4a4a;
  margin-bottom: 0.3rem;
`;

const Spec = styled.span`
  display: flex;
  align-items: center;
`;

const KeySpecsRow = styled.div`
  display: flex;
  gap: 0.7rem;
  font-size: 0.93rem;
  color: #6b7280;
  margin-bottom: 0.2rem;
`;

const CarActions = styled.div`
  display: flex;
  gap: 0.7rem;
  padding: 0.7rem 1.1rem 1.1rem 1.1rem;
`;

const BookButton = styled.button`
  flex: 1;
  background: linear-gradient(90deg, #2c3e50 0%, #3498db 100%);
  color: #fff;
  font-weight: 700;
  font-size: 1.02rem;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 0;
  cursor: pointer;
  box-shadow: 0 2px 8px 0 rgba(44, 62, 80, 0.10);
  transition: all 0.2s;
  &:hover {
    background: linear-gradient(90deg, #3498db 0%, #2c3e50 100%);
    color: #f8fafc;
  }
`;

const WeBuySection = styled.section`
  position: relative;
  width: 100vw;
  height: 70vh;
  min-height: 420px;
  background: url(${require('../assests/we-buy.png')}) center center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: 4rem;
  @media (max-width: 900px) {
    height: 340px;
    min-height: 220px;
  }
`;

const WeBuyOverlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(90deg, rgba(30,41,59,0.85) 0%, rgba(30,41,59,0.4) 40%, rgba(30,41,59,0) 70%);
  z-index: 1;
`;

const WeBuyContent = styled.div`
  position: absolute;
  top: 0; left: 0; bottom: 0;
  width: 40vw;
  min-width: 320px;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  z-index: 2;
  color: #fff;
  text-align: left;
  padding-left: 6rem;
  pointer-events: none;
  @media (max-width: 900px) {
    width: 90vw;
    min-width: unset;
    max-width: unset;
    padding-left: 2rem;
  }
`;

const WeBuyTitle = styled.h2`
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: #fff;
  @media (max-width: 900px) {
    font-size: 2rem;
  }
`;

const WeBuySubtitle = styled.p`
  font-size: 1.25rem;
  font-weight: 400;
  margin-bottom: 2.2rem;
  color: #f3f4f6;
  @media (max-width: 900px) {
    font-size: 1rem;
    margin-bottom: 1.2rem;
  }
`;

const WeBuySearchBoxWrapper = styled.div`
  position: absolute;
  left: 50%;
  bottom: -40px;
  transform: translateX(-50%);
  z-index: 3;
  width: 900px;
  max-width: 98vw;
  pointer-events: auto;
  @media (max-width: 1200px) {
    width: 98vw;
    left: 50%;
    bottom: -30px;
    transform: translateX(-50%);
  }
`;

const WeBuySearchCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 12px 0 rgba(30,41,59,0.10);
  padding: 1.1rem 1.3rem 1.5rem 1.3rem;
  min-height: 90px;
  width: 100%;
  @media (max-width: 900px) {
    padding: 0.7rem;
    border-radius: 12px;
    min-height: unset;
  }
`;

const WeBuySearchLabel = styled.div`
  font-size: 1rem;
  color: #2c3e50;
  margin-bottom: 0.4rem;
  font-weight: 500;
  text-align: left;
  width: 90%;
`;

const WeBuySearchCardContentRow = styled.div`
  display: flex;
  width: 90%;
  align-items: center;
  gap: 1.1rem;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 0.7rem;
    width: 100%;
  }
`;

const WeBuySearchInput = styled.input`
  flex: 1;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 7px;
  padding: 0.6rem 1rem;
  height: 48px;
  font-size: 1rem;
  color: #2c3e50;
  outline: none;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  &:focus {
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.08);
  }
`;

const WeBuySearchButton = styled.button`
  background: linear-gradient(90deg, #2c3e50 0%, #3498db 100%);
  color: #fff;
  font-weight: 700;
  font-size: 1.05rem;
  border: none;
  border-radius: 10px;
  padding: 0 1.5rem;
  height: 48px;
  line-height: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
  max-width: 200px;
  cursor: pointer;
  box-shadow: 0 1px 4px 0 rgba(44, 62, 80, 0.08);
  transition: all 0.2s ease;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(44, 62, 80, 0.13);
  }
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 4px rgba(44, 62, 80, 0.08);
  }
`;

const ContactSection = styled.section`
  display: flex;
  width: 100vw;
  max-width: 100vw;
  padding: 5rem 0 3rem 0;
  margin: 3.5rem auto 2.5rem auto;
  box-sizing: border-box;
  min-height: 420px;
  @media (max-width: 900px) {
    flex-direction: column;
    padding: 2.5rem 0;
    min-height: 320px;
  }
`;

const ContactInfoCol = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 0 4rem 0 8vw;
  @media (max-width: 900px) {
    padding: 0 2rem;
    align-items: center;
    text-align: center;
  }
`;

const ContactTitle = styled.h2`
  font-size: 2.3rem;
  font-weight: 800;
  color: #2c3e50;
  margin-bottom: 2.5rem;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1.1rem;
  margin-bottom: 1.5rem;
`;

const ContactIcon = styled.span`
  font-size: 2rem;
`;

const ContactLabel = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: #4a4a4a;
  min-width: 120px;
  text-align: left;
`;

const ContactValue = styled.span`
  font-size: 1.15rem;
  color: #1a1a1a;
  a {
    color: #1a1a1a;
    text-decoration: none;
    transition: color 0.2s;
    &:hover {
      color: #3498db;
    }
  }
`;

const MapCol = styled.div`
  flex: 1;
  min-height: 320px;
  height: 340px;
  max-width: 700px;
  padding: 0 8vw 0 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  @media (max-width: 900px) {
    padding: 2rem 2vw 0 2vw;
    width: 100%;
    min-height: 220px;
    height: 220px;
    max-width: 100vw;
  }
  iframe {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  }
`;

const FinancingSection = styled.section`
  position: relative;
  width: 100vw;
  height: 60vh;
  min-height: 380px;
  background: url(${require('../assests/finance.png')}) center center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: 4rem;
  @media (max-width: 900px) {
    height: 320px;
    min-height: 220px;
  }
`;

const FinancingOverlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(90deg, rgba(30,41,59,0.9) 0%, rgba(30,41,59,0.6) 40%, rgba(30,41,59,0.3) 70%);
  z-index: 1;
`;

const FinancingContent = styled.div`
  position: absolute;
  top: 0; left: 0; bottom: 0;
  width: 40vw;
  min-width: 320px;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  z-index: 2;
  color: #fff;
  text-align: left;
  padding-left: 6rem;
  pointer-events: none;
  @media (max-width: 900px) {
    width: 90vw;
    min-width: unset;
    max-width: unset;
    padding-left: 2rem;
  }
`;

const FinancingTitle = styled.h2`
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: #fff;
  @media (max-width: 900px) {
    font-size: 2rem;
  }
`;

const FinancingDescription = styled.p`
  font-size: 1.25rem;
  font-weight: 400;
  margin-bottom: 2.2rem;
  color: #f3f4f6;
  @media (max-width: 900px) {
    font-size: 1rem;
    margin-bottom: 1.2rem;
  }
`;

const FinancingButton = styled.button`
  background: #fff;
  color: #1a1a1a;
  font-weight: 600;
  font-size: 1.1rem;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  pointer-events: auto;
  &:hover {
    background: #f3f4f6;
    transform: translateY(-1px);
  }
`;

export default Home; 