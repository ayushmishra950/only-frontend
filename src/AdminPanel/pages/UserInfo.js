"use client"

import { useState, useEffect } from "react"
import {
  User,
  Star,
  UserCheck,
  UserPlus,
  Calendar,
  Layers,
  Sparkles,
  Activity,
  ArrowLeft,
  MoreVertical,
  Trash2,
  X,
  MessageCircle,
  FileText,
  Play,
} from "lucide-react"
import CountUp from "react-countup"
import { GET_ALL_POSTS, GET_USER_OWN_POSTS, GET_USER_VIDEOS, DELETE_POST_BY_ADMIN, GET_ACHIVE_STORIES_BY_USERS } from "../../graphql/mutations"
import { useQuery, useMutation } from '@apollo/client';
import ActivityRecord from "./ActivityRecord"

// Local image assets
import profileImg from "../assets/john-doe-profile.png"
import reel1 from "../assets/majestic-castle-reel.png"
import reel2 from "../assets/video-thumbnail.png"
import reel3 from "../assets/landscape-video.png"
import post1 from "../assets/mountain-post.png"
import post2 from "../assets/video-thumbnail.png"
import post3 from "../assets/tranquil-forest-path.png"
import story1 from "../assets/landscape-story.png"
import story2 from "../assets/tranquil-forest-path.png"
import story3 from "../assets/sunset-comment.png"

// Dummy data for the profile
const profileData = {
  name: "Jane Doe",
  username: "janedoe",
  stats: {
    followers: 1234,
    following: 567,
    totalLikes: 25890,
  },
  joinedDate: "October 20, 2022",
  profileImageUrl: profileImg,
}

// Content data using local images
const contentData = {
  reels: [
    { id: "reel-1", url: reel1, likes: 432 },
    { id: "reel-2", url: reel2, likes: 785 },
    { id: "reel-3", url: reel3, likes: 612 },
    { id: "reel-4", url: reel1, likes: 221 },
    { id: "reel-5", url: reel2, likes: 934 },
    { id: "reel-6", url: reel3, likes: 154 },
    { id: "reel-7", url: reel1, likes: 498 },
    { id: "reel-8", url: reel2, likes: 275 },
    { id: "reel-9", url: reel3, likes: 863 },
  ],
  posts: [
    { id: "post-1", url: post1, likes: 120 },
    { id: "post-2", url: post2, likes: 356 },
    { id: "post-3", url: post3, likes: 220 },
    { id: "post-4", url: post1, likes: 540 },
    { id: "post-5", url: post2, likes: 420 },
    { id: "post-6", url: post3, likes: 178 },
    { id: "post-7", url: post1, likes: 332 },
    { id: "post-8", url: post2, likes: 286 },
    { id: "post-9", url: post3, likes: 451 },
  ],
  stories: [
    { id: "story-1", url: story1, views: 1200 },
    { id: "story-2", url: story2, views: 980 },
    { id: "story-3", url: story3, views: 1450 },
    { id: "story-4", url: story1, views: 610 },
    { id: "story-5", url: story2, views: 840 },
    { id: "story-6", url: story3, views: 1320 },
  ],
}

// Reusable component for displaying a stat card
const StatCard = ({ title, value, start, icon: Icon }) => (
  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center flex flex-col items-center justify-center min-w-0">
    <Icon size={24} className="text-gray-500 mb-2" />
    <span className="text-sm font-medium text-gray-500">{title}</span>
    <span className="text-2xl font-bold text-gray-900 mt-1">
      <CountUp
        start={start}
        end={value}
        duration={1.5}
        separator=","
        useEasing={true}
      />
    </span>
  </div>
)

// Reusable component for content grids
const ContentGrid = ({ items, type }) => {
  console.log(items, type)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const [previewItem, setPreviewItem] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const [DeletePostByAdmin] = useMutation(DELETE_POST_BY_ADMIN);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-dropdown-root="true"]')) {
        setOpenMenuId(null)
      }
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpenMenuId(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  /* console.log(...) */ void 0;
  if (items.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        No {type} content found.
      </div>
    )
  }

  const isReel = type === "reels"
  const isStory = type === "stories"



  const handleDelete = async (itemId) => {
    try {
      const result = await DeletePostByAdmin({
        variables: { id: itemId, type: type }
      });

      alert(result?.data?.DeletePostByAdmin);
      setOpenMenuId(null);
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };
  
  const handlePreview = (item) => {
    setPreviewItem(item);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewItem(null);
  };


  const renderPreviewModal = () => {
    if (!isPreviewOpen || !previewItem) return null;

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
        onClick={closePreview}
      >
        <div 
          className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 overflow-hidden" 
          onClick={(e) => e.stopPropagation()}
          style={{ maxHeight: '90vh' }}
        >
          {/* Post Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                {type === "posts" && <FileText className="w-5 h-5 text-[#B65FCF]" />}
                {type === "reels" && <Play className="w-5 h-5 text-[#B65FCF]" />}
                {type === "stories" && <Layers className="w-5 h-5 text-[#B65FCF]" />}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
              </div>
            </div>
            <button 
              onClick={closePreview}
              className="text-gray-500 hover:bg-gray-100 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Post Content */}
          <div className="relative">
            {previewItem?.videoUrl ? (
              <div className="w-full aspect-square bg-black">
                <video
                  src={previewItem.videoUrl}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  playsInline
                />
              </div>
            ) : previewItem?.imageUrl ? (
              <div className="w-full aspect-square bg-gray-50">
                <img
                  src={previewItem.imageUrl}
                  alt={type}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : previewItem?.mediaUrl ? (
              /\.(mp4|webm|ogg)$/i.test(previewItem.mediaUrl) ? (
                <div className="w-full aspect-square bg-black">
                  <video
                    src={previewItem.mediaUrl}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    playsInline
                  />
                </div>
              ) : (
                <div className="w-full aspect-square bg-gray-50">
                  <img
                    src={previewItem.mediaUrl}
                    alt={type}
                    className="w-full h-full object-contain"
                  />
                </div>
              )
            ) : (
              <div className="w-full aspect-square bg-gray-50 flex items-center justify-center">
                {type === "posts" && <FileText className="w-16 h-16 text-gray-300" />}
                {type === "reels" && <Play className="w-16 h-16 text-gray-300" />}
                {type === "stories" && <Layers className="w-16 h-16 text-gray-300" />}
              </div>
            )}
          </div>
          
          {/* Post Actions */}
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 text-gray-600">
                  <MessageCircle className="w-5 h-5" />
                </button>
                <button className="flex items-center gap-1 text-gray-600">
                  <Play className="w-5 h-5" />
                </button>
              </div>
              <button className="text-gray-600">
                <FileText className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`grid gap-4 ${isStory ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-3"
        }`}
    >
      {renderPreviewModal()}
      {items.map((item) => (
        <div
          key={item.id}
          className="relative group overflow-hidden rounded-lg shadow-sm cursor-pointer border border-gray-200"
          onClick={() => handlePreview(item)}
        >
          {/* Three-dot menu */}
          <div data-dropdown-root="true" className="absolute top-2 right-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                setMenuPos({ top: rect.bottom + 8, left: rect.right - 120 });
                setOpenMenuId(openMenuId === item.id ? null : item.id);
              }}
              className="p-1.5 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label="More options"
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                setMenuPos({ top: rect.bottom + 8, left: rect.right - 120 });
                setOpenMenuId(openMenuId === item.id ? null : item.id);
              }}
            >
              <MoreVertical size={16} />
            </button>
            {openMenuId === item.id && (
              <div className="fixed w-30 bg-white border border-gray-200 rounded-md shadow-lg z-50" style={{ top: menuPos.top, left: menuPos.left }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                  title="Delete item"
                  type="button"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )}
          </div>



          {item?.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={`${type} thumbnail`}
              className={`w-full h-full object-cover ${isReel || isStory ? "aspect-[9/16]" : "aspect-[1/1]"
                }`}
            />
          ) : item?.videoUrl ? (
            <video
              src={item.videoUrl}
              alt={`${type} thumbnail`}
              className={`w-full h-full object-cover ${isReel || isStory ? "aspect-[9/16]" : "aspect-[1/1]"
                }`}
              controls
            />
          ) : item?.mediaUrl ? (
            /\.(mp4|webm|ogg)$/i.test(item.mediaUrl) ? (
              <video
                src={item.mediaUrl}
                alt={`${type} thumbnail`}
                className={`w-full h-full object-cover ${isReel || isStory ? "aspect-[9/16]" : "aspect-[1/1]"
                  }`}
                controls
              />
            ) : (
              <img
                src={item.mediaUrl}
                alt={`${type} thumbnail`}
                className={`w-full h-full object-cover ${isReel || isStory ? "aspect-[9/16]" : "aspect-[1/1]"
                  }`}
              />
            )
          ) : null}

        </div>
      ))}
    </div>
  )
}

export default function UserProfileDashboard({ selectedUser, onBackToUsers }) {
  const [activeTab, setActiveTab] = useState("posts");
  const { data: postData, loading: usersLoading, error: usersError } = useQuery(GET_USER_OWN_POSTS, { variables: { userId: selectedUser?.id } });
  const { data: videoData, loading: videoLoading, error: videoError } = useQuery(GET_USER_VIDEOS, { variables: { userId: selectedUser?.id } });
  const { data: storyData, loading: storyLoading, error: storyError } = useQuery(GET_ACHIVE_STORIES_BY_USERS, { variables: { userId: selectedUser?.id } });

  // Prepare real posts data - transform backend data to match expected structure
  const realPosts = (postData?.getUserOwnPosts || []).map(post => ({
    id: post.id,
    url: post.imageUrl || post.videoUrl, // Use imageUrl first, then videoUrl as fallback
    imageUrl: post.imageUrl, // Keep original imageUrl
    videoUrl: post.videoUrl, // Keep original videoUrl
    likes: Array.isArray(post.likes) ? post.likes.length : (post.likesCount || 0)
  }));

  const realStory = (storyData?.getStoriesbyUser || []).map(story => ({
    id: story.id,
    mediaUrl: story.mediaUrl,
    mediaType: story.mediaType,
    caption: story.caption,
    createdAt: story.createdAt
  }))
  // Prepare real reels data - transform backend video data to match expected structure
  const realReels = (videoData?.getUserVideos || []).map(video => ({
    id: video.id,
    url: video.videoUrl, // Use videoUrl for reels
    videoUrl: video.videoUrl, // Keep original videoUrl
    likes: Array.isArray(video.likes) ? video.likes.length : (video.likesCount || 0)
  }));

  return (
    <div className="flex-1 bg-gray-50 lg:ml-0 min-w-0">
      <div className="mx-auto min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Profile Section */}
        <section className="bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-gray-200 m-4 sm:m-6 lg:m-8 max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-8">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-md flex-shrink-0">
                {selectedUser?.profileImage ? (
                  <img
                    src={selectedUser.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // If image fails to load, show first letter instead
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <span className="text-2xl sm:text-4xl font-bold text-white">
                      {selectedUser?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                {selectedUser?.profileImage && (
                  <div
                    className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center"
                    style={{ display: 'none' }}
                  >
                    <span className="text-2xl sm:text-4xl font-bold text-white">
                      {selectedUser?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => onBackToUsers && onBackToUsers()}
                className="mt-3 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Users</span>
              </button>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedUser?.name || 'Unknown User'}
                </h2>
                <span className="text-lg text-gray-500">
                  {selectedUser?.username || '@unknown'}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-2 justify-center sm:justify-start">
                <Calendar size={14} className="mr-1" />
                Joined {profileData.joinedDate}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <StatCard
              title="Followers"
              value={selectedUser?.followers?.length}
              start={1000}
              icon={UserCheck}
            />
            <StatCard
              title="Following"
              value={selectedUser?.following?.length}
              start={500}
              icon={UserPlus}
            />
            <StatCard
              title="Posts"
              value={realPosts?.length || 0}
              start={25000}
              icon={Star}
            />
          </div>
        </section>

        {/* Tabs and Content */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("posts")}
                className={`py-3 px-6 text-sm font-medium transition-colors border-b-2 ${activeTab === "posts"
                    ? "text-gray-900 border-purple-500"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                  }`}
              >
                Posts
              </button>
              <button
                onClick={() => setActiveTab("reels")}
                className={`py-3 px-6 text-sm font-medium transition-colors border-b-2 ${activeTab === "reels"
                    ? "text-gray-900 border-purple-500"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                  }`}
              >
                Reels
              </button>
              <button
                onClick={() => setActiveTab("stories")}
                className={`py-3 px-6 text-sm font-medium transition-colors border-b-2 ${activeTab === "stories"
                    ? "text-gray-900 border-purple-500"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                  }`}
              >
                Stories
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`py-3 px-6 text-sm font-medium transition-colors border-b-2 ${activeTab === "activity"
                    ? "text-gray-900 border-purple-500"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                  }`}
              >
                Activity Record
              </button>
            </div>
            <div className="p-4 sm:p-6">
              {activeTab === "reels" && (
                videoLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B65FCF]"></div>
                    <span className="ml-2 text-gray-500">Loading reels...</span>
                  </div>
                ) : videoError ? (
                  <div className="text-center text-red-500 py-10">
                    Error loading reels: {videoError.message}
                  </div>
                ) : (
                  <ContentGrid items={realReels} type="reels" />
                )
              )}
              {activeTab === "posts" && (
                usersLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B65FCF]"></div>
                    <span className="ml-2 text-gray-500">Loading posts...</span>
                  </div>
                ) : usersError ? (
                  <div className="text-center text-red-500 py-10">
                    Error loading posts: {usersError.message}
                  </div>
                ) : (
                  <ContentGrid items={realPosts} type="posts" />
                )
              )}
              {activeTab === "stories" && (
                storyLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B65FCF]"></div>
                    <span className="ml-2 text-gray-500">Loading stories...</span>
                  </div>
                ) : storyError ? (
                  <div className="text-center text-red-500 py-10">
                    Error loading stories: {storyError.message}
                  </div>
                ) : (
                  <ContentGrid items={realStory} type="stories" />
                )
              )}
              {activeTab === "activity" && (
                <ActivityRecord selectedUser={selectedUser} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
