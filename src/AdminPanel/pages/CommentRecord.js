"use client"
import { Play, Video, FileText, MessageCircle, ChevronRight, User, X } from "lucide-react"
import { useState, useEffect } from "react"
import Skeleton from "./Skeleton"
import ReelsCommentRecord from "./ReelsCommentRecord"
import VideosCommentRecord from "./VideosCommentRecord"
import PostsCommentRecord from "./PostsCommentRecord"
import ReplyCommentRecord from "./ReplyCommentRecord"
import { useQuery } from "@apollo/client"
import { GET_USER_COMMENTED_REELS, GET_USER_COMMENTED_VIDEOS, GET_USER_COMMENTED_POSTS } from "../../graphql/mutations"

// Renamed component to CommentRecord
const CommentRecord = ({ onBack,selectedUser }) => {
  const [imageLoadingStates, setImageLoadingStates] = useState({})
  const [imageErrorStates, setImageErrorStates] = useState({})
  const [profileImageLoading, setProfileImageLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("All")
  const [previewItem, setPreviewItem] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Fetch real data for reels, videos, posts comments
  const { data: reelData } = useQuery(GET_USER_COMMENTED_REELS, { variables: { userId: selectedUser?.id } })
  const { data: videoData } = useQuery(GET_USER_COMMENTED_VIDEOS, { variables: { userId: selectedUser?.id } })
  const { data: postData } = useQuery(GET_USER_COMMENTED_POSTS, { variables: { userId: selectedUser?.id } })

  useEffect(() => {
    const ids = [1, 2, 3, 4]
    const initialStates = {}
    ids.forEach((id) => {
      initialStates[id] = true
    })
    setImageLoadingStates(initialStates)

    // Simulate profile image loading
    setTimeout(() => {
      setProfileImageLoading(false)
    }, 600)

    // Simulate thumbnail loading
    ids.forEach((id, index) => {
      setTimeout(
        () => {
          setImageLoadingStates((prev) => ({
            ...prev,
            [id]: false,
          }))
        },
        800 + index * 300,
      )
    })
  }, [])

  // Fallback demo data (kept to avoid design changes if API empty)
  const fallbackItems = [
    {
      id: 1,
      type: "Reel",
      icon: Play,
      date: "20 Aug 2025",
      thumbnail: "/video-thumbnail.png",
      comment: "This is a fantastic reel! Great content.",
    },
    {
      id: 2,
      type: "Video",
      icon: Video,
      date: "18 Aug 2025",
      thumbnail: "/landscape-video.png",
      comment: "Really enjoyed this video, very informative.",
    },
    {
      id: 3,
      type: "Post",
      icon: FileText,
      date: "15 Aug 2025",
      thumbnail: "/tranquil-forest-path.png",
      comment: "What a beautiful photo! Where was this taken?",
    },
  ]

  // Normalize API data then merge
  const apiReelItems = (reelData?.getUserCommentedReels || []).map((r) => ({
    id: r?.id,
    type: "Reel",
    icon: Play,
    date: "",
    videoUrl: r?.videoUrl,
    thumbnail: r?.videoUrl || "/assets/placeholder.jpg",
    comment: r?.comments?.[0]?.text || "",
  }))

  const apiVideoItems = (videoData?.getUserCommentedVideos || []).map((v) => ({
    id: v?.id,
    type: "Video",
    icon: Video,
    date: "",
    videoUrl: v?.videoUrl,
    thumbnail: v?.videoUrl || "/assets/video-thumbnail.png",
    comment: v?.comments?.[0]?.text || "",
  }))

  const apiPostItems = (postData?.getUserCommentedPosts || []).map((p) => ({
    id: p?.id,
    type: "Post",
    icon: FileText,
    date: "",
    imageUrl: p?.imageUrl,
    thumbnail: p?.imageUrl || "/assets/placeholder.jpg",
    comment: p?.comments?.[0]?.text || "",
  }))

  const allItems = (apiReelItems.length || apiVideoItems.length || apiPostItems.length)
    ? [...apiReelItems, ...apiVideoItems, ...apiPostItems]
    : fallbackItems

  // Updated analytics data for comments
  const analyticsData = [
    { label: "Reels", value: 150, color: "bg-purple-500" },
    { label: "Videos", value: 90, color: "bg-blue-500" },
    { label: "Posts", value: 110, color: "bg-orange-500" },
    { label: "Comments", value: 45, color: "bg-green-500" },
  ]

  const tabs = ["All", "Reels", "Videos", "Posts"]
  const total = analyticsData.reduce((sum, item) => sum + item.value, 0)

  let cumulativePercentage = 0

  const createDonutSegment = (percentage, startAngle, color) => {
    const endAngle = startAngle + percentage * 360
    const largeArcFlag = percentage > 0.5 ? 1 : 0
    const startAngleRad = (startAngle * Math.PI) / 180
    const endAngleRad = (endAngle * Math.PI) / 180
    const radius = 45
    const centerX = 64
    const centerY = 64

    const x1 = centerX + radius * Math.cos(startAngleRad)
    const y1 = centerY + radius * Math.sin(startAngleRad)
    const x2 = centerX + radius * Math.cos(endAngleRad)
    const y2 = centerY + radius * Math.sin(endAngleRad)

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
  }

  // Filter items based on active tab
  const filteredItems = () => {
    if (activeTab === "All") return allItems
    return allItems.filter(item => item.type === activeTab || (activeTab === "Comments" && item.type === "Comment"))
  }

  const handleCommentPreview = (item) => {
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
          {/* Comment Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                <previewItem.icon className="w-5 h-5 text-[#B65FCF]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{previewItem.type}</h3>
                {previewItem.date && <p className="text-xs text-gray-500">Commented on {previewItem.date}</p>}
              </div>
            </div>
            <button 
              onClick={closePreview}
              className="text-gray-500 hover:bg-gray-100 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Comment Content */}
          <div className="p-4 border-b border-gray-100">
            <p className="text-gray-800 whitespace-pre-wrap">{previewItem.comment}</p>
          </div>
          
          {/* Media Content (if available) */}
          <div className="relative">
            {previewItem.videoUrl ? (
              <div className="w-full aspect-square bg-black">
                <video
                  src={previewItem.videoUrl}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  playsInline
                />
              </div>
            ) : previewItem.imageUrl ? (
              <div className="w-full aspect-square bg-gray-50">
                <img
                  src={previewItem.imageUrl}
                  alt={previewItem.type}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : previewItem.thumbnail ? (
              <div className="w-full aspect-square bg-gray-50">
                <img
                  src={previewItem.thumbnail}
                  alt={previewItem.type}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : null}
          </div>
          
          {/* Comment Actions */}
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 text-gray-600">
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Renamed and updated the rendering function
  const renderCommentedItems = () => {
    return filteredItems().map((item) => {
      const IconComponent = item.icon
      return (
        <div key={item.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer" onClick={() => handleCommentPreview(item)}>
          <div className="relative flex-shrink-0">
            {item.thumbnail && !imageErrorStates[item.id] ? (
              <div className="w-16 h-16 rounded-lg overflow-hidden">
                {imageLoadingStates[item.id] ? (
                  <Skeleton variant="rectangle" className="w-16 h-16" />
                ) : (
                  item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.type}
                      className="w-full h-full object-cover"
                      onError={() => {
                        setImageErrorStates(prev => ({
                          ...prev,
                          [item.id]: true
                        }))
                      }}
                    />
                  ) : item.videoUrl ? (
                    <video
                      src={item.videoUrl}
                      className="w-full h-full object-cover"
                      muted
                      controls={false}
                      playsInline
                    />
                  ) : (
                    <img
                      src={item.thumbnail}
                      alt={item.type}
                      className="w-full h-full object-cover"
                      onError={() => {
                        setImageErrorStates(prev => ({
                          ...prev,
                          [item.id]: true
                        }))
                      }}
                    />
                  )
                )}
              </div>
            ) : (
              <div className="w-16 h-16 bg-[#B65FCF] rounded-lg flex items-center justify-center">
                <IconComponent className="w-8 h-8 text-white" />
              </div>
            )}
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#B65FCF] rounded-full flex items-center justify-center">
              <IconComponent className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            {/* Displaying comment text */}
            <h3 className="font-semibold text-gray-900 mb-1 font-inter">{item.type}</h3>
            <p className="text-sm text-gray-800 break-words mb-2 line-clamp-2">{item.comment}</p>
            <p className="text-xs text-gray-600 font-medium">Commented on {item.date}</p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleCommentPreview(item);
            }} 
            className="flex items-center gap-1 text-gray-600 hover:text-[#B65FCF] transition-colors self-start"
          >
            <span className="font-medium">View</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 font-inter relative">
      {renderPreviewModal()}
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Side - Profile */}
            <div className="flex-1">
              {/* Profile Section removed */}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-900 font-inter tracking-tight">{allItems.length}</div>
                  <div className="text-sm text-gray-600 font-medium">Total Comments</div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex space-x-8 border-b border-gray-200 mb-6">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 px-1 text-sm font-medium transition-colors relative ${
                      activeTab === tab
                        ? "text-[#B65FCF] border-b-2 border-[#B65FCF]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Conditional Content Based on Active Tab */}
              {activeTab === "Reels" ? (
                <ReelsCommentRecord selectedUser={selectedUser} />
              ) : activeTab === "Videos" ? (
                <VideosCommentRecord selectedUser={selectedUser} />
              ) : activeTab === "Posts" ? (
                <PostsCommentRecord selectedUser={selectedUser} />
              ) : activeTab === "Comments" ? (
                <ReplyCommentRecord />
              ) : (
                /* Recent Comments Section - moved from main content */
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6">
                    <div className="space-y-4">
                      {renderCommentedItems()}
                    </div>

                    {filteredItems().length === 0 && (
                      <div className="text-center py-12">
                        <div className="text-gray-400 mb-2">💬</div>
                        <p className="text-gray-500 font-medium">No comments found for the selected filter.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Analytics */}
            {/* <div className="lg:w-80 bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 font-inter">Analytics</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Total Comments</span>
                  <span className="font-bold text-gray-900 font-inter">395</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">This Month</span>
                  <span className="font-bold text-gray-900 font-inter">127</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Avg per Day</span>
                  <span className="font-bold text-gray-900 font-inter">4.2</span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Comment Distribution</h4>
                <div className="w-32 h-32 mx-auto mb-4 relative">
                  <svg width="128" height="128" viewBox="0 0 128 128" className="transform -rotate-90">
                    {analyticsData.map((item, index) => {
                      const percentage = item.value / total
                      const startAngle = cumulativePercentage * 360
                      const path = createDonutSegment(percentage, startAngle, item.color)
                      cumulativePercentage += percentage

                      const colors = {
                        "bg-purple-500": "#8b5cf6",
                        "bg-blue-500": "#3b82f6",
                        "bg-orange-500": "#f97316",
                        "bg-green-500": "#10b981",
                      }

                      return (
                        <path
                          key={index}
                          d={path}
                          fill={colors[item.color]}
                          className="hover:opacity-80 transition-opacity"
                        />
                      )
                    })}
                    <circle cx="64" cy="64" r="25" fill="white" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900 font-inter tracking-tight">395</div>
                      <div className="text-xs text-gray-500 font-medium">Total</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {analyticsData.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="text-gray-600 font-medium">{item.label}</span>
                      </div>
                      <span className="font-bold text-gray-900 font-inter">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Activity</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Today</span>
                    <span className="font-medium text-gray-900">12 comments</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Yesterday</span>
                    <span className="font-medium text-gray-900">8 comments</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">This Week</span>
                    <span className="font-medium text-gray-900">67 comments</span>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>


    </div>
  )
}

export default CommentRecord
