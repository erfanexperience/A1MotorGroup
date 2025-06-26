import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaBars, FaTimes } from 'react-icons/fa';
import logo from '../assests/logo-main.webp';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <HeaderContainer>
      <Logo to="/home">
        <LogoImage src={logo} alt="Luxury Car Dealership" />
      </Logo>
      <NavContainer isOpen={isMenuOpen}>
        <NavLink to="/inventory">Inventory</NavLink>
        <NavLink to="/financing">Financing</NavLink>
        <NavLink to="/sell">Sell Your Car</NavLink>
        <NavLink to="/about">About Us</NavLink>
        <PhoneLink href="tel:+14086616318">(408) 661-6318</PhoneLink>
      </NavContainer>
      <MenuButton onClick={toggleMenu} isOpen={isMenuOpen}>
        <MenuIcon isOpen={isMenuOpen}>
          <span></span>
          <span></span>
          <span></span>
        </MenuIcon>
      </MenuButton>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 6rem;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  z-index: 1000;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
  height: 72px;

  @media (max-width: 900px) {
    padding: 1rem 1.2rem;
  }
`;

const Logo = styled(Link)`
  text-decoration: none;
  display: flex;
  align-items: center;
`;

const LogoImage = styled.img`
  height: 48px;
  margin-right: 1.2rem;
  transition: filter 0.2s;
  &:hover {
    filter: brightness(1.1);
  }
`;

const NavContainer = styled.nav`
  display: flex;
  gap: 3rem;
  align-items: center;

  @media (max-width: 900px) {
    position: fixed;
    top: 72px;
    left: 0;
    right: 0;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.98);
    padding: 1.5rem;
    gap: 1.2rem;
    transform: translateY(${props => props.isOpen ? '0' : '-100%'});
    opacity: ${props => props.isOpen ? '1' : '0'};
    visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
    transition: all 0.3s ease;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.03);
  }
`;

const NavLink = styled(Link)`
  color: #1a1a1a;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  padding: 0.5rem 0;
  letter-spacing: 0.02em;

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #2c3e50, #3498db);
    transition: width 0.3s ease;
  }

  &:hover {
    color: #2c3e50;
    &:after {
      width: 100%;
    }
  }

  @media (max-width: 900px) {
    font-size: 1.2rem;
    width: 100%;
    text-align: center;
  }
`;

const PhoneLink = styled.a`
  color: #1a1a1a;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 700;
  transition: all 0.3s ease;
  position: relative;
  padding: 0.5rem 0;
  letter-spacing: 0.02em;

  &:hover {
    color: #2c3e50;
    text-decoration: underline;
  }

  @media (max-width: 900px) {
    font-size: 1.2rem;
    width: 100%;
    text-align: center;
  }
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  z-index: 1001;

  @media (max-width: 900px) {
    display: block;
  }
`;

const MenuIcon = styled.div`
  width: 24px;
  height: 20px;
  position: relative;
  transform: rotate(0deg);
  transition: 0.5s ease-in-out;
  cursor: pointer;

  span {
    display: block;
    position: absolute;
    height: 2px;
    width: 100%;
    background: #2c3e50;
    border-radius: 2px;
    opacity: 1;
    left: 0;
    transform: rotate(0deg);
    transition: 0.25s ease-in-out;

    &:nth-child(1) {
      top: ${props => props.isOpen ? '9px' : '0'};
      transform: ${props => props.isOpen ? 'rotate(45deg)' : 'rotate(0)'};
    }

    &:nth-child(2) {
      top: 9px;
      opacity: ${props => props.isOpen ? '0' : '1'};
    }

    &:nth-child(3) {
      top: ${props => props.isOpen ? '9px' : '18px'};
      transform: ${props => props.isOpen ? 'rotate(-45deg)' : 'rotate(0)'};
    }
  }
`;

export default Header; 