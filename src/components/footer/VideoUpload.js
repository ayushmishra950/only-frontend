import React, { useState, useRef, useEffect } from "react";
import { FaTimes, FaVolumeUp, FaVolumeMute, FaPhotoVideo, FaPlayCircle } from "react-icons/fa";
import { useMutation, useQuery } from "@apollo/client";
import { UPLOAD_VIDEO, CREATE_POST, GET_ALL_VIDEOS, GET_ALL_POSTS, GET_ALL_CATEGORIES } from "../../graphql/mutations";
import { GetTokenFromCookie } from '../getToken/GetToken';

const VideoUpload = ({ show, onClose, onSuccess }) => {
  // State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setVideo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("general");
  const [isPublic, setIsPublic] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [coverTime, setCoverTime] = useState(0);
  const [coverImage, setCoverImage] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [isPaused, setIsPaused] = useState(true);
  
  // Refs
  const videoRef = useRef();
  const hiddenVideoRef = useRef();
  const coverInputRef = useRef();
  const isCancelled = useRef(false);
  const debounceRef = useRef();
  
  // Authentication and API
  const user = GetTokenFromCookie();
  const { data: categoriesData } = useQuery(GET_ALL_CATEGORIES);
  const [uploadVideo] = useMutation(UPLOAD_VIDEO, {
    refetchQueries: [
      { query: GET_ALL_VIDEOS },
      { query: GET_ALL_POSTS, variables: { userId: user?.id } }
    ],
  });
  
  const [createPost] = useMutation(CREATE_POST, {
    refetchQueries: [
      { query: GET_ALL_POSTS, variables: { userId: user?.id } }
    ],
  });

  // Handle video file selection
  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('video/')) {
      alert('❌ Only video files are allowed');
      return;
    }
    
    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';
    
    videoElement.onloadedmetadata = () => {
      URL.revokeObjectURL(videoElement.src);
      const duration = videoElement.duration;
      setVideo(file);
      setVideoDuration(duration);
      setCoverTime(0);
      setCoverImage(null);
    };
    
    videoElement.onerror = () => {
      alert('❌ Failed to load video metadata. Please try another file.');
      setVideo(null);
    };
    
    videoElement.src = URL.createObjectURL(file);
  };

  // Generate cover image from video at selected time
  useEffect(() => {
    if (!video || coverTime == null) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(() => {
      const videoURL = URL.createObjectURL(video);
      const videoEl = document.createElement('video');
      videoEl.src = videoURL;
      videoEl.currentTime = coverTime;
      videoEl.crossOrigin = "anonymous";
      videoEl.muted = true;
      
      videoEl.onloadeddata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoEl.videoWidth;
        canvas.height = videoEl.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          const thumbnailFile = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' });
          setThumbnail(thumbnailFile);
          setCoverImage(canvas.toDataURL('image/jpeg'));
        }, 'image/jpeg', 0.8);
        
        URL.revokeObjectURL(videoURL);
      };
      
      videoEl.onerror = () => {
        setCoverImage(null);
        setThumbnail(null);
        URL.revokeObjectURL(videoURL);
      };
    }, 150);
    
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [video, coverTime]);

  // Handle slider change
  const handleSlider = (e) => {
    setCoverTime(Number(e.target.value));
  };

  // Handle sound toggle
  const handleSoundToggle = () => {
    setSoundOn(prev => !prev);
  };

  // Handle video play/pause
  const handleVideoPreviewClick = () => {
    if (videoRef.current) {
      if (!videoRef.current.paused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  // Track play/pause state
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    
    const onPlay = () => setIsPaused(false);
    const onPause = () => setIsPaused(true);
    
    vid.addEventListener('play', onPlay);
    vid.addEventListener('pause', onPause);
    setIsPaused(vid.paused);
    
    return () => {
      vid.removeEventListener('play', onPlay);
      vid.removeEventListener('pause', onPause);
    };
  }, [video]);

  // Handle cover image selection
  const handleCoverImageButton = () => {
    if (coverInputRef.current) coverInputRef.current.click();
  };
  
  const handleCoverFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onload = (ev) => setCoverImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!user?.id || !title || !video) return;
    
    setIsUploading(true);
    isCancelled.current = false;
    
    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      if (videoDuration <= 60) {
        await uploadVideo({
          variables: {
            title,
            description,
            video,
            thumbnail,
            tags: tagsArray,
            category,
            isPublic
          },
        });
      } else {
        await createPost({
          variables: {
            id: user.id,
            caption: `${title}\n${description}`,
            video: video,
            thumbnail: thumbnail
          },
        });
      }
      
      if (isCancelled.current) return;
      
      // Reset form
      setIsUploading(false);
      setTitle("");
      setDescription("");
      setVideo(null);
      setThumbnail(null);
      setTags("");
      setCoverImage(null);
      
      // Trigger event to refresh posts in main feed
      console.log('🎬 Video uploaded successfully, triggering postUploaded event');
      window.dispatchEvent(new Event("postUploaded"));
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
      
    } catch (err) {
      setIsUploading(false);
      console.error("Video upload error:", err);
      if (!isCancelled.current) alert("Upload failed ❌");
    }
  };

  // Cancel upload handler
  const handleCancelUpload = () => {
    isCancelled.current = true;
    setIsUploading(false);
    setVideo(null);
    setThumbnail(null);
    setCoverImage(null);
    setTitle("");
    setDescription("");
    setTags("");
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end p-4 pr-12 pt-16">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex">
        {/* Left Side - Video Preview */}
        <div className="w-2/3 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Create New Reel</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          
          {!video ? (
            <div 
              className="relative w-full max-w-[280px] mx-auto aspect-[9/16] flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors mt-4"
              onClick={() => document.getElementById('video-upload').click()}
            >
              <FaPhotoVideo className="w-16 h-16 text-gray-400 mb-4" />
              <span className="text-lg font-medium text-gray-600 mb-2">Select Video</span>
              <p className="text-sm text-gray-500">or drag and drop</p>
              <input
                id="video-upload"
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleVideoFileChange}
              />
            </div>
          ) : (
            <div className="relative w-full max-w-[280px] mx-auto aspect-[9/16] bg-black rounded-lg overflow-hidden mt-4">
              <video
                ref={videoRef}
                src={URL.createObjectURL(video)}
                className="w-full h-full object-cover"
                muted={!soundOn}
                loop
                onClick={handleVideoPreviewClick}
              />
              {isPaused && (
                <div 
                  className="absolute inset-0 flex items-center justify-center cursor-pointer"
                  onClick={handleVideoPreviewClick}
                >
                  <div className="bg-black bg-opacity-40 rounded-full p-4">
                    <FaPlayCircle className="text-white text-4xl" />
                  </div>
                </div>
              )}
              <button
                className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white p-2 rounded-full"
                onClick={handleSoundToggle}
                type="button"
              >
                {soundOn ? (
                  <FaVolumeUp className="text-xl" />
                ) : (
                  <FaVolumeMute className="text-xl" />
                )}
              </button>
            </div>
          )}
        </div>
        
        {/* Right Side - Options */}
        <div className="w-1/3 p-6 overflow-y-auto bg-gray-50">
          <div className="space-y-6">
            {/* Video Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                placeholder="Add a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="general">Select category</option>
                {(categoriesData?.getAllCategories || []).map((cat) => (
                  <option key={cat.id} value={cat.name.toLowerCase()}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Privacy Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Public</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            {/* Upload Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isUploading || !title || !video}
              className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Upload Reel'}
            </button>
            
            {/* Cancel Button */}
            <button
              type="button"
              onClick={handleCancelUpload}
              className="w-full mt-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoUpload;
