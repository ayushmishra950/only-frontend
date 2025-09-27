import React, { useState, useEffect } from "react";
import PostViewer from "./PostViewer";
import MobilePostViewer from "./MobilePostViewer";

export default function PhotoGrid({ photos, currentUser }) {
  const [showPostViewer, setShowPostViewer] = useState(false);
  const [selectedPostIndex, setSelectedPostIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Filter out posts from blocked users
  const filteredPhotos = photos?.filter(photo => {
    if (typeof photo === 'object' && photo !== null) {
      const createdBy = photo.createdBy || photo.user;
      return !(createdBy?.name === "Unknown User" || createdBy?.username === "unknown_user");
    }
    return true; // Keep URL strings
  }) || [];

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      /* console.log(...) */ void 0;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handlePostClick = (index) => {
    /* console.log(...) */ void 0;
    /* console.log(...) */ void 0;
    /* console.log(...) */ void 0;
    setSelectedPostIndex(index);
    setShowPostViewer(true);
  };

  const handleCloseViewer = () => {
    /* console.log(...) */ void 0;
    setShowPostViewer(false);
  };

  // Sanitize posts data for viewer
  const sanitizePosts = (postsArray) => {
    if (!postsArray || !Array.isArray(postsArray)) return [];
    
    return postsArray.map((item, index) => {
      if (typeof item === 'string') {
        // Handle URL strings
        return {
          id: `post-string-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          imageUrl: item,
          user: currentUser || { name: 'User', username: 'user', profileImage: null },
          createdAt: new Date().toISOString(),
          likes: [],
          comments: [],
          caption: ''
        };
      } else if (typeof item === 'object' && item !== null) {
        // Handle post objects (preserve createdBy, likes, comments)
        return {
          id: item.id || item._id || `post-object-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          imageUrl: item.imageUrl || '',
          videoUrl: item.videoUrl || '',
          user: item.user || item.createdBy || currentUser || { name: 'User', username: 'user', profileImage: null },
          createdBy: item.createdBy || null,
          createdAt: item.createdAt || new Date().toISOString(),
          likes: Array.isArray(item.likes) ? item.likes : (typeof item.likes === 'number' ? [] : []),
          comments: Array.isArray(item.comments) ? item.comments : [],
          caption: typeof item.caption === 'string' ? item.caption : ''
        };
      }
      return null;
    }).filter(Boolean);
  };

  // Safety check for photos array - after all hooks
  if (!filteredPhotos || !Array.isArray(filteredPhotos) || filteredPhotos.length === 0) {
    return <div className="text-center py-4">No photos to display</div>;
  }

  // Handle both array of URLs and array of post objects
  const isPostObjects = filteredPhotos.length > 0 && typeof filteredPhotos[0] === 'object' && filteredPhotos[0] !== null && filteredPhotos[0].imageUrl;

  // Debug logs (remove in production)
  // /* console.log(...) */ void 0;
  // /* console.log(...) */ void 0;
  // /* console.log(...) */ void 0;
  return (
    <div className="w-full flex justify-center">
      <div className="grid grid-cols-3 gap-2 xs:gap-3 sm:gap-4 w-full max-w-[28rem] md:max-w-[46rem]">
        {filteredPhotos.map((photo, idx) => (
          <div
            key={idx}
            className="group aspect-square rounded-md overflow-hidden bg-purple-50 cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 relative"
            onClick={() => handlePostClick(idx)}
          >
            {/* <img
              src={photo}
              alt="user post"
              className="w-full h-full object-cover object-center cursor-pointer group-hover:scale-110 transition-all duration-500"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                minHeight: "60px",
              }}
            /> */}

            {isPostObjects ? (
              // Handle post objects
              photo.imageUrl ? (
                <img
                  src={photo.imageUrl}
                  alt="user post"
                  className="w-full h-full object-cover object-center cursor-pointer group-hover:scale-110 transition-all duration-500"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    minHeight: "60px",
                  }}
                />
              ) : photo.videoUrl ? (
                <video
                  src={photo.videoUrl}
                  controls
                  className="w-full h-full object-cover object-center cursor-pointer group-hover:scale-110 transition-all duration-500"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    minHeight: "60px",
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-500 text-xs">No media</span>
                </div>
              )
            ) : (
              // Handle simple URL strings
              <img
                src={photo}
                alt="user post"
                className="w-full h-full object-cover object-center cursor-pointer group-hover:scale-110 transition-all duration-500"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  minHeight: "60px",
                }}
              />
            )}


            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
              <div className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Post Viewer Modal */}
      {showPostViewer && (
        isMobile ? (
          <MobilePostViewer
            posts={sanitizePosts(filteredPhotos)}
            initialIndex={selectedPostIndex}
            onClose={handleCloseViewer}
            currentUser={currentUser}
          />
        ) : (
          <PostViewer
            posts={sanitizePosts(filteredPhotos)}
            initialIndex={selectedPostIndex}
            onClose={handleCloseViewer}
            currentUser={currentUser}
          />
        )
      )}
    </div>
  );
}
