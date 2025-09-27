
import React, { useEffect, useState, useRef, use } from "react";
import { FaHome, FaPlus, FaHeart, FaCommentDots, FaTimes } from "react-icons/fa";
import { MdVideoLibrary } from "react-icons/md";
import { BsCameraFill } from "react-icons/bs";
import { FaTowerBroadcast } from "react-icons/fa6";
import { MdOutlineVideoLibrary } from "react-icons/md";
import { Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { GetTokenFromCookie } from '../getToken/GetToken';
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_POST, GET_ALL_POSTS, GET_UNREAD_NOTIFICATIONS_COUNT } from "../../graphql/mutations";
import { useChat } from '../../context/ChatContext';
import { useNotifications } from '../../context/NotificationContext';
import VideoUpload from "./VideoUpload";
import { useRealTimeNotifications } from '../../hooks/useRealTimeNotifications';
import HeartIconPopup from '../notifications/HeartIconPopup';
import { requestNotificationPermission, playNotificationSound } from '../../utils/notificationSound';

const FloatingMenu = ({ isOpen, toggleMenu, setShowUploadForm, setShowVideoUploadForm }) => {
  const menuItems = [
    { icon: <MdOutlineVideoLibrary className="text-lg md:text-xl" />, label: "Reels Post", angle: -60 },
    { icon: <BsCameraFill className="text-lg md:text-xl" />, label: "Photo Post", angle: 0 },
    { icon: <FaTowerBroadcast className="text-lg md:text-xl" />, label: "Go Live", angle: 60 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute bottom-24 md:bottom-28 left-1/2 -translate-x-1/2">
          <div className="relative">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.label}
                initial={{ scale: 0, y: 0, x: 0 }}
                animate={{
                  scale: 1,
                  y: Math.cos((item.angle * Math.PI) / 180) * -50,
                  x: Math.sin((item.angle * Math.PI) / 180) * 50,
                }}
                exit={{
                  scale: 0,
                  y: 0,
                  x: 0,
                  transition: {
                    duration: 0.15,
                    ease: "easeInOut",
                    delay: index * 0.01,
                  },
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeInOut",
                }}
                onClick={() => {
                  if (item.label === "Photo Post") {
                    setShowUploadForm(true);
                  } else if (item.label === "Reels Post") {
                    setShowVideoUploadForm(true);
                  }
                  toggleMenu();
                }}
                className="absolute left-1/2 -translate-x-1/2 bg-white/30 backdrop-blur-md text-black w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg hover:scale-110 hover:bg-purple-600 hover:text-white transition-all duration-200 flex items-center justify-center border border-white/20"
              >
                {item.icon}
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Success popup for post upload
const SuccessPopup = ({ show }) => (
  <div
    className={`fixed top-20 left-0 w-full flex justify-center z-[9999] transition-all duration-500 ${show
        ? 'opacity-100 scale-100 translate-y-0'
        : 'opacity-0 scale-90 -translate-y-8 pointer-events-none'
      }`}
    style={{ pointerEvents: show ? 'auto' : 'none' }}
  >
    <div className="flex items-center gap-3 px-6 py-3 border-2 border-purple-500 text-black rounded-xl shadow-lg bg-white">
      <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <span className="font-semibold text-lg">Post Uploaded Successfully!</span>
    </div>
  </div>
);

const FooterNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isChatPage = location.pathname === "/chat";
  const isHomePage = location.pathname === "/";
  const isReelsPage = location.pathname === "/reels";
  const isNotificationsPage = location.pathname === "/notifications";
  const { selectedChat } = useChat();

  // Safe context usage
  let unreadCount = 0;
  let refreshUnreadCount = () => { };
  let markAsRead = () => { };
  let newNotifications = [];
  let removeNotification = () => { };
  try {
    const notificationContext = useNotifications();
    unreadCount = notificationContext.unreadCount || 0;
    refreshUnreadCount = notificationContext.refreshUnreadCount || (() => { });
    markAsRead = notificationContext.markAsRead || (() => { });
    newNotifications = notificationContext.newNotifications || [];
    removeNotification = notificationContext.removeNotification || (() => { });
  } catch (error) {
    console.error('Notification context error in FooterNav:', error);
    unreadCount = 0;
    refreshUnreadCount = () => { };
    markAsRead = () => { };
    newNotifications = [];
    removeNotification = () => { };
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showVideoUploadForm, setShowVideoUploadForm] = useState(false);
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = useState();
  const [showSuccess, setShowSuccess] = useState(false);
  const heartButtonRef = useRef(null);
  const [mobileNotificationPopup, setMobileNotificationPopup] = useState(null);



  // Initialize real-time notifications
  const { popupNotifications } = useRealTimeNotifications();

  // Hide FooterNav on mobile/tablet if on chat page and a chat is open
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  useEffect(() => {
    const checkScreen = () => {
      setIsMobileOrTablet(window.innerWidth <= 1024);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // Show notification popup for new notifications
  useEffect(() => {
    if (popupNotifications.length > 0) {
      const latestNotification = popupNotifications[popupNotifications.length - 1];
      setMobileNotificationPopup(latestNotification);
    }
  }, [popupNotifications]);

  useEffect(() => {
    const decodedUser = GetTokenFromCookie();
    setUser(decodedUser);

    // Initialize audio on component mount (with user interaction)
    const initAudio = () => {
      requestNotificationPermission();
      // Remove listener after first interaction
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };

    // Add listeners for user interaction to initialize audio
    document.addEventListener('click', initAudio);
    document.addEventListener('touchstart', initAudio);



    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
  }, []);

  // Refresh unread count when on notifications page
  useEffect(() => {
    if (isNotificationsPage) {
      const interval = setInterval(() => {
        refreshUnreadCount();
      }, 2000); // Refresh every 2 seconds when on notifications page

      return () => clearInterval(interval);
    }
  }, [isNotificationsPage, refreshUnreadCount]);



  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const [createPost] = useMutation(CREATE_POST, {
    refetchQueries: [{ query: GET_ALL_POSTS }],
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type.startsWith('image/')) {
      setImage(file);
      setVideo(null);
    } else if (file.type.startsWith('video/')) {
      setVideo(file);
      setImage(null);
    } else {
      alert('Only image or video files are allowed');
    }
  };

  // Separate handler for video upload modal
  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type.startsWith('video/')) {
      setVideo(file);
    } else {
      alert('Only video files are allowed');
      setVideo(null);
    }
  };


  const getLocationName = async (lat, lng) => {
  const apiKey = "2bf06013c4314aeeab73c663d290eb8b";
  const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`);
  const data = await response.json();
  const locationName = data?.results?.[0]?.formatted;
  return locationName;
};


  const handlePostSubmit = async (e) => {
  e.preventDefault();

  if (!user?.id || (!image && !video)) {
    alert("Missing data!");
    return;
  }

  setIsUploading(true);

  try {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log("✅ Coordinates obtained:", { latitude, longitude });

        // Step 1: Get location name
        const locationName = await getLocationName(latitude, longitude);

        // Step 2: Create the post
        await createPost({
          variables: {
            id: user.id,
            caption,
            image,
            video,
            locationName: locationName || null,
            location: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
          },
        });

        setIsUploading(false);
        setShowUploadForm(false);
        setShowVideoUploadForm(false);
        setCaption("");
        setImage(null);
        setVideo(null);

        // Dispatch event to refresh posts without page reload
        window.dispatchEvent(new Event("postUploaded"));

        setTimeout(() => {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
        }, 100);
      },

      // 🔴 Error callback (location access failed)
      (error) => {
        console.error("Location error:", error);
        setIsUploading(false);
        alert("Location access denied. Cannot create post with location.");
      }
    );
  } catch (err) {
    console.error("Post creation failed:", err);
    setIsUploading(false);
    alert("Upload failed ❌");
  }
};


  if (location.pathname === '/chat') return null;

  return (
    <>
      <SuccessPopup show={showSuccess} />

      <div className="fixed bottom-4 left-0 right-0 flex justify-center items-center z-50">
        <FloatingMenu isOpen={isMenuOpen} toggleMenu={toggleMenu} setShowUploadForm={setShowUploadForm} setShowVideoUploadForm={setShowVideoUploadForm} />

        <footer className="footer-nav w-[400px] max-w-[90%] bg-white/30 backdrop-blur-md rounded-full px-8 py-4 flex justify-between items-center shadow-lg border border-white/20">
          <button
            onClick={() => navigate("/")}
            className={`${isHomePage && !isMenuOpen ? "bg-purple-600 text-white" : "bg-white/50 text-black"} backdrop-blur-sm p-3 rounded-full shadow hover:bg-purple-600 hover:text-white active:bg-purple-700 active:text-white transition-all duration-200`}
          >
            <FaHome className="text-xl" />
          </button>
          <button
            onClick={() => navigate("/reels")}
            className={`${isReelsPage ? "bg-purple-600 text-white" : "bg-white/50 text-black"} backdrop-blur-sm p-3 rounded-full shadow hover:bg-purple-600 hover:text-white active:bg-purple-700 active:text-white transition-all duration-200`}
          >
            <MdVideoLibrary className="text-xl" />
          </button>
          <motion.button
            onClick={toggleMenu}
            whileTap={{ scale: 0.9 }}
            className={`bg-white/50 backdrop-blur-sm text-black p-3 rounded-full shadow hover:bg-purple-600 active:bg-purple-700 transition-all duration-200 ${isMenuOpen ? "bg-purple-600 text-white" : ""}`}
          >
            <motion.div
              initial={false}
              animate={{ rotate: isMenuOpen ? 135 : 0 }}
              transition={{ duration: 0.01, ease: "easeInOut" }}
            >
              <FaPlus className="text-2xl" />
            </motion.div>
          </motion.button>
          <button
            ref={heartButtonRef}
            onClick={() => {
              navigate("/notifications");
              markAsRead();
              setTimeout(() => refreshUnreadCount(), 100);
            }}
            className={`${isNotificationsPage ? "bg-purple-600 text-white" : "bg-white/50 text-black"} backdrop-blur-sm p-3 rounded-full shadow hover:bg-purple-600 hover:text-white active:bg-purple-700 active:text-white transition-all duration-200 relative`}
          >
            <FaHeart className="text-xl" />
            {/* Notification Badge - Don't show on notifications page */}
            {unreadCount > 0 && !isNotificationsPage && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </button>
          <button
            onClick={() => navigate("/chat")}
            className={`${isChatPage ? "bg-purple-600 text-white" : "bg-white/50 text-black"} backdrop-blur-sm p-3 rounded-full shadow hover:bg-purple-600 hover:text-white active:bg-purple-700 active:text-white transition-all duration-200`}
          >
            <FaCommentDots className="text-xl" />
          </button>
        </footer>

        {showUploadForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-[90%] max-w-md relative border border-purple-100">
              <button
                onClick={() => setShowUploadForm(false)}
                className="absolute top-3 right-3 text-gray-700 hover:text-red-500 bg-white/60 rounded-full p-2 shadow-md transition-colors"
              >
                <FaTimes />
              </button>
              <h2 className="text-2xl font-bold mb-6 text-purple-700 text-center tracking-wide">Create Post</h2>
              <form onSubmit={handlePostSubmit} className="flex flex-col gap-5">
                <input
                  type="text"
                  placeholder="Write a Optional caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full p-3 mb-2 border-2 border-purple-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg placeholder-gray-400 shadow-sm"
                />

                <div className="mb-2">
                  {!(image || video) ? (
                    <label
                      htmlFor="file-upload"
                      className="flex items-center justify-center cursor-pointer"
                    >
                      <Upload className="w-12 h-12 text-purple-600 hover:text-purple-800 transition-colors" />
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  ) : image ? (
                    <>
                      <img
                        src={URL.createObjectURL(image)}
                        alt="Selected Preview"
                        className="w-full h-64 object-contain rounded-lg"
                      />
                      <div className="flex gap-4 mt-3 justify-center">
                        <button
                          type="button"
                          onClick={() => setImage(null)}
                          className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 text-sm shadow"
                        >
                          Remove
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center w-full h-36 border-2 border-dashed border-blue-400 rounded-2xl bg-blue-50 relative shadow-inner overflow-hidden">
                        <video
                          src={URL.createObjectURL(video)}
                          controls
                          className="w-full h-full object-cover rounded-2xl shadow"
                        />
                      </div>
                      <div className="flex gap-4 mt-3 justify-center">
                        <button
                          type="button"
                          onClick={() => setVideo(null)}
                          className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 text-sm shadow"
                        >
                          Remove
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-white text-purple-600 border-2 border-purple-600 px-6 py-3 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-200 flex items-center justify-center min-w-[120px] disabled:opacity-60 disabled:cursor-not-allowed hover:bg-purple-600 hover:text-white hover:scale-105 hover:shadow-2xl"
                  disabled={isUploading}
                >
                  {!isUploading && 'Upload'}
                  {isUploading && (
                    <span className="w-6 h-6 border-2 border-white border-t-purple-600 rounded-full animate-spin inline-block"></span>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
        {showVideoUploadForm && (
          <VideoUpload
            show={showVideoUploadForm}
            onClose={() => setShowVideoUploadForm(false)}
            onSuccess={() => {
              setShowSuccess(true);
              setTimeout(() => setShowSuccess(false), 2000);
            }}
          />
        )}

        {/* Heart Icon Popup */}
        <HeartIconPopup heartButtonRef={heartButtonRef} />
      </div>
    </>
  );
};

export default FooterNav;
