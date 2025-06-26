import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaChevronLeft, FaChevronRight, FaFilter } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function useIsMobile(breakpoint = 900) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= breakpoint);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);
  return isMobile;
}

const Inventory = () => {
  const [cars, setCars] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const query = useQuery();
  const [filters, setFilters] = useState({
    make: query.get('make') || '',
    model: '',
    year: '',
    minPrice: '',
    maxPrice: query.get('maxPrice') || ''
  });
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);
  const [imageIndexes, setImageIndexes] = useState({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile(900);

  useEffect(() => {
    const fetchCars = async () => {
      const res = await fetch('/api/vehicles');
      let data = await res.json();
      // Sort by upload time (descending)
      data = data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setCars(data);
      setFiltered(data);
      setMakes([...new Set(data.map(car => car.make).filter(Boolean))]);
      setModels([...new Set(data.map(car => car.model).filter(Boolean))]);
      setYears([...new Set(data.map(car => car.modelYear || car.year).filter(Boolean))].sort((a, b) => b - a));
      // Initialize image indexes
      const idxs = {};
      data.forEach(car => { idxs[car.vin] = 0; });
      setImageIndexes(idxs);
    };
    fetchCars();
  }, []);

  useEffect(() => {
    let result = cars;
    if (filters.make) result = result.filter(car => car.make === filters.make);
    if (filters.model) result = result.filter(car => car.model === filters.model);
    if (filters.year) result = result.filter(car => String(car.modelYear || car.year) === filters.year);
    if (filters.minPrice) result = result.filter(car => car.pricing?.price >= Number(filters.minPrice));
    if (filters.maxPrice) result = result.filter(car => car.pricing?.price <= Number(filters.maxPrice));
    setFiltered(result);
  }, [filters, cars]);

  const handleFilterChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handlePrevImage = vin => {
    setImageIndexes(idx => ({
      ...idx,
      [vin]: idx[vin] === 0 ? (filtered.find(car => car.vin === vin)?.images?.length || 1) - 1 : idx[vin] - 1
    }));
  };
  const handleNextImage = vin => {
    setImageIndexes(idx => ({
      ...idx,
      [vin]: idx[vin] === ((filtered.find(car => car.vin === vin)?.images?.length || 1) - 1) ? 0 : idx[vin] + 1
    }));
  };

  // --- MOBILE LAYOUT ---
  if (isMobile) {
    return (
      <>
        <Header />
        <MobileInventoryOuter>
          <MobileFilterCard>
            <MobileFilterHeader onClick={() => setMobileFiltersOpen(open => !open)}>
              <span style={{ fontWeight: 700, fontSize: '1.15rem' }}>Filters</span>
              <FaFilter style={{ marginLeft: 8 }} />
            </MobileFilterHeader>
            {mobileFiltersOpen && (
              <MobileFilterContent>
                <MobileFilterRow>
                  <MobileFilterField>
                    <label>Make</label>
                    <select name="make" value={filters.make} onChange={handleFilterChange}>
                      <option value="">All</option>
                      {makes.map(make => <option key={make} value={make}>{make}</option>)}
                    </select>
                  </MobileFilterField>
                  <MobileFilterField>
                    <label>Model</label>
                    <select name="model" value={filters.model} onChange={handleFilterChange}>
                      <option value="">All</option>
                      {models.map(model => <option key={model} value={model}>{model}</option>)}
                    </select>
                  </MobileFilterField>
                  <MobileFilterField>
                    <label>Year</label>
                    <select name="year" value={filters.year} onChange={handleFilterChange}>
                      <option value="">All</option>
                      {years.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                  </MobileFilterField>
                  <MobileFilterField>
                    <label>Min Price</label>
                    <input name="minPrice" type="number" value={filters.minPrice} onChange={handleFilterChange} placeholder="$" min="0" />
                  </MobileFilterField>
                  <MobileFilterField>
                    <label>Max Price</label>
                    <input name="maxPrice" type="number" value={filters.maxPrice} onChange={handleFilterChange} placeholder="$" min="0" />
                  </MobileFilterField>
                </MobileFilterRow>
              </MobileFilterContent>
            )}
          </MobileFilterCard>
          <MobileCarGrid>
            {filtered.length === 0 ? (
              <NoResults>No cars found matching your criteria.</NoResults>
            ) : (
              filtered.map(car => {
                const images = car.images && car.images.length > 0 ? car.images : [car.mainImage || '/placeholder-car.jpg'];
                const idx = imageIndexes[car.vin] || 0;
                return (
                  <MobileCarCard key={car.vin}>
                    <MobileCarImageSection>
                      <MobileArrowButtonLeft onClick={() => handlePrevImage(car.vin)} aria-label="Previous image"><FaChevronLeft /></MobileArrowButtonLeft>
                      <MobileCarImage src={images[idx]} alt={`${car.modelYear || car.year} ${car.make} ${car.model}`} />
                      <MobileArrowButtonRight onClick={() => handleNextImage(car.vin)} aria-label="Next image"><FaChevronRight /></MobileArrowButtonRight>
                    </MobileCarImageSection>
                    <MobileCarInfoSection>
                      <MobileCarTitleRow>
                        <MobileCarTitle>{car.modelYear || car.year} {car.make} {car.model}</MobileCarTitle>
                        <MobileCarPriceBlock>
                          {car.pricing?.salesPrice && car.pricing?.salesPrice !== car.pricing?.price ? (
                            <>
                              <MobileCarPriceOld>${Number(car.pricing.price).toLocaleString()}</MobileCarPriceOld>
                              <MobileCarPrice>${Number(car.pricing.salesPrice).toLocaleString()}</MobileCarPrice>
                            </>
                          ) : (
                            <MobileCarPrice>${car.pricing?.price ? Number(car.pricing.price).toLocaleString() : 'Contact for price'}</MobileCarPrice>
                          )}
                        </MobileCarPriceBlock>
                      </MobileCarTitleRow>
                      <MobileCarSpecs>
                        <span>{car.mileage ? `${Number(car.mileage).toLocaleString()} mi` : 'Mileage N/A'}</span>
                        <MobileSpecGrid>
                          {car.engine?.transmission && <MobileSpecItem><MobileSpecLabel>Transmission:</MobileSpecLabel> {car.engine.transmission}</MobileSpecItem>}
                          {car.engine?.fuelType && <MobileSpecItem><MobileSpecLabel>Fuel:</MobileSpecLabel> {car.engine.fuelType}</MobileSpecItem>}
                          {car.bodyClass && <MobileSpecItem><MobileSpecLabel>Body:</MobileSpecLabel> {car.bodyClass}</MobileSpecItem>}
                          {(car.exterior?.color || car.exteriorColor || car.color) && <MobileSpecItem><MobileSpecLabel>Color:</MobileSpecLabel> {car.exterior?.color || car.exteriorColor || car.color}</MobileSpecItem>}
                        </MobileSpecGrid>
                      </MobileCarSpecs>
                      <MobileCarActions>
                        <MobileActionButton onClick={() => navigate(`/car/${car.vin}`)}>View Details</MobileActionButton>
                        <MobileFinancingButton onClick={() => navigate('/financing')}>Apply for Financing</MobileFinancingButton>
                      </MobileCarActions>
                    </MobileCarInfoSection>
                  </MobileCarCard>
                );
              })
            )}
          </MobileCarGrid>
        </MobileInventoryOuter>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <InventoryOuter>
        <InventoryContent>
          <FilterSidebar>
            <FilterBox>
              <FilterTitle>Filter by</FilterTitle>
              <FilterRow>
                <FilterField>
                  <label>Make</label>
                  <select name="make" value={filters.make} onChange={handleFilterChange}>
                    <option value="">All</option>
                    {makes.map(make => <option key={make} value={make}>{make}</option>)}
                  </select>
                </FilterField>
                <FilterField>
                  <label>Model</label>
                  <select name="model" value={filters.model} onChange={handleFilterChange}>
                    <option value="">All</option>
                    {models.map(model => <option key={model} value={model}>{model}</option>)}
                  </select>
                </FilterField>
                <FilterField>
                  <label>Year</label>
                  <select name="year" value={filters.year} onChange={handleFilterChange}>
                    <option value="">All</option>
                    {years.map(year => <option key={year} value={year}>{year}</option>)}
                  </select>
                </FilterField>
                <FilterField>
                  <label>Min Price</label>
                  <input name="minPrice" type="number" value={filters.minPrice} onChange={handleFilterChange} placeholder="$" min="0" />
                </FilterField>
                <FilterField>
                  <label>Max Price</label>
                  <input name="maxPrice" type="number" value={filters.maxPrice} onChange={handleFilterChange} placeholder="$" min="0" />
                </FilterField>
              </FilterRow>
            </FilterBox>
          </FilterSidebar>
          <CarGrid>
            {filtered.length === 0 ? (
              <NoResults>No cars found matching your criteria.</NoResults>
            ) : (
              filtered.map(car => {
                const images = car.images && car.images.length > 0 ? car.images : [car.mainImage || '/placeholder-car.jpg'];
                const idx = imageIndexes[car.vin] || 0;
                return (
                  <CarCard key={car.vin}>
                    <CarImageSection>
                      <ArrowButtonLeft onClick={() => handlePrevImage(car.vin)} aria-label="Previous image"><FaChevronLeft /></ArrowButtonLeft>
                      <CarImage src={images[idx]} alt={`${car.modelYear || car.year} ${car.make} ${car.model}`} />
                      <ArrowButtonRight onClick={() => handleNextImage(car.vin)} aria-label="Next image"><FaChevronRight /></ArrowButtonRight>
                    </CarImageSection>
                    <CarInfoSection>
                      <CarTitleRow>
                        <CarTitle>{car.modelYear || car.year} {car.make} {car.model}</CarTitle>
                        <CarPriceBlock>
                          {car.pricing?.salesPrice && car.pricing?.salesPrice !== car.pricing?.price ? (
                            <>
                              <CarPriceOld>${Number(car.pricing.price).toLocaleString()}</CarPriceOld>
                              <CarPrice>${Number(car.pricing.salesPrice).toLocaleString()}</CarPrice>
                            </>
                          ) : (
                            <CarPrice>${car.pricing?.price ? Number(car.pricing.price).toLocaleString() : 'Contact for price'}</CarPrice>
                          )}
                        </CarPriceBlock>
                      </CarTitleRow>
                      <CarSpecs>
                        <span>{car.mileage ? `${Number(car.mileage).toLocaleString()} mi` : 'Mileage N/A'}</span>
                        <SpecGrid>
                          {car.engine?.transmission && <SpecItem><SpecLabel>Transmission:</SpecLabel> {car.engine.transmission}</SpecItem>}
                          {car.engine?.fuelType && <SpecItem><SpecLabel>Fuel:</SpecLabel> {car.engine.fuelType}</SpecItem>}
                          {car.bodyClass && <SpecItem><SpecLabel>Body:</SpecLabel> {car.bodyClass}</SpecItem>}
                          {(car.exterior?.color || car.exteriorColor || car.color) && <SpecItem><SpecLabel>Color:</SpecLabel> {car.exterior?.color || car.exteriorColor || car.color}</SpecItem>}
                        </SpecGrid>
                      </CarSpecs>
                      <CarActions>
                        <ActionButton onClick={() => navigate(`/car/${car.vin}`)}>View Details</ActionButton>
                        <FinancingButton onClick={() => navigate('/financing')}>Apply for Financing</FinancingButton>
                      </CarActions>
                    </CarInfoSection>
                  </CarCard>
                );
              })
            )}
          </CarGrid>
        </InventoryContent>
      </InventoryOuter>
      <Footer />
    </>
  );
};

const InventoryOuter = styled.div`
  width: 100vw;
  min-height: 100vh;
  background: #f8fcff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 88px 0 0 0;
  @media (max-width: 900px) {
    padding: 70px 0 0 0;
  }
`;

const InventoryContent = styled.div`
  display: flex;
  width: 100vw;
  max-width: 1320px;
  gap: 2.5rem;
  align-items: flex-start;
  margin-left: auto;
  margin-right: auto;
  margin-top: 0;
  @media (max-width: 1200px) {
    max-width: 98vw;
    gap: 1.2rem;
  }
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 0.7rem;
    max-width: 100vw;
    margin-left: 0;
    margin-right: 0;
  }
`;

const FilterSidebar = styled.div`
  width: 320px;
  min-width: 220px;
  align-self: flex-start;
  margin-top: 0;
  @media (max-width: 900px) {
    width: 100vw;
    min-width: 0;
    order: 2;
    margin-top: 0;
  }
`;

const FilterBox = styled.div`
  width: 100%;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(44,62,80,0.08);
  padding: 2rem 2rem 1.2rem 2rem;
  margin-bottom: 2.5rem;
  margin-top: 1.5rem;
  @media (max-width: 900px) {
    padding: 1.2rem 0.7rem 0.7rem 0.7rem;
    margin-bottom: 1.2rem;
    margin-top: 0.7rem;
  }
`;

const FilterTitle = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: #2E4154;
  margin-bottom: 1.1rem;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 1.2rem;
  flex-wrap: wrap;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 0.7rem;
  }
`;

const FilterField = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 120px;
  flex: 1;
  label {
    font-size: 1rem;
    font-weight: 500;
    color: #2E4154;
    margin-bottom: 0.2rem;
  }
  input, select {
    border: 1.5px solid #e0eafc;
    border-radius: 7px;
    padding: 0.6rem 1rem;
    font-size: 1rem;
    font-family: inherit;
    outline: none;
    transition: border 0.18s;
    background: #fff;
    width: 100%;
    box-sizing: border-box;
  }
  input:focus, select:focus {
    border-color: #2E4154;
  }
`;

const CarGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  max-width: 900px;
  align-self: flex-start;
  margin-top: 0;
  @media (max-width: 900px) {
    gap: 1.2rem;
    max-width: 100vw;
    margin-top: 0;
  }
`;

const CarCard = styled.div`
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(44,62,80,0.10);
  display: flex;
  flex-direction: row;
  overflow: hidden;
  transition: box-shadow 0.18s, transform 0.18s;
  max-width: 100%;
  min-height: 0;
  @media (max-width: 700px) {
    flex-direction: column;
  }
  &:hover {
    box-shadow: 0 4px 24px rgba(44,62,80,0.13);
    transform: translateY(-4px) scale(1.01);
  }
`;

const CarImageSection = styled.div`
  position: relative;
  width: 360px;
  min-width: 220px;
  aspect-ratio: 3/2;
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  @media (max-width: 900px) {
    width: 100%;
    min-width: 0;
    aspect-ratio: 16/9;
  }
`;

const CarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
  display: block;
`;

const ArrowButtonLeft = styled.button`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.55);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #2E4154;
  cursor: pointer;
  z-index: 2;
  box-shadow: 0 1px 4px rgba(44,62,80,0.07);
  transition: background 0.18s, opacity 0.18s;
  opacity: 0.65;
  &:hover {
    background: #e0eafc;
    opacity: 1;
  }
`;

const ArrowButtonRight = styled(ArrowButtonLeft)`
  left: unset;
  right: 10px;
`;

const CarInfoSection = styled.div`
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0.6rem 1rem 0.6rem 1rem;
  min-width: 0;
  @media (max-width: 700px) {
    padding: 0.6rem 0.8rem 0.6rem 0.8rem;
  }
`;

const CarTitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.2rem;
`;

const CarTitle = styled.div`
  font-size: 1.18rem;
  font-weight: 700;
  color: #2E4154;
`;

const CarPriceBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.1rem;
`;

const CarPriceOld = styled.div`
  font-size: 1.05rem;
  color: #b0b8c1;
  text-decoration: line-through;
  font-weight: 500;
`;

const CarPrice = styled.div`
  font-size: 1.22rem;
  font-weight: 800;
  color: #4F8DFD;
  white-space: nowrap;
`;

const CarSpecs = styled.div`
  font-size: 1.01rem;
  color: #3a4a5d;
  margin-top: 0.3rem;
`;

const CarActions = styled.div`
  display: flex;
  gap: 0.8rem;
  margin-top: 0.6rem;
  @media (max-width: 700px) {
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.6rem;
  }
`;

const ActionButton = styled.button`
  background: linear-gradient(90deg, #2E4154 0%, #4F8DFD 100%);
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  cursor: pointer;
  transition: background 0.18s;
  box-shadow: 0 1px 4px rgba(44,62,80,0.07);
  &:hover {
    background: linear-gradient(90deg, #4F8DFD 0%, #2E4154 100%);
  }
`;

const FinancingButton = styled(ActionButton)`
  background: #e0eafc;
  color: #2E4154;
  &:hover {
    background: #d0e0f7;
    color: #2E4154;
  }
`;

const NoResults = styled.div`
  width: 100%;
  text-align: center;
  color: #888;
  font-size: 1.15rem;
  margin: 2.5rem 0;
`;

const SpecGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem 1.2rem;
  margin-top: 0.5rem;
`;

const SpecItem = styled.div`
  font-size: 0.97rem;
  color: #2E4154;
  background: #f2f6fa;
  border-radius: 6px;
  padding: 0.18rem 0.7rem;
  display: flex;
  align-items: center;
`;

const SpecLabel = styled.span`
  font-weight: 600;
  color: #4F8DFD;
  margin-right: 0.3rem;
`;

// Add styled-components for mobile layout below
const MobileInventoryOuter = styled.div`
  width: 100vw;
  min-height: 100vh;
  background: #f8fcff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 70px 0 0 0;
`;
const MobileFilterCard = styled.div`
  width: 94vw;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px 0 rgba(30,41,59,0.08);
  margin: 1.2rem auto 1.5rem auto;
  padding: 0.7rem 1rem;
`;
const MobileFilterHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  font-weight: 700;
  font-size: 1.15rem;
`;
const MobileFilterContent = styled.div`
  margin-top: 1rem;
`;
const MobileFilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.1rem;
`;
const MobileFilterField = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 120px;
  min-width: 120px;
  label {
    font-size: 1.05rem;
    color: #2c3e50;
    font-weight: 600;
    margin-bottom: 0.2rem;
    text-align: left;
  }
  select, input {
    border: 1px solid #e5e7eb;
    background: #fff;
    border-radius: 7px;
    padding: 0.6rem 1rem;
    height: 44px;
    font-size: 1rem;
    color: #2c3e50;
    outline: none;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
    width: 100%;
  }
`;
const MobileCarGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100vw;
  align-items: center;
`;
const MobileCarCard = styled.div`
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
  @media (max-width: 900px) {
    width: 90vw;
    max-width: 90vw;
    margin: 0.7rem auto;
  }
`;
const MobileCarImageSection = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16/10;
  background: #f3f4f6;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const MobileCarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
const MobileArrowButtonLeft = styled.button`
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.85);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(44,62,80,0.10);
`;
const MobileArrowButtonRight = styled(MobileArrowButtonLeft)`
  left: unset;
  right: 8px;
`;
const MobileCarInfoSection = styled.div`
  padding: 1.1rem 1.1rem 0.3rem 1.1rem;
  flex: 1;
`;
const MobileCarTitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.7rem;
`;
const MobileCarTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.3rem;
`;
const MobileCarPriceBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;
const MobileCarPrice = styled.div`
  font-size: 1.18rem;
  font-weight: 700;
  color: #3498db;
  margin-bottom: 0.2rem;
`;
const MobileCarPriceOld = styled.div`
  font-size: 1rem;
  color: #b0b8c1;
  text-decoration: line-through;
`;
const MobileCarSpecs = styled.div`
  display: flex;
  gap: 0.7rem;
  font-size: 0.98rem;
  color: #4a4a4a;
  margin-bottom: 0.3rem;
`;
const MobileSpecGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;
const MobileSpecItem = styled.div`
  font-size: 0.93rem;
  color: #6b7280;
`;
const MobileSpecLabel = styled.span`
  font-weight: 600;
  color: #2c3e50;
  margin-right: 0.3rem;
`;
const MobileCarActions = styled.div`
  display: flex;
  gap: 0.7rem;
  padding: 0.7rem 1.1rem 1.1rem 1.1rem;
`;
const MobileActionButton = styled.button`
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
const MobileFinancingButton = styled(MobileActionButton)`
  background: #fff;
  color: #1a1a1a;
  border: 1.5px solid #3498db;
  &:hover {
    background: #f3f4f6;
    color: #3498db;
  }
`;

export default Inventory; 