import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const TestPage = () => {
  return (
    <>
      <Header />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1>Test Page: Header and Footer Only</h1>
      </div>
      <Footer />
    </>
  );
};

export default TestPage; 