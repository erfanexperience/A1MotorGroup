import React from 'react';
import styled from 'styled-components';

const HeroSection = ({ image, title, subtitle, children, height }) => (
  <HeroSectionStyled bg={image} height={height}>
    <HeroOverlay />
    <HeroContent>
      {title && <HeroTitle>{title}</HeroTitle>}
      {subtitle && <HeroSubtitle>{subtitle}</HeroSubtitle>}
      {children}
    </HeroContent>
  </HeroSectionStyled>
);

const HeroSectionStyled = styled.section`
  position: relative;
  width: 100vw;
  max-width: 100vw;
  overflow-x: hidden;
  height: ${props => props.height || '420px'};
  min-height: ${props => props.height || '420px'};
  background: url(${props => props.bg}) center center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  @media (max-width: 900px) {
    height: 220px;
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
  position: relative;
  z-index: 2;
  color: #fff;
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  width: 40vw;
  min-width: 320px;
  max-width: 600px;
  margin-left: 6rem;
  padding: 0;
  @media (max-width: 900px) {
    width: 90vw;
    min-width: unset;
    max-width: unset;
    margin-left: 1rem;
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

export default HeroSection; 