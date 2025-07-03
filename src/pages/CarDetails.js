import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';
import './CarDetails.css';
import placeholderImage from '../assests/palceholder.webp';
import ImageGallery from '../components/ImageGallery';

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

  return (
    <>
      <Header />
      <div className="car-details-modern-fullpage car-details-main-section-padding">
        <ImageGallery images={car.images || []} />
      </div>
      <Footer />
    </>
  );
};

export default CarDetails;