import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaTachometerAlt, FaCogs, FaGasPump, FaPalette, FaCarSide, FaIdCard, FaEnvelope, FaChevronLeft, FaChevronRight, FaTimes, FaPhone, FaCalendarAlt, FaFilePdf, FaImages, FaShareAlt, FaPrint, FaPhoneAlt, FaMoneyCheckAlt } from 'react-icons/fa';
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
                    href={`http://localhost:5001/api/images/${car.vin}-${car.make}-${car.model}/certificates/window-sticker.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFilePdf /> View Window Sticker
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Modal for full-size image */}
        {showImageModal && (
          <div className="car-details-image-modal" onClick={() => setShowImageModal(false)}>
            <button className="car-details-close-modal" onClick={() => setShowImageModal(false)}>
              <FaTimes />
            </button>
            <img
              src={car.images[selectedImage]?.path || car.images[selectedImage]}
              alt={`Modal image: ${car.make} ${car.model}`}
              className="car-details-modal-image"
            />
            {car.images.length > 1 && (
              <div className="car-details-modal-navigation">
                <button onClick={handlePrevImage} className="car-details-modal-nav-button">
                  <FaChevronLeft />
                </button>
                <button onClick={handleNextImage} className="car-details-modal-nav-button">
                  <FaChevronRight />
                </button>
              </div>
            )}
          </div>
        )}
        {/* Financing Disclaimer */}
        {(() => {
          const now = new Date();
          const currentYear = now.getFullYear();
          const modelYear = Number(car.modelYear || car.year) || currentYear;
          const modelAge = Math.max(0, currentYear - modelYear);
          const price = Number(car.pricing?.salesPrice || car.pricing?.price) || 0;
          const tax = price * 0.09375;
          return (
            <div style={{ fontSize: '0.68rem', color: '#888', textAlign: 'center', margin: '2.5rem 0 0.5rem 0', maxWidth: 700, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
              *Estimated payments are for informational purposes only. They do not account for financing pre-qualifications, and they may or may not account for acquisition fees, destination charges, tax, title, and other fees and incentives or represent a financing offer or guarantee of credit from the seller. Monthly estimate based on a 10.09% APR for 72 months, {modelAge}-year vehicle model age, ${price.toLocaleString()} vehicle price, $0 down payment, $0 trade-in, and ${tax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} sales tax.
            </div>
          );
        })()}
        <BookTestDriveModal
          isOpen={isBookModalOpen}
          onClose={() => setIsBookModalOpen(false)}
          cars={[car]}
          preselectedCarVin={car.vin}
          onSubmit={() => setIsBookModalOpen(false)}
        />
      </div>
      <Footer />
    </>
  );
};

export default CarDetails;