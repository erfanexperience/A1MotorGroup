import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';
import './CarDetails.css';
import placeholderImage from '../assests/palceholder.webp';

const CarDetails = () => {
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
              financingPerMonth: foundCar.financing_per_month // if exists
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

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!car) return <div className="error">Car not found</div>;

  const images = car.images || [];
  const mainImage = images[0] || { path: placeholderImage };
  const gridImages = images.slice(1, 5);
  const hasMoreImages = images.length > 5;

  return (
    <>
      <Header />
      <div className="car-details-modern-fullpage car-details-main-section-padding">
        <div className="car-details-gallery-outer-wrapper">
          <div className="car-details-gallery-wrapper">
            <div className="car-details-airbnb-gallery">
              <div className="car-details-airbnb-main-image">
                <img src={mainImage?.path || mainImage || placeholderImage} alt="Main" />
              </div>
              <div className="car-details-airbnb-grid">
                {gridImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="car-details-airbnb-grid-image"
                  >
                    <img src={img.path || img} alt={`Gallery ${idx + 2}`} />
                    {hasMoreImages && idx === 3 && (
                      <div className="car-details-airbnb-more-overlay">
                        Show all photos
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CarDetails;