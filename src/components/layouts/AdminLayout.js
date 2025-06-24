import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import adminLogo from '../../assests/logo-admin-page.png';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const AdminLayout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, username, logout } = useAdminAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Listen for modal open/close events
  useEffect(() => {
    const handleModalOpen = () => setIsModalOpen(true);
    const handleModalClose = () => setIsModalOpen(false);

    // Listen for custom events from modals
    window.addEventListener('modal-open', handleModalOpen);
    window.addEventListener('modal-close', handleModalClose);

    // Also check for modal elements in DOM
    const checkForModals = () => {
      const modalOverlay = document.querySelector('[data-modal-overlay]');
      setIsModalOpen(!!modalOverlay);
    };

    // Check periodically for modal state
    const interval = setInterval(checkForModals, 100);

    return () => {
      window.removeEventListener('modal-open', handleModalOpen);
      window.removeEventListener('modal-close', handleModalClose);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <LayoutContainer>
      <MobileHeader>
        <MobileMenuButton onClick={toggleSidebar}>
          <MenuIcon isOpen={isSidebarOpen}>
            <span></span>
            <span></span>
            <span></span>
          </MenuIcon>
        </MobileMenuButton>
        <MobileLogo src={adminLogo} alt="A1 Motor Group" />
        <MobileUserInfo>
          <MobileUserName>{username}</MobileUserName>
        </MobileUserInfo>
      </MobileHeader>

      <Sidebar isOpen={isSidebarOpen} isModalOpen={isModalOpen}>
        <LogoContainer>
          <Logo src={adminLogo} alt="A1 Motor Group" />
        </LogoContainer>
        <NavList>
          <NavItem 
            onClick={() => {
              navigate('/admin/inventory');
              closeSidebar();
            }} 
            className={window.location.pathname.includes('/admin/inventory') ? 'active' : ''}
          >
            Inventory
          </NavItem>
        </NavList>
        <UserSection>
          <UserInfo>
            <UserName>{username}</UserName>
            <UserRole>Dealership Admin</UserRole>
          </UserInfo>
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </UserSection>
      </Sidebar>
      
      <SidebarOverlay isOpen={isSidebarOpen} onClick={closeSidebar} />
      
      <MainContent isModalOpen={isModalOpen}>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
};

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  position: relative;
`;

const MobileHeader = styled.header`
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 70px;

  @media (max-width: 900px) {
    display: flex;
  }
`;

const MobileMenuButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  z-index: 1001;
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

const MobileLogo = styled.img`
  height: 40px;
  width: auto;
`;

const MobileUserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const MobileUserName = styled.div`
  font-weight: 500;
  color: #2d3748;
  font-size: 0.875rem;
`;

const Sidebar = styled.div`
  width: 280px;
  background: white;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1001;
  transform: translateX(${props => {
    if (props.isModalOpen) return '-100%';
    return props.isOpen ? '0' : '-100%';
  }});
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  @media (min-width: 901px) {
    position: relative;
    transform: translateX(${props => props.isModalOpen ? '-100%' : '0'});
  }

  @media (max-width: 900px) {
    width: 280px;
    padding: 1.5rem;
  }
`;

const SidebarOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease-in-out;

  @media (min-width: 901px) {
    display: none;
  }
`;

const LogoContainer = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  @media (max-width: 900px) {
    margin-bottom: 1.5rem;
  }
`;

const Logo = styled.img`
  max-width: 150px;
  height: auto;

  @media (max-width: 900px) {
    max-width: 120px;
  }
`;

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`;

const NavItem = styled.button`
  background: transparent;
  border: none;
  padding: 1rem;
  text-align: left;
  font-size: 1rem;
  color: #4a5568;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: #f7fafc;
    color: #2b6cb0;
  }

  &.active {
    background: #ebf8ff;
    color: #2b6cb0;
    font-weight: 500;
  }

  @media (max-width: 900px) {
    padding: 1.2rem 1rem;
    font-size: 1.1rem;
  }
`;

const UserSection = styled.div`
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
  margin-top: auto;
`;

const UserInfo = styled.div`
  margin-bottom: 1rem;
`;

const UserName = styled.div`
  font-weight: 500;
  color: #2d3748;
`;

const UserRole = styled.div`
  font-size: 0.875rem;
  color: #718096;
`;

const LogoutButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #4a5568;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #edf2f7;
    color: #2d3748;
  }
`;

const MainContent = styled.main`
  flex: 1;
  background: #f7fafc;
  padding: 2rem;
  overflow-y: auto;
  transition: margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 900px) {
    padding: 1rem;
    margin-top: 70px;
  }

  @media (max-width: 600px) {
    padding: 0.75rem;
  }
`;

export default AdminLayout; 