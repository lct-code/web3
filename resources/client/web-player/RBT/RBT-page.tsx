import React, { useState, useRef, useEffect } from 'react';
import { useRBT } from './requests/use-RBT.js';
import { RBT } from './RBT.js';
import './RBT.css';

interface RBTCardProps {
  rbt: RBT;
}

const RBTCard = ({ rbt }: RBTCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Load audio metadata explicitly
    const loadMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
        setIsMetadataLoaded(true);
      }
    };

    const handleLoadedMetadata = () => {
      loadMetadata();
    };

    const handleDurationChange = () => {
      loadMetadata();
    };

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    // Force load metadata
    if (audio.readyState >= 1) {
      loadMetadata();
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', onEnded);

    // Explicitly load the audio metadata
    audio.load();

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Refactored seek function that works reliably
  const seekAudio = (clientX: number) => {
    if (!progressContainerRef.current || !audioRef.current) return;
    
    const rect = progressContainerRef.current.getBoundingClientRect();
    const containerWidth = rect.width;
    const clickX = clientX - rect.left;
    
    // Calculate percentage position (clamped between 0-100%)
    const percentage = Math.max(0, Math.min(1, clickX / containerWidth));
    
    // Calculate time to seek to
    const seekTime = percentage * duration;
    
    // Only proceed if we have a valid time
    if (isFinite(seekTime) && seekTime >= 0 && seekTime <= duration) {
      // Set the audio time
      audioRef.current.currentTime = seekTime;
      
      // Update the state
      setCurrentTime(seekTime);
      
      // Update the visual progress immediately
      progressContainerRef.current.style.setProperty('--progress-percent', `${percentage * 100}%`);
    }
  };
  
  // Mouse event handlers for seeking
  const handleProgressClick = (e: React.MouseEvent) => {
    seekAudio(e.clientX);
  };
  
  // For drag functionality
  const [isDragging, setIsDragging] = useState(false);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    seekAudio(e.clientX);
    
    // Add document listeners for dragging
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      seekAudio(e.clientX);
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  // Cleanup dragging listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="rbt-card-horizontal">
      <div className="rbt-image">
        {rbt.image ? (
          <img src={rbt.image} alt={rbt.name} />
        ) : (
          <div className="rbt-image-placeholder"></div>
        )}
      </div>
      
      <div className="rbt-content">
        <h3 className="rbt-title">{rbt.name}</h3>
        
        <div className="rbt-artists">{rbt.artists}</div>
        
        <div className="custom-audio-player">
          <button 
            className="play-pause-button" 
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/>
                <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5v14l11-7z" fill="currentColor"/>
              </svg>
            )}
          </button>
          
          <div 
            className="progress-container"
            ref={progressContainerRef}
            onClick={handleProgressClick}
            onMouseDown={handleMouseDown}
          >
            <div className="progress-fill"></div>
            <div className="progress-thumb"></div>
          </div>
          
          <span className="time-display">
            {formatTime(duration - currentTime)}
          </span>
          
          <audio 
            ref={audioRef}
            src={rbt.src} 
            className="hidden-audio"
            preload="metadata"
            playsInline
            crossOrigin="anonymous"
          />
        </div>
      </div>
    </div>
  );
};

export const RBTPage = () => {
  const query = useRBT();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination values
  const totalRBTs = query.data?.RBTs?.length || 0;
  const totalPages = Math.ceil(totalRBTs / itemsPerPage);
  
  // Get current page items
  const getCurrentPageItems = () => {
    if (!query.data?.RBTs) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return query.data.RBTs.slice(startIndex, endIndex);
  };

  // Handle page changes
  const goToPage = (page: number) => {
    // Ensure page is within bounds
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
    
    // Scroll to top of list when page changes
    window.scrollTo(0, 0);
  };

  // Navigate to next/previous pages
  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPreviousPage = () => goToPage(currentPage - 1);

  // Reset to page 1 when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query.data]);

  // For debugging
  useEffect(() => {
    if (query.data) {
      console.log('RBT data received:', query.data);
      if (query.data.RBTs && query.data.RBTs.length > 0) {
        console.log('First RBT artist data:', query.data.RBTs[0].artists);
      }
    }
  }, [query.data]);

  if (query.isLoading) {
    return <div className="loading-state">Loading...</div>;
  }

  if (query.error) {
    return <div className="error-state">Error loading RBTs</div>;
  }

  // Get items for the current page
  const currentItems = getCurrentPageItems();

  return (
    <div className="rbt-page">
      <h1 className="page-title">Ring Back Tones</h1>
      
      {/* Display current page RBTs */}
      <div className="rbt-list">
        {currentItems.map((rbt: RBT) => (
          <RBTCard key={rbt.id} rbt={rbt} />
        ))}
      </div>
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button 
            className="pagination-button"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>
          
          {/* Page number buttons */}
          <div className="pagination-numbers">
            {[...Array(totalPages)].map((_, idx) => {
              const pageNumber = idx + 1;
              // Only show a few pages around the current page for large page counts
              if (
                totalPages <= 7 || 
                pageNumber === 1 || 
                pageNumber === totalPages || 
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <button 
                    key={pageNumber}
                    className={`page-number ${pageNumber === currentPage ? 'active' : ''}`}
                    onClick={() => goToPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              } else if (
                pageNumber === currentPage - 2 || 
                pageNumber === currentPage + 2
              ) {
                // Show ellipsis for breaks in sequence
                return <span key={pageNumber} className="page-ellipsis">...</span>;
              }
              return null;
            })}
          </div>
          
          <button 
            className="pagination-button"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

