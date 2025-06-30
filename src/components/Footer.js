import React from 'react';
import styled from 'styled-components';

const Footer = () => (
  <FooterContainer>
    <FooterContent>
      <FooterLogoNav>
        <FooterLogo src={require('../assests/logo-main.webp')} alt="A1 Motor Group" />
        <FooterNav>
          <FooterNavLink href="/inventory">Inventory</FooterNavLink>
          <FooterNavLink href="/about">About Us</FooterNavLink>
          <FooterNavLink href="/sell">Sell Your Car</FooterNavLink>
          <FooterNavLink href="/contact">Contact</FooterNavLink>
        </FooterNav>
      </FooterLogoNav>
      <FooterInfo>
        <FooterInfoItem>
          <FooterInfoLabel>Phone:</FooterInfoLabel>
          <FooterInfoValue><a href="tel:+14089825456">(408) 982-5456</a></FooterInfoValue>
        </FooterInfoItem>
        <FooterInfoItem>
          <FooterInfoLabel>Address:</FooterInfoLabel>
          <FooterInfoValue>345 Saratoga Ave, San Jose, CA 95129</FooterInfoValue>
        </FooterInfoItem>
        <FooterInfoItem>
          <FooterInfoLabel>Hours:</FooterInfoLabel>
          <FooterInfoValue>Mon - Saturday 10AM - 5PM</FooterInfoValue>
        </FooterInfoItem>
      </FooterInfo>
    </FooterContent>
    <FooterCopyright>
      &copy; {new Date().getFullYear()} A1 Motor Group. All rights reserved.
    </FooterCopyright>
  </FooterContainer>
);

const FooterContainer = styled.footer`
  width: 100vw;
  background: #F5F5F5;
  color: #222;
  padding: 1.2rem 0 1.2rem 0;
  margin-top: 0;
`;

const FooterContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  padding: 0 2rem;
  @media (max-width: 900px) {
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }
`;

const FooterLogoNav = styled.div`
  display: flex;
  align-items: center;
  gap: 2.5rem;
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 1.2rem;
  }
`;

const FooterLogo = styled.img`
  height: 54px;
  width: auto;
  border-radius: 0;
  background: none;
  padding: 0;
`;

const FooterNav = styled.nav`
  display: flex;
  gap: 2rem;
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.7rem;
    align-items: center;
  }
`;

const FooterNavLink = styled.a`
  color: #222;
  text-decoration: none;
  font-size: 1.08rem;
  font-weight: 500;
  transition: color 0.2s;
  &:hover {
    color: #3498db;
  }
`;

const FooterInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  @media (max-width: 900px) {
    align-items: center;
    text-align: center;
  }
`;

const FooterInfoItem = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const FooterInfoLabel = styled.span`
  font-weight: 600;
  color: #222;
`;

const FooterInfoValue = styled.span`
  color: #222;
  a {
    color: #222;
    text-decoration: none;
    transition: color 0.2s;
    &:hover {
      color: #3498db;
    }
  }
`;

const FooterCopyright = styled.div`
  text-align: center;
  color: #888;
  font-size: 0.98rem;
  margin-top: 0.5rem;
`;

export default Footer; 