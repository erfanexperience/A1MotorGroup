import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import aboutImg from '../assests/about.webp';
import aboutImgMobile from '../assests/about-mobile.webp';
import './AboutUs.css';

const AboutUs = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 900;
  return (
    <>
      <Header />
      <div className="aboutus-outer">
        {isMobile ? (
          <div style={{ width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '84px' }}>
            <img
              src={aboutImgMobile}
              alt="About A1 Motor Group"
              style={{ width: '100vw', maxWidth: '100vw', height: 'auto', padding: '0 10px', borderRadius: '32px', marginBottom: '0.7rem' }}
            />
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#2c3e50', textAlign: 'left', width: '100%', margin: '0.6rem 1.2rem 0.7rem 1.2rem', paddingLeft: '12px' }}>
              About Us
            </h1>
            <div className="aboutus-content-card" style={{ margin: '1.2rem 0 0 0', maxWidth: '98vw', padding: '1.2rem 0.7rem' }}>
              <p className="aboutus-lead">
                For over 20 years, <b>A1 Motor Group</b> has been the trusted name in premium pre-owned vehicles in San Jose and the greater Bay Area. Our journey began with a simple vision: to create a dealership where customers feel valued, respected, and confident in their vehicle purchases. Today, that vision has evolved into a legacy of excellence, serving thousands of satisfied customers throughout Silicon Valley.
              </p>
              <p>
                Our commitment to excellence and personalized service has made us a leader in the automotive industry. We understand that each customer's needs are unique, and we take pride in helping every client find the perfect vehicle that matches both their lifestyle and budget. This dedication to personalized service has earned us not just customers, but lifelong friends who trust us with all their automotive needs.
              </p>
              <p>
                At the heart of our success is our dedication to building long-lasting relationships with our customers. We believe in transparency, integrity, and going above and beyond to ensure complete satisfaction. Our team takes the time to understand your specific requirements, preferences, and concerns, providing expert guidance throughout your car-buying journey.
              </p>
              <p>
                We understand that purchasing a vehicle is more than just a transaction – it's an important life decision that deserves expert guidance and support. That's why we maintain a carefully curated inventory of premium pre-owned vehicles, each thoroughly inspected to meet our rigorous quality standards. Our extensive network in the automotive industry allows us to source the finest vehicles, ensuring our customers have access to the best options available in the market.
              </p>
            </div>
          </div>
        ) : (
          <>
            <HeroSection
              image={aboutImg}
              title="About Us"
              subtitle="Get to know A1 Motor Group and our commitment to your satisfaction."
              height="480px"
            />
            <div className="aboutus-content-card">
              <p className="aboutus-lead">
                For over 20 years, <b>A1 Motor Group</b> has been the trusted name in premium pre-owned vehicles in San Jose and the greater Bay Area. Our journey began with a simple vision: to create a dealership where customers feel valued, respected, and confident in their vehicle purchases. Today, that vision has evolved into a legacy of excellence, serving thousands of satisfied customers throughout Silicon Valley.
              </p>
              <p>
                Our commitment to excellence and personalized service has made us a leader in the automotive industry. We understand that each customer's needs are unique, and we take pride in helping every client find the perfect vehicle that matches both their lifestyle and budget. This dedication to personalized service has earned us not just customers, but lifelong friends who trust us with all their automotive needs.
              </p>
              <p>
                At the heart of our success is our dedication to building long-lasting relationships with our customers. We believe in transparency, integrity, and going above and beyond to ensure complete satisfaction. Our team takes the time to understand your specific requirements, preferences, and concerns, providing expert guidance throughout your car-buying journey.
              </p>
              <p>
                We understand that purchasing a vehicle is more than just a transaction – it's an important life decision that deserves expert guidance and support. That's why we maintain a carefully curated inventory of premium pre-owned vehicles, each thoroughly inspected to meet our rigorous quality standards. Our extensive network in the automotive industry allows us to source the finest vehicles, ensuring our customers have access to the best options available in the market.
              </p>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AboutUs; 