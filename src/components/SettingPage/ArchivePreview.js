import React, { useState, useEffect } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ArchivePreview = ({ posts, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isVideo, setIsVideo] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const currentPost = posts[currentIndex];
  const mediaUrl = currentPost?.imageUrl || currentPost?.mediaUrl || '';
  const isVideoFile = mediaUrl?.toLowerCase().match(/\.(mp4|webm|mov|avi)$/) || currentPost?.mediaType === 'video';

  useEffect(() => {
    setIsVideo(isVideoFile);
    setIsVideoLoaded(false);
  }, [currentIndex, isVideoFile]);

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : posts.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < posts.length - 1 ? prev + 1 : 0));
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex]);

  // Handle swipe for mobile
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const diff = touchStart - touchEnd;
    const swipeThreshold = 50;
    
    if (diff > swipeThreshold) {
      handleNext();
    } else if (diff < -swipeThreshold) {
      handlePrevious();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (!currentPost) return null;

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.closeButton} onClick={onClose}>
        <FaTimes size={24} color="#fff" />
      </div>
      
      <div style={styles.container}>
        <button 
          style={{ ...styles.navButton, left: '20px' }} 
          onClick={(e) => {
            e.stopPropagation();
            handlePrevious();
          }}
        >
          <FaChevronLeft size={24} color="#fff" />
        </button>
        
        <div 
          style={styles.mediaContainer}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {isVideo ? (
            <div style={styles.videoWrapper}>
              <video
                src={mediaUrl}
                style={styles.media}
                autoPlay
                loop
                muted
                controls={false}
                onLoadedData={() => setIsVideoLoaded(true)}
              />
              {!isVideoLoaded && <div style={styles.loading}>Loading...</div>}
            </div>
          ) : (
            <img 
              src={mediaUrl} 
              alt="Archived content"
              style={styles.media}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/500?text=No+Preview+Available';
              }}
            />
          )}
        </div>
        
        <button 
          style={{ ...styles.navButton, right: '20px' }} 
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
        >
          <FaChevronRight size={24} color="#fff" />
        </button>
      </div>
      
      <div style={styles.counter}>
        {currentIndex + 1} / {posts.length}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    cursor: 'pointer',
  },
  container: {
    position: 'relative',
    width: '90%',
    maxWidth: '1200px',
    height: '90%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  media: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  loading: {
    position: 'absolute',
    color: '#fff',
    fontSize: '16px',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(0, 0, 0, 0.5)',
    border: 'none',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    zIndex: 10,
    outline: 'none',
  },
  closeButton: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: 'rgba(0, 0, 0, 0.5)',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    zIndex: 10,
  },
  counter: {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    color: '#fff',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: '5px 15px',
    borderRadius: '20px',
    fontSize: '14px',
  },
};

export default ArchivePreview;
