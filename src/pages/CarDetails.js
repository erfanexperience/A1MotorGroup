import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { 
  FaShareAlt, 
  FaPrint, 
  FaImages, 
  FaCarSide, 
  FaCogs, 
  FaGasPump, 
  FaIdCard, 
  FaTachometerAlt, 
  FaPalette, 
  FaCalendarAlt, 
  FaMoneyCheckAlt, 
  FaPhoneAlt, 
  FaFilePdf, 
  FaTimes, 
  FaChevronLeft, 
  FaChevronRight 
} from 'react-icons/fa';
import axios from 'axios';
import './CarDetails.css';
import BookTestDriveModal from '../components/BookTestDriveModal';
import placeholderImage from '../assests/palceholder.webp';

const CarDetails = () => {
  const { id } = useParams();
  const vin = id;
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await axios.get('/api/vehicles');
        const foundCar = response.data.find(vehicle => vehicle.vin === vin);
        if (foundCar) {
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

  const handleImageClick = (index) => {
    setSelectedImage(index);
    setShowImageModal(true);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setSelectedImage((prev) => (prev + 1) % car.images.length);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setSelectedImage((prev) => (prev - 1 + car.images.length) % car.images.length);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!car) return <div className="error">Car not found</div>;

  // Airbnb-style gallery logic
  const images = car.images || [];
  const mainImage = images[0] || { path: placeholderImage };
  const gridImages = images.slice(1, 5);
  const hasMoreImages = images.length > 5;

  return (
    <>
      <Header />
      <div className="car-details-modern-fullpage car-details-main-section-padding">
        <div className="car-details-gallery-outer-wrapper">
          <div className="car-details-image-actions">
            <button className="car-details-image-action-btn" title="Share" onClick={e => {e.stopPropagation(); if (navigator.share) {navigator.share({url: window.location.href});} else {navigator.clipboard.writeText(window.location.href); alert('Link copied!');}}}><FaShareAlt /></button>
            <button className="car-details-image-action-btn" title="Print" onClick={e => {e.stopPropagation(); window.print();}}><FaPrint /></button>
          </div>
          <div className="car-details-gallery-wrapper">
            <div className="car-details-airbnb-gallery">
              <div className="car-details-airbnb-main-image" onClick={() => handleImageClick(0)}>
                <img src={mainImage?.path || mainImage || placeholderImage} alt="Main" />
              </div>
              <div className="car-details-airbnb-grid">
                {gridImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="car-details-airbnb-grid-image"
                    onClick={() => handleImageClick(idx + 1)}
                  >
                    <img src={img.path || img} alt={`Gallery ${idx + 2}`} />
                    {hasMoreImages && idx === 3 && (
                      <div className="car-details-airbnb-more-overlay" onClick={() => handleImageClick(4)}>
                        <FaImages /> Show all photos
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Info Section Below Gallery */}
        <div className="car-details-info-below-gallery">
          <div className="car-details-title-price-row">
            <div className="car-details-title-block">
              {car.modelYear || car.year ? (
                <div className="car-details-title-year">{car.modelYear || car.year}</div>
              ) : null}
              <div className="car-details-title-row">
                {car.make && (
                  <img
                    className="car-details-make-logo"
                    src={`https://logo.clearbit.com/${car.make.toLowerCase()}.com`}
                    alt={`${car.make} logo`}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                )}
                <span className="car-details-title-make-model">{car.make} {car.model}</span>
              </div>
            </div>
            <div className="car-details-pricing-highlight">
              <div className="car-details-pricing-block">
                {car.pricing?.price && (
                  <div className="car-details-regular-price">${Number(car.pricing.price).toLocaleString()}</div>
                )}
                <div className="car-details-current-price">
                  ${car.pricing?.salesPrice
                    ? Number(car.pricing.salesPrice).toLocaleString()
                    : Number(car.pricing.price).toLocaleString()}
                </div>
                {car.pricing?.financingPerMonth && (
                  <div className="car-details-financing">Financing as low as <span>${car.pricing.financingPerMonth}</span>/mo*</div>
                )}
              </div>
            </div>
          </div>

          {/* New Car Details Grid Section */}
          <div className="car-details-specs-grid">
            <div className="car-details-specs-item">
              <span className="car-details-specs-icon"><FaCarSide /></span>
              <span className="car-details-specs-label">Condition</span>
              <span className="car-details-specs-value">{car.condition || '-'}</span>
            </div>
            <div className="car-details-specs-item">
              <span className="car-details-specs-icon"><FaCarSide /></span>
              <span className="car-details-specs-label">Body</span>
              <span className="car-details-specs-value">{car.body || car.bodyClass || '-'}</span>
            </div>
            <div className="car-details-specs-item">
              <span className="car-details-specs-icon"><FaCogs /></span>
              <span className="car-details-specs-label">Transmission</span>
              <span className="car-details-specs-value">{car.engine?.transmission || car.transmission || '-'}</span>
            </div>
            <div className="car-details-specs-item">
              <span className="car-details-specs-icon"><FaGasPump /></span>
              <span className="car-details-specs-label">Fuel type</span>
              <span className="car-details-specs-value">{car.engine?.fuelType || car.fuelType || '-'}</span>
            </div>
            <div className="car-details-specs-item">
              <span className="car-details-specs-icon"><FaIdCard /></span>
              <span className="car-details-specs-label">VIN</span>
              <span className="car-details-specs-value">{car.vin || '-'}</span>
            </div>
            <div className="car-details-specs-item">
              <span className="car-details-specs-icon"><FaCogs /></span>
              <span className="car-details-specs-label">Engine</span>
              <span className="car-details-specs-value">
                {car.engine
                  ? [
                      car.engine.type,
                      car.engine.displacement,
                      car.engine.cylinders && `${car.engine.cylinders} Cyl`,
                      car.engine.horsePower && `${car.engine.horsePower} HP`
                    ].filter(Boolean).join(' / ')
                  : (typeof car.engine === 'string' ? car.engine : '-')}
              </span>
            </div>
            <div className="car-details-specs-item">
              <span className="car-details-specs-icon"><FaCarSide /></span>
              <span className="car-details-specs-label">Drive</span>
              <span className="car-details-specs-value">{car.engine?.drive || car.driveType || car.drivetrain || '-'}</span>
            </div>
            <div className="car-details-specs-item">
              <span className="car-details-specs-icon"><FaTachometerAlt /></span>
              <span className="car-details-specs-label">Mileage</span>
              <span className="car-details-specs-value">{car.mileage ? `${car.mileage.toLocaleString()} mi` : '-'}</span>
            </div>
            <div className="car-details-specs-item">
              <span className="car-details-specs-icon"><FaPalette /></span>
              <span className="car-details-specs-label">Exterior Color</span>
              <span className="car-details-specs-value">{car.exterior?.color || car.exteriorColor || car.color || '-'}</span>
            </div>
            <div className="car-details-specs-item">
              <span className="car-details-specs-icon"><FaPalette /></span>
              <span className="car-details-specs-label">Interior Color</span>
              <span className="car-details-specs-value">{car.interior?.color || car.interiorColor || '-'}</span>
            </div>
            <div className="car-details-specs-item">
              <span className="car-details-specs-icon"><FaIdCard /></span>
              <span className="car-details-specs-label">Stock #</span>
              <span className="car-details-specs-value">{car.stockNumber || '-'}</span>
            </div>
          </div>

          <div className="car-details-action-buttons">
            <button className="car-details-btn-primary" onClick={() => setIsBookModalOpen(true)}><FaCalendarAlt /> Book Test Drive</button>
            <a className="car-details-btn-financing" href="/financing"><FaMoneyCheckAlt style={{marginRight: '0.6rem'}} /> Apply for Financing</a>
            <a className="car-details-btn-secondary" href={`tel:${car.dealerPhone || '+14086616318'}`}><FaPhoneAlt /> Contact Us</a>
          </div>
        </div>

        {/* Below: Description, Features, Certificates (three rows) */}
        <div className="car-details-below-section car-details-below-rows">
          <div className="car-details-description-block">
            <h2>Description</h2>
            <p>{car.description}</p>
          </div>
          <div className="car-details-features-block">
            <h2>Features</h2>
            <ul className="car-details-features-list">
              {car.features && car.features.length > 0 ? car.features.map((feature, idx) => (
                <li key={idx}><span className="car-details-feature-check">✓</span> {feature}</li>
              )) : <li>No features listed</li>}
            </ul>
          </div>
          <div className="car-details-certificates-block">
            <h2>Certificates</h2>
            <div className="car-details-cert-buttons">
              {car && (
                <>
                  <a
                    className="car-details-btn-secondary cert-btn"
                    href={`http://localhost:5001/api/images/${car.vin}-${car.make}-${car.model}/certificates/carfax.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFilePdf /> View Carfax Report
                  </a>
                  <a
                    className="car-details-btn-secondary cert-btn"
                    href={`http://localhost:5001/api/images/${car.vin}-${car.make}-${car.model}/certificates/autocheck.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFilePdf /> View AutoCheck Report
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Financing Disclaimer */}
        <div className="car-details-financing-disclaimer">
          <p>
            *Financing example: {car.modelYear || car.year} {car.make} {car.model} for ${car.pricing?.salesPrice ? Number(car.pricing.salesPrice).toLocaleString() : Number(car.pricing?.price || 0).toLocaleString()} at {car.pricing?.financingPerMonth ? Math.round((car.pricing.financingPerMonth * 72) / (car.pricing.salesPrice || car.pricing.price) * 10000) / 100 : 10.09}% APR for 72 months. Monthly payment of ${car.pricing?.financingPerMonth || 'N/A'}. Includes 9.375% California sales tax. Subject to approved credit. Terms and conditions apply.
          </p>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="car-details-image-modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="car-details-image-modal-content" onClick={e => e.stopPropagation()}>
            <button className="car-details-image-modal-close" onClick={() => setShowImageModal(false)}>
              <FaTimes />
            </button>
            <button className="car-details-image-modal-nav car-details-image-modal-prev" onClick={handlePrevImage}>
              <FaChevronLeft />
            </button>
            <button className="car-details-image-modal-nav car-details-image-modal-next" onClick={handleNextImage}>
              <FaChevronRight />
            </button>
            <img 
              src={images[selectedImage]?.path || images[selectedImage] || placeholderImage} 
              alt={`Gallery ${selectedImage + 1}`} 
            />
          </div>
        </div>
      )}

      {/* Book Test Drive Modal */}
      <BookTestDriveModal 
        isOpen={isBookModalOpen} 
        onClose={() => setIsBookModalOpen(false)}
        selectedCar={car}
      />
    </>
  );
}

export default CarDetails;