import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { REPLY_TO_STORY } from '../../graphql/mutations';
import InstagramActionPopup from '../notifications/InstagramActionPopup';
import { VIEW_STORY } from '../../graphql/mutations';
import { FaChevronLeft, FaChevronRight, FaTimes, FaHeart, FaPaperPlane } from 'react-icons/fa';
import { BsThreeDots } from 'react-icons/bs';
import './StoryViewer.css';

const StoryViewer = ({ stories, currentStoryIndex, onClose, onNext, onPrevious, onStorySeen, isLatestStoryFirst, currentUser, onDeleteStory, allUsersWithStories, currentUserIndex, usersData, meData }) => {
  const [currentIndex, setCurrentIndex] = useState(currentStoryIndex || 0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showReplySuccess, setShowReplySuccess] = useState(false);
  
  // User navigation states
  const [currentUserIdx, setCurrentUserIdx] = useState(currentUserIndex || 0);
  const [currentUserStories, setCurrentUserStories] = useState(stories);
  
  const progressRef = useRef(null);
  const viewedStoriesRef = useRef(new Set());
  const [viewStory] = useMutation(VIEW_STORY);
  const storyDuration = 5000; // 5 seconds per story

  const currentStory = currentUserStories[currentIndex];

  // Pause auto-progress when reply input is open
  useEffect(() => {
    if (showReplyInput) {
      setIsPaused(true);
    } else {
      setIsPaused(false);
    }
  }, [showReplyInput]);

  // Function to get latest user data from MongoDB ONLY - FIXED PROPS STRUCTURE
  const getLatestUserData = (story) => {
    if (!story || !story.userId) return null;
    
    /* console.log(...) */ void 0;
    /* console.log(...) */ void 0;
    /* console.log(...) */ void 0;
    /* console.log(...) */ void 0;
    
    // SCHEMA BASED: Use actual resolver data structure
    const myUserData = meData || currentUser;
    const myUserId = myUserData?.id;
    
    console.log('🔍 SCHEMA - myUserData fields:', {
      id: myUserData?.id,
      name: myUserData?.name,
      username: myUserData?.username,
      profileImage: myUserData?.profileImage
    });
    
    
    if (story.userId === myUserId) {
      // This is YOUR story - get YOUR data from MongoDB ONLY
      
      // SCHEMA BASED USERNAME PRIORITY - Exact resolver data
      let displayName = 'You'; // Default fallback
      
      console.log('🔍 SCHEMA - Available fields for MY story:', {
        username: myUserData?.username,
        name: myUserData?.name,
        usernameValid: !!(myUserData?.username && myUserData.username.trim() && myUserData.username !== 'Unknown User'),
        nameValid: !!(myUserData?.name && myUserData.name.trim() && myUserData.name !== 'Unknown User')
      });
      
      // 1. FIRST PRIORITY: username field from schema
      if (myUserData?.username && myUserData.username.trim() && myUserData.username !== 'Unknown User') {
        displayName = myUserData.username;
        /* console.log(...) */ void 0;
      }
      // 2. SECOND PRIORITY: name field from schema
      else if (myUserData?.name && myUserData.name.trim() && myUserData.name !== 'Unknown User') {
        displayName = myUserData.name;
      }
      else {
        /* console.log(...) */ void 0;
      }
      
      const result = {
        id: myUserData?.id,
        name: displayName,
        profileImage: myUserData?.profileImage || `https://ui-avatars.com/api/?name=${displayName}&background=random`
      };
      return result;
    } else {
      // This is SOMEONE ELSE's story - find their MongoDB data ONLY
      const mongoUserData = usersData?.find(u => u.id === story.userId);
      /* console.log(...) */ void 0;
      
      if (mongoUserData) {
        console.log('🔍 SCHEMA - Available fields for OTHER story:', {
          username: mongoUserData?.username,
          name: mongoUserData?.name,
          profileImage: mongoUserData?.profileImage,
          usernameValid: !!(mongoUserData?.username && mongoUserData.username.trim()),
          nameValid: !!(mongoUserData?.name && mongoUserData.name.trim())
        });
        
        // SCHEMA BASED: Use username first, then name
        let displayName = 'User';
        if (mongoUserData.username && mongoUserData.username.trim()) {
          displayName = mongoUserData.username;
          /* console.log(...) */ void 0;
        } else if (mongoUserData.name && mongoUserData.name.trim()) {
          displayName = mongoUserData.name;
          /* console.log(...) */ void 0;
        }
        
        const result = {
          id: mongoUserData.id,
          name: displayName,
          profileImage: mongoUserData.profileImage || `https://ui-avatars.com/api/?name=${displayName}&background=random`
        };
        return result;
      }
      
      // NO FALLBACK TO STORY DATA - Return minimal data if MongoDB data not found
      /* console.log(...) */ void 0;
      return {
        id: story.userId,
        name: 'User',
        profileImage: `https://ui-avatars.com/api/?name=User&background=random`
      };
    }
  };

  // Re-calculate user data when data loads or story changes
  const [userDataCache, setUserDataCache] = useState(null);
  
  useEffect(() => {
    const freshUserData = getLatestUserData(currentStory);
    setUserDataCache(freshUserData);
    /* console.log(...) */ void 0;
  }, [currentStory, meData, currentUser, usersData, currentIndex]);
  
  const currentUserData = userDataCache || getLatestUserData(currentStory);

  // Update stories when user changes
  useEffect(() => {
    if (allUsersWithStories && allUsersWithStories[currentUserIdx]) {
      setCurrentUserStories(allUsersWithStories[currentUserIdx].stories);
      setCurrentIndex(0); // Reset to first story of new user
      setProgress(0);
      /* console.log(...) */ void 0;
    }
  }, [currentUserIdx, allUsersWithStories]);

  // Initialize with current user data
  useEffect(() => {
    setCurrentUserIdx(currentUserIndex || 0);
    setCurrentUserStories(stories);
  }, [currentUserIndex, stories]);

  // Touch/Swipe handling for user navigation
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      // Swipe left - next user
      handleNextUser();
    }
    if (isRightSwipe) {
      // Swipe right - previous user  
      handlePreviousUser();
    }
  };
  

  // Wait for data to load after refresh - PERMANENT FIX
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  useEffect(() => {
    // Check if essential data is loaded
    if ((meData || currentUser) && usersData) {
      setIsDataLoaded(true);
      /* console.log(...) */ void 0;
      /* console.log(...) */ void 0;
    } else {
      /* console.log(...) */ void 0;
    }
  }, [meData, currentUser, usersData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.story-dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Auto progress timer
  useEffect(() => {
    if (!isPaused && currentUserStories.length > 0) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + (100 / (storyDuration / 100));
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [currentIndex, isPaused, currentUserStories.length]);

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  // Mark story as viewed when it becomes current
  useEffect(() => {
    const viewerId = meData?.id || currentUser?.id;
    if (!currentStory || !viewerId) return;
    if (currentStory.userId === viewerId || currentStory.user?.id === viewerId) return; // don't count self-views
    if (viewedStoriesRef.current.has(currentStory.id)) return; // avoid duplicate calls
    viewedStoriesRef.current.add(currentStory.id);
    viewStory({ variables: { userId: viewerId, statusId: currentStory.id } }).catch(err => {
      console.error('viewStory failed', err);
      viewedStoriesRef.current.delete(currentStory.id); // allow retry
    });
  }, [currentStory, meData?.id, currentUser?.id, viewStory]);

  // User navigation functions
  const handleNextUser = () => {
    if (allUsersWithStories && currentUserIdx < allUsersWithStories.length - 1) {
      setCurrentUserIdx(prev => prev + 1);
      /* console.log(...) */ void 0;
    } else {
      // Close viewer when no more users
      /* console.log(...) */ void 0;
      onClose && onClose();
    }
  };

  const handlePreviousUser = () => {
    if (currentUserIdx > 0) {
      const newUserIdx = currentUserIdx - 1;
      setCurrentUserIdx(newUserIdx);
      
      // Set to last story of previous user
      if (allUsersWithStories && allUsersWithStories[newUserIdx]) {
        const previousUserStories = allUsersWithStories[newUserIdx].stories;
        setCurrentIndex(previousUserStories.length - 1);
        setProgress(0);
        /* console.log(...) */ void 0;
      }
    }
  };

  const handleNext = () => {
    // Notify parent that current story was seen
    if (onStorySeen && currentStory) {
      onStorySeen(currentStory, currentIndex);
    }
    
    // If this is the latest story (first story when isLatestStoryFirst is true) and it's seen, close viewer
    if (isLatestStoryFirst && currentIndex === currentUserStories.length - 1) {
      /* console.log(...) */ void 0;
      onClose && onClose();
      return;
    }
    
    if (currentIndex < currentUserStories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      // When all stories of current user are seen, move to next user
      handleNextUser();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    } else {
      // If at first story of current user, go to previous user's last story
      handlePreviousUser();
    }
  };

  const handleStoryClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    
    if (clickX < width / 2) {
      handlePrevious();
    } else {
      handleNext();
    }
  };

  const [replyToStoryMutation, { loading: replyLoading }] = useMutation(REPLY_TO_STORY);

  const handleReply = async () => {
    if (!replyText.trim() || !currentStory) return;
    try {
      await replyToStoryMutation({
        variables: {
          storyId: currentStory.id,
          userId: (meData?.id || currentUser?.id),
          message: replyText.trim(),
        },
      });

      setShowReplySuccess(true);
      setReplyText('');
      setShowReplyInput(false);
    } catch (e) {
      console.error('Failed to reply to story', e);
    }
  };

  const handleDeleteStory = () => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      if (onDeleteStory && currentStory) {
        onDeleteStory(currentStory.id, currentIndex);
      }
      setShowDropdown(false);
    }
  };

  // Check if current user is the story owner
  const isStoryOwner = currentUser && currentStory && (
    currentUser.id === currentStory.userId || 
    currentUser.id === currentStory.user?.id
  );

  const formatTime = (timestamp) => {
    try {
      const now = new Date();
      const storyTime = new Date(timestamp);
      const diffInMinutes = Math.floor((now - storyTime) / (1000 * 60));
      
      if (diffInMinutes < 1) {
        return 'now';
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}m`;
      } else {
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
          return `${diffInHours}h`;
        } else {
          const diffInDays = Math.floor(diffInHours / 24);
          return `${diffInDays}d`;
        }
      }
    } catch (error) {
      return 'now';
    }
  };

  if (!currentStory) return null;

  return (
    <div className="story-viewer-overlay">
      <div className="story-viewer-container">
        <InstagramActionPopup
          type="comment"
          message="You replied to this story"
          isVisible={showReplySuccess}
          onClose={() => setShowReplySuccess(false)}
          duration={2000}
        />
        {/* Progress bars */}
        <div className="story-progress-container">
          {currentUserStories.map((_, index) => (
            <div key={index} className="story-progress-bar">
              <div 
                className="story-progress-fill"
                style={{
                  width: index < currentIndex ? '100%' : 
                         index === currentIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="story-header">
          <div className="story-user-info">
            <img 
              src={currentUserData?.profileImage || `https://ui-avatars.com/api/?name=${currentUserData?.name || 'User'}&background=random`}
              alt={currentUserData?.name || 'User'}
              className="story-user-avatar"
            />
            <div className="story-user-details">
              <span className="story-username">
                {(() => {
                  // MONGODB DATA ONLY - Same as Navbar/Profile approach
                  /* console.log(...) */ void 0;
                  /* console.log(...) */ void 0;
                  
                  // Use the processed MongoDB data (same as navbar/profile)
                  const displayName = currentUserData?.name || 'User';
                  
                  /* console.log(...) */ void 0;
                  return displayName;
                })()}
              </span>
              <span className="story-time">{formatTime(currentStory.createdAt)}</span>
            </div>
            {/* User indicator */}
            {allUsersWithStories && allUsersWithStories.length > 1 && (
              <div className="story-user-indicator">
                <span className="story-user-count">
                  {currentUserIdx + 1} / {allUsersWithStories.length}
                </span>
              </div>
            )}
          </div>
          <div className="story-header-actions">
            <div className="story-dropdown-container">
              <button 
                className="story-action-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <BsThreeDots />
              </button>
              
              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="story-dropdown-menu">
                  {isStoryOwner && (
                    <button 
                      className="story-dropdown-item delete"
                      onClick={handleDeleteStory}
                    >
                      Delete Story
                    </button>
                  )}
                  {!isStoryOwner && (
                    <button 
                      className="story-dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      Report Story
                    </button>
                  )}
                </div>
              )}
            </div>
            <button className="story-action-btn" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Story Content */}
        <div 
          className="story-content"
          onClick={handleStoryClick}
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {currentStory.mediaType === 'image' ? (
            <img 
              src={currentStory.mediaUrl} 
              alt="Story"
              className="story-media"
            />
          ) : currentStory.mediaType === 'video' ? (
            <video 
              src={currentStory.mediaUrl}
              className="story-media"
              autoPlay
              muted
              loop
            />
          ) : (
            <div className="story-text-content">
              <p>{currentStory.caption}</p>
            </div>
          )}

          {/* Caption overlay */}
          {currentStory.caption && currentStory.mediaType !== 'text' && (
            <div className="story-caption-overlay">
              <p>{currentStory.caption}</p>
            </div>
          )}

          {/* Navigation arrows */}
          <button 
            className="story-nav-btn story-nav-prev"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            style={{ display: currentIndex > 0 || currentUserIdx > 0 ? 'flex' : 'none' }}
          >
            <FaChevronLeft />
          </button>
          <button 
            className="story-nav-btn story-nav-next"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            style={{ display: currentIndex < currentUserStories.length - 1 || (allUsersWithStories && currentUserIdx < allUsersWithStories.length - 1) ? 'flex' : 'none' }}
          >
            <FaChevronRight />
          </button>
        </div>

        {/* Footer Actions */}
        <div className="story-footer">
          <div className="story-actions">
            <button 
              className="story-action-btn"
              onClick={() => setShowReplyInput(!showReplyInput)}
            >
              <FaPaperPlane />
            </button>
            <button className="story-action-btn">
              <FaHeart />
            </button>
          </div>

          {/* Reply Input */}
          {showReplyInput && (
            <div className="story-reply-container">
              <input
                type="text"
                placeholder="Reply to story..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="story-reply-input"
                onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                autoFocus
              />
              <button 
                className="story-reply-send"
                onClick={handleReply}
                disabled={!replyText.trim()}
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;