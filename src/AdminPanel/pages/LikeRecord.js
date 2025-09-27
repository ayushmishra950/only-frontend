"use client"
import { Play, Video, FileText, MessageCircle, ChevronRight, X } from "lucide-react"
import { useState, useEffect } from "react"
import Skeleton from "./Skeleton"
import AlllikedReels from "./AlllikedReels"
import AllLikedVideos from "./AllLikedVideos"
import AllLikedposts from "./AllLikedposts"
import AllLikedComments from "./AllLikedComments"
import { useQuery } from "@apollo/client"
import { GET_USER_LIKED_REELS, GET_USER_LIKED_VIDEOS, GET_USER_LIKED_POSTS } from "../../graphql/mutations"

const LikeRecord = ({ onBack, selectedUser }) => {
  const [imageLoadingStates, setImageLoadingStates] = useState({})
  const [profileImageLoading, setProfileImageLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("All")
  const [previewItem, setPreviewItem] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Fetch real liked data
  console.log(selectedUser?.id)
  const { data: reelData } = useQuery(GET_USER_LIKED_REELS, { variables: { userId: selectedUser?.id } })
  const { data: videoData } = useQuery(GET_USER_LIKED_VIDEOS, { variables: { userId: selectedUser?.id } })
  const { data: postData } = useQuery(GET_USER_LIKED_POSTS, { variables: { userId: selectedUser?.id } })
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

  // Fallback demo items (kept to preserve design if API empty)
  const fallbackLikedItems = [
    {
      id: 1,
      type: "Reel",
      icon: Play,
      date: "12 Aug 2025",
      thumbnail: "/video-thumbnail.png",
    },
    {
      id: 2,
      type: "Video",
      icon: Video,
      date: "10 Aug 2025",
      thumbnail: "/landscape-video.png",
    },
    {
      id: 3,
      type: "Post",
      icon: FileText,
      date: "8 Aug 2025",
      thumbnail: "/tranquil-forest-path.png",
    },
    {
      id: 4,
      type: "Comment",
      icon: MessageCircle,
      date: "5 Aug 2025",
      thumbnail: null,
    },
  ]

  // Normalize API data and merge
  const apiReelItems = (reelData?.getUserLikedReels || []).map((r) => ({
    id: r?.id,
    type: "Reel",
    icon: Play,
    date: "",
    videoUrl: r?.videoUrl,
    thumbnail: r?.videoUrl || "/assets/placeholder.jpg",
  }))

  const apiVideoItems = (videoData?.getUserLikedVideos || []).map((v) => ({
    id: v?.id,
    type: "Video",
    icon: Video,
    date: "",
    videoUrl: v?.videoUrl,
    thumbnail: v?.videoUrl || "/assets/video-thumbnail.png",
  }))

  const apiPostItems = (postData?.getUserLikedPosts || []).map((p) => ({
    id: p?.id,
    type: "Post",
    icon: FileText,
    date: "",
    imageUrl: p?.imageUrl,
    thumbnail: p?.imageUrl || "/assets/placeholder.jpg",
  }))

  const likedItems = (apiReelItems.length || apiVideoItems.length || apiPostItems.length)
    ? [...apiReelItems, ...apiVideoItems, ...apiPostItems]
    : fallbackLikedItems

  const analyticsData = [
    { label: "Reels", value: 120, color: "bg-purple-500" },
    { label: "Videos", value: 80, color: "bg-blue-500" },
    { label: "Posts", value: 95, color: "bg-orange-500" },
    { label: "Comments", value: 30, color: "bg-green-500" },
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
                <previewItem.icon className="w-5 h-5 text-[#B65FCF]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{previewItem.type}</h3>
                {previewItem.date && <p className="text-xs text-gray-500">Liked on {previewItem.date}</p>}
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
            ) : (
              <div className="w-full aspect-square bg-gray-50 flex items-center justify-center">
                <previewItem.icon className="w-16 h-16 text-gray-300" />
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

  const renderLikedItems = () => {
    return likedItems.map((item) => {
      const IconComponent = item.icon
      return (
        <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
          <div className="relative">
            {item.thumbnail ? (
              <div className="w-16 h-16 rounded-lg overflow-hidden">
                {imageLoadingStates[item.id] ? (
                  <Skeleton variant="rectangle" className="w-16 h-16" />
                ) :  (
                  item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.type}
                      className="w-full h-full object-cover"
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
                      src={item.thumbnail || "/placeholder.svg"}
                      alt={item.type}
                      className="w-full h-full object-cover"
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
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{item.type}</h3>
            <p className="text-sm text-gray-600">Liked on {item.date}</p>
          </div>
          <button 
            onClick={() => handlePreview(item)}
            className="flex items-center gap-1 text-gray-600 hover:text-[#B65FCF] transition-colors"
          >
            <span className="font-medium">View</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {renderPreviewModal()}
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex gap-8 border-b border-gray-200">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-1 font-medium transition-colors ${
                  activeTab === tab ? "text-[#B65FCF] border-b-2 border-[#B65FCF]" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conditional Content Based on Active Tab */}
      {activeTab === "Reels" ? (
        <AlllikedReels  selectedUser={selectedUser} />
      ) : activeTab === "Videos" ? (
        <AllLikedVideos selectedUser={selectedUser} />
      ) : activeTab === "Posts" ? (
        <AllLikedposts selectedUser={selectedUser} />
      ) : activeTab === "Comments" ? (
        <AllLikedComments />
      ) : (
        /* Main Content */
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Content - Liked Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 space-y-4">{renderLikedItems()}</div>
              </div>
            </div>

            {/* Right Sidebar - Analytics */}
            {/* <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-600 mb-2">Total Likes: 325</p>
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
                        <div className="text-lg font-bold text-gray-900">325</div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {analyticsData.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="text-sm text-gray-700">{item.label}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative"></div>
            </div> */}
          </div>
        </div>
      )}
    </div>
  )
}

export default LikeRecord
