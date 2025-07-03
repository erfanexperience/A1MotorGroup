import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Modal from '../../components/Modal';
import AddVehicle from './AddVehicle';
import placeholderImage from '../../assests/palceholder.webp';

const Inventory = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [modalTitle, setModalTitle] = useState('Add New Vehicle');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles');
      let data = await response.json();
      data = data.map(vehicle => ({
        ...vehicle,
        pricing: {
          price: vehicle.price,
          salesPrice: vehicle.sales_price,
          financingPerMonth: vehicle.financing_per_month
        },
        images: Array.isArray(vehicle.images)
          ? vehicle.images.map(img => img.url || img)
          : []
      }));
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const handleAddVehicle = () => {
    setSelectedVehicle(null);
    setModalTitle('Add New Vehicle');
    setIsAddModalOpen(true);
    setIsEditModalOpen(false);
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setModalTitle(`Edit Vehicle - ${vehicle.make} ${vehicle.model}`);
    setIsEditModalOpen(true);
    setIsAddModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedVehicle(null);
    setModalTitle('Add New Vehicle');
  };

  const handleVehicleData = (data) => {
    if (data?.make && data?.model) {
      setModalTitle(`${isEditModalOpen ? 'Edit' : 'New'} Vehicle - ${data.make} ${data.model}`);
    }
  };

  const handleRemoveVehicle = async (vin) => {
    if (window.confirm('Are you sure you want to remove this vehicle?')) {
      try {
        await fetch(`/api/vehicles/${vin}`, { method: 'DELETE' });
        await loadVehicles(); // Reload the list after deletion
      } catch (error) {
        console.error('Error removing vehicle:', error);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Container>
      <PrintStyles />
      <Header className="no-print">
        <Title>Vehicle Inventory</Title>
        <HeaderActions>
          <PrintButton onClick={handlePrint}>Print Inventory List</PrintButton>
          <AddButton onClick={handleAddVehicle}>Add Vehicle</AddButton>
        </HeaderActions>
      </Header>

      <Modal isOpen={isAddModalOpen || isEditModalOpen} onClose={handleCloseModal}>
        <ModalContent>
          <ModalTitle>{modalTitle}</ModalTitle>
          <AddVehicle 
            existingData={selectedVehicle}
            onSuccess={() => {
              handleCloseModal();
              loadVehicles(); // Reload the list after adding/editing
            }}
            onVehicleData={handleVehicleData}
          />
        </ModalContent>
      </Modal>

      {vehicles.length === 0 ? (
        <EmptyState>
          <EmptyMessage>No vehicles in inventory</EmptyMessage>
          <EmptySubMessage>Click "Add Vehicle" to add your first vehicle</EmptySubMessage>
        </EmptyState>
      ) : (
        <div className="printable-area">
          <VehicleGrid>
            {vehicles.map(vehicle => (
              <VehicleCard key={vehicle.vin} className="vehicle-card-print">
                <VehicleImage 
                  src={vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : placeholderImage} 
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} 
                />
                <VehicleInfo>
                  <VehicleName>{vehicle.year} {vehicle.make} {vehicle.model}</VehicleName>
                  <StockNumber>Stock #: {vehicle.stockNumber}</StockNumber>
                  <VehiclePrice>
                    {vehicle.pricing?.salesPrice && vehicle.pricing.salesPrice !== vehicle.pricing.price ? (
                      <>
                        <span style={{ textDecoration: 'line-through', color: '#b0b8c1', marginRight: 8 }}>
                          ${Number(vehicle.pricing.price).toLocaleString()}
                        </span>
                        <span style={{ color: '#2196F3', fontWeight: 700, fontSize: '1.15em' }}>
                          ${Number(vehicle.pricing.salesPrice).toLocaleString()}
                        </span>
                      </>
                    ) : vehicle.pricing?.price ? (
                      `$${Number(vehicle.pricing.price).toLocaleString()}`
                    ) : 'Price not set'}
                  </VehiclePrice>
                  <VehicleDetails>
                    <Detail>VIN: {vehicle.vin}</Detail>
                    <Detail>{vehicle.mileage} miles</Detail>
                    <Detail>Condition: {vehicle.condition}</Detail>
                  </VehicleDetails>
                </VehicleInfo>
                <Actions className="no-print">
                  <ActionButton onClick={() => handleEditVehicle(vehicle)}>Edit</ActionButton>
                  <ActionButton danger onClick={() => handleRemoveVehicle(vehicle.vin)}>Remove</ActionButton>
                </Actions>
              </VehicleCard>
            ))}
          </VehicleGrid>
        </div>
      )}
    </Container>
  );
};

const Container = styled.div`
  padding: 2rem;

  @media (max-width: 900px) {
    padding: 1rem;
  }

  @media (max-width: 600px) {
    padding: 0.5rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #2d3748;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    text-align: center;
  }

  @media (max-width: 600px) {
    font-size: 1.25rem;
  }
`;

const AddButton = styled.button`
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

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    font-size: 1.1rem;
  }
`;

const PrintButton = styled.button`
  background: #f0f4f8;
  color: #2d3748;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #e2e8f0;
  }

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    font-size: 1.1rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

const EmptyMessage = styled.h2`
  color: #2d3748;
  font-size: 1.5rem;
  margin-bottom: 1rem;

  @media (max-width: 600px) {
    font-size: 1.25rem;
  }
`;

const EmptySubMessage = styled.p`
  color: #718096;
`;

const VehicleGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
`;

const VehicleCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  height: 200px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    min-height: 300px;
  }

  @media (max-width: 600px) {
    min-height: 280px;
  }
`;

const VehicleImage = styled.img`
  width: 300px;
  height: 100%;
  object-fit: cover;

  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
  }

  @media (max-width: 600px) {
    height: 180px;
  }
`;

const VehicleInfo = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @media (max-width: 768px) {
    padding: 1rem;
    gap: 0.75rem;
  }
`;

const VehicleName = styled.h3`
  font-size: 1.5rem;
  color: #2d3748;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }

  @media (max-width: 600px) {
    font-size: 1.1rem;
  }
`;

const StockNumber = styled.p`
  color: #718096;
  font-size: 0.875rem;
  margin: 0.5rem 0;

  @media (max-width: 600px) {
    font-size: 0.8rem;
  }
`;

const VehiclePrice = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0.5rem 0;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }

  @media (max-width: 600px) {
    font-size: 1.1rem;
  }
`;

const VehicleDetails = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 0.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const Detail = styled.span`
  color: #4a5568;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: "•";
    color: #718096;
  }

  @media (max-width: 600px) {
    font-size: 0.8rem;
  }
`;

const Actions = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;

  @media (max-width: 768px) {
    padding: 1rem;
    flex-direction: row;
    gap: 0.75rem;
  }

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const ActionButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.danger ? '#fc8181' : '#4299e1'};
  color: white;
  min-width: 100px;

  &:hover {
    background: ${props => props.danger ? '#f56565' : '#3182ce'};
  }

  @media (max-width: 768px) {
    flex: 1;
    padding: 0.875rem 1rem;
    font-size: 0.9rem;
  }

  @media (max-width: 600px) {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
`;

const ModalContent = styled.div`
  padding: 1rem;
  height: 90%;

  @media (max-width: 768px) {
    padding: 0.75rem;
    height: 95%;
  }
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
  }
`;

const PrintStyles = createGlobalStyle`
  @media print {
    body * {
      visibility: hidden;
    }
    .printable-area, .printable-area * {
      visibility: visible;
    }
    .printable-area {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    .no-print {
      display: none !important;
    }
    .vehicle-card-print {
      page-break-inside: avoid;
      box-shadow: none;
      border: 1px solid #ccc;
    }
  }
`;

export default Inventory;