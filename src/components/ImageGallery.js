import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';
import placeholderImage from '../assests/palceholder.webp';

const GalleryWrapper = styled.div`
  display: flex;
  gap: 1.2rem;
  margin-bottom: 2.5rem;
  align-items: stretch;
  height: 420px;
  min-height: 320px;
  @media (max-width: 900px) {
    flex-direction: column;
    height: auto;
    min-height: unset;
  }
`;
const MainImage = styled.div`
  flex: 1.2 1 0;
  height: 100%;
  border-radius: 18px;
  overflow: hidden;
  background: #e9ecef;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 100%;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 18px;
  }
  @media (max-width: 900px) {
    aspect-ratio: 16/10;
    min-height: 120px;
    max-height: 180px;
    height: auto;
  }
`;
const Grid = styled.div`
  flex: 1 1 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 0.7rem;
  align-items: stretch;
  height: 100%;
  @media (max-width: 900px) {
    height: auto;
    gap: 0.3rem;
  }
`;
const GridImage = styled.div`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: #e9ecef;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  height: 100%;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 16px;
  }
  @media (max-width: 900px) {
    aspect-ratio: 16/10;
    min-height: 60px;
    max-height: 100px;
    height: auto;
  }
`;
const MoreOverlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(44,65,84,0.65);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  border-radius: 16px;
  transition: background 0.2s;
`;
const ShowAllButton = styled.button`
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(255,255,255,0.95);
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  color: #222;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(44,62,80,0.10);
  z-index: 3;
`;
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.92);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const ModalContent = styled.div`
  position: relative;
  width: 90vw;
  max-width: 900px;
  height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const ModalImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.25);
`;
const ModalClose = styled.button`
  position: absolute;
  top: 18px;
  right: 18px;
  background: rgba(255,255,255,0.85);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.5rem;
  color: #222;
  cursor: pointer;
  z-index: 2;
`;
const ModalNav = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.85);
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  font-size: 2rem;
  color: #222;
  cursor: pointer;
  z-index: 2;
  left: ${props => props.left ? '18px' : 'unset'};
  right: ${props => props.right ? '18px' : 'unset'};
`;
const MobileSlider = styled.div`
  width: 100%;
  position: relative;
  aspect-ratio: 16/10;
  border-radius: 18px;
  overflow: hidden;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 18px;
  }
`;
const MobileNav = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.85);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1.3rem;
  color: #222;
  cursor: pointer;
  z-index: 2;
  left: ${props => props.left ? '10px' : 'unset'};
  right: ${props => props.right ? '10px' : 'unset'};
`;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return isMobile;
}

const ImageGallery = ({ images = [] }) => {
  const isMobile = useIsMobile();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);
  const imgList = images.length ? images : [placeholderImage];
  const mainImage = imgList[0];
  const gridImages = imgList.slice(1, 5);
  const hasMoreImages = imgList.length > 5;

  // Modal navigation
  const openModal = idx => {
    setModalIndex(idx);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);
  const prevModal = useCallback(() => setModalIndex(idx => (idx - 1 + imgList.length) % imgList.length), [imgList.length]);
  const nextModal = useCallback(() => setModalIndex(idx => (idx + 1) % imgList.length), [imgList.length]);

  // Keyboard navigation for modal
  useEffect(() => {
    if (!modalOpen) return;
    const handler = e => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') prevModal();
      if (e.key === 'ArrowRight') nextModal();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modalOpen, prevModal, nextModal]);

  // Mobile slider navigation
  const prevMobile = () => setMobileIndex(idx => (idx - 1 + imgList.length) % imgList.length);
  const nextMobile = () => setMobileIndex(idx => (idx + 1) % imgList.length);

  // Touch/swipe for mobile
  const touchStartX = useRef(null);
  const handleTouchStart = e => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = e => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx > 40) prevMobile();
    if (dx < -40) nextMobile();
    touchStartX.current = null;
  };

  // Render
  if (isMobile) {
    return (
      <MobileSlider
        onClick={() => openModal(mobileIndex)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img src={typeof imgList[mobileIndex] === 'string' ? imgList[mobileIndex] : imgList[mobileIndex]?.path || placeholderImage} alt={`Photo ${mobileIndex + 1}`} />
        {imgList.length > 1 && <MobileNav left onClick={e => { e.stopPropagation(); prevMobile(); }}>&#8592;</MobileNav>}
        {imgList.length > 1 && <MobileNav right onClick={e => { e.stopPropagation(); nextMobile(); }}>&#8594;</MobileNav>}
        {modalOpen && (
          <ModalOverlay onClick={closeModal}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <ModalClose onClick={closeModal}>&times;</ModalClose>
              {modalIndex > 0 && <ModalNav left onClick={prevModal}>&#8592;</ModalNav>}
              {modalIndex < imgList.length - 1 && <ModalNav right onClick={nextModal}>&#8594;</ModalNav>}
              <ModalImage src={typeof imgList[modalIndex] === 'string' ? imgList[modalIndex] : imgList[modalIndex]?.path || placeholderImage} alt={`Photo ${modalIndex + 1}`} />
            </ModalContent>
          </ModalOverlay>
        )}
      </MobileSlider>
    );
  }

  // Desktop
  return (
    <GalleryWrapper>
      <MainImage onClick={() => openModal(0)}>
        <img src={typeof mainImage === 'string' ? mainImage : mainImage?.path || placeholderImage} alt="Main" />
        <ShowAllButton onClick={e => { e.stopPropagation(); openModal(0); }}>Show all photos</ShowAllButton>
      </MainImage>
      <Grid>
        {gridImages.map((img, idx) => (
          <GridImage key={typeof img === 'string' ? img : img?.path || idx} onClick={() => openModal(idx + 1)}>
            <img src={typeof img === 'string' ? img : img?.path || placeholderImage} alt={`Gallery ${idx + 2}`} />
            {hasMoreImages && idx === 3 && (
              <MoreOverlay onClick={e => { e.stopPropagation(); openModal(4); }}>
                Show all photos
              </MoreOverlay>
            )}
          </GridImage>
        ))}
      </Grid>
      {modalOpen && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalClose onClick={closeModal}>&times;</ModalClose>
            {imgList.length > 1 && <ModalNav left onClick={prevModal}>&#8592;</ModalNav>}
            {imgList.length > 1 && <ModalNav right onClick={nextModal}>&#8594;</ModalNav>}
            <ModalImage src={typeof imgList[modalIndex] === 'string' ? imgList[modalIndex] : imgList[modalIndex]?.path || placeholderImage} alt={`Photo ${modalIndex + 1}`} />
          </ModalContent>
        </ModalOverlay>
      )}
    </GalleryWrapper>
  );
};

export default ImageGallery; 