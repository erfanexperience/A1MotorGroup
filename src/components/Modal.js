import React, { useEffect } from 'react';
import styled from 'styled-components';

const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      // Dispatch modal open event
      window.dispatchEvent(new CustomEvent('modal-open'));
    } else {
      // Dispatch modal close event
      window.dispatchEvent(new CustomEvent('modal-close'));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <Overlay onClick={onClose} data-modal-overlay />
      <ModalContainer>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        {children}
      </ModalContainer>
    </>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
`;

const ModalContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  z-index: 1001;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  @media (max-width: 900px) {
    width: 95%;
    max-width: 95vw;
    padding: 1.5rem;
    max-height: 95vh;
  }

  @media (max-width: 600px) {
    width: 98%;
    padding: 1rem;
    border-radius: 8px;
    max-height: 98vh;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #4a5568;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: #e2e8f0;
  }

  @media (max-width: 600px) {
    top: 0.75rem;
    right: 0.75rem;
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.75rem;
  }
`;

export default Modal; 