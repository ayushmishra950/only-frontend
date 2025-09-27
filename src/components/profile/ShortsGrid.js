import React, { useState, useEffect } from "react";
import { formatDuration } from "../../utils/formatters";
import PostViewer from "./PostViewer";
import MobilePostViewer from "./MobilePostViewer";

export default function ShortsGrid({ shortsVideos, currentUser }) {
  const [showPostViewer, setShowPostViewer] = useState(false);
  const [selectedPostIndex, setSelectedPostIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  console.log('🎬 ShortsGrid received videos:', shortsVideos);

  // Filter out videos from blocked users
  const filteredVideos = shortsVideos?.filter(video => {
    if (typeof video === 'object' && video !== null) {
      const createdBy = video.createdBy || video.user;
      return !(createdBy?.name === "Unknown User" || createdBy?.username === "unknown_user");
    }
    return true; // Keep URL strings
  }) || [];

  console.log('🎬 Filtered videos for display:', filteredVideos);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Listen for video upload events to trigger re-render
  useEffect(() => {
    const handleVideoUploaded = () => {
      console.log('🎬 Video uploaded event received in ShortsGrid');
      // Force component re-render by updating a dummy state
      setSelectedPostIndex(prev => prev);
    };
    
    window.addEventListener('postUploaded', handleVideoUploaded);
    return () => window.removeEventListener('postUploaded', handleVideoUploaded);
  }, []);

  const handlePostClick = (index) => {
    setSelectedPostIndex(index);
    setShowPostViewer(true);
  };

  const handleCloseViewer = () => {
    setShowPostViewer(false);
  };

  // Sanitize videos data for viewer
  const sanitizeVideos = (videosArray) => {
    if (!videosArray || !Array.isArray(videosArray)) return [];
    
    return videosArray.map((item, index) => {
      if (typeof item === 'string') {
        // Handle URL strings
        return {
          id: `video-${index}`,
          videoUrl: item,
          user: currentUser || { name: 'Unknown User', profileImage: null },
          createdAt: new Date().toISOString(),
          likes: 0,
          caption: ''
        };
      } else if (typeof item === 'object' && item !== null) {
        // Handle video objects
        return {
          id: item.id || `video-${index}`,
          imageUrl: item.imageUrl || '',
          videoUrl: item.videoUrl || '',
          user: item.user || currentUser || { name: 'Unknown User', profileImage: null },
          createdAt: item.createdAt || new Date().toISOString(),
          likes: typeof item.likes === 'number' ? item.likes : (Array.isArray(item.likes) ? item.likes.length : 0),
          caption: typeof item.caption === 'string' ? item.caption : ''
        };
      }
      return null;
    }).filter(Boolean);
  };

  // Safety check for videos array - after all hooks
  if (!filteredVideos || !Array.isArray(filteredVideos) || filteredVideos.length === 0) {
    console.log('🎬 No videos to display - filteredVideos:', filteredVideos);
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 text-sm">No videos uploaded yet</div>
        <div className="text-gray-400 text-xs mt-1">Upload your first reel to see it here</div>
      </div>
    );
  }

  // Handle video objects properly
  const isVideoObjects = filteredVideos.length > 0 && typeof filteredVideos[0] === 'object' && filteredVideos[0] !== null;

  return (
    <div className="w-full flex justify-center">
      <div className="grid grid-cols-3 gap-2 xs:gap-3 sm:gap-4 w-full max-w-[26rem]">
        {filteredVideos.map((video, idx) => {
          console.log(`🎬 Rendering video ${idx}:`, video);
          console.log(`🖼️ Thumbnail URL:`, video.thumbnailUrl);
          return (
            <div 
              key={video.id || idx} 
              className="aspect-square rounded-xl overflow-hidden bg-purple-50 cursor-pointer relative group"
              onClick={() => handlePostClick(idx)}
            >
              {video.videoUrl ? (
                <>
                  <video 
                    src={video.videoUrl} 
                    poster={video.thumbnailUrl || video.videoUrl + "#t=0.1"} 
                    className="w-full h-full object-cover object-center cursor-pointer" 
                    style={{maxWidth:'100%',maxHeight:'100%', minHeight: '60px'}}
                    preload="metadata"
                    muted
                    playsInline
                    onError={(e) => console.error('Video load error:', e)}
                    onLoadStart={() => console.log('Video loading started for:', video.videoUrl)}
                    onLoadedMetadata={() => console.log('Video metadata loaded')}
                  />
                  {/* Fallback thumbnail if video poster doesn't work */}
                  {!video.thumbnailUrl && (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white opacity-80" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No Video</span>
                </div>
              )}
              
              {/* Play Icon and Duration */}
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span className="text-white text-[8px] xs:text-[10px] sm:text-xs font-medium">
                  {video.duration ? formatDuration(video.duration) : '0:00'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Post Viewer Modal */}
      {showPostViewer && (
        isMobile ? (
          <MobilePostViewer
            posts={sanitizeVideos(filteredVideos)}
            initialIndex={selectedPostIndex}
            onClose={handleCloseViewer}
            currentUser={currentUser}
          />
        ) : (
          <PostViewer
            posts={sanitizeVideos(filteredVideos)}
            initialIndex={selectedPostIndex}
            onClose={handleCloseViewer}
            currentUser={currentUser}
          />
        )
      )}
    </div>
  );
}
