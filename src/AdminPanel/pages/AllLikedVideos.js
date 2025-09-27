"use client"

import { useState } from "react"
import {
  Heart,
  User,
  Clock,
  Search,
  ChevronDown,
  BarChart2,
  LineChart,
  PieChart,
  Calendar,
  Layers,
  Star,
  Play,
  Video,
  FileText,
  MessageCircle,
  X,
  ChevronRight
} from "lucide-react"
import CountUp from "react-countup"
import {GET_USER_LIKED_VIDEOS}  from "../../graphql/mutations"
import {  useQuery } from '@apollo/client';

// Reusable Skeleton component for loading states
const Skeleton = ({ className }) => (
  <div className={`bg-gray-200 animate-pulse rounded-md ${className}`}></div>
)

// Dummy data for the Liked Videos dashboard
const likedVideosData = {
  totalVideos: 876,
  mostLikedCreator: {
    name: "John Doe",
    username: "johndoe",
  },
  lastLikedDate: "August 22, 2024",
  videos: [
    {
      id: "v1",
      thumbnail: "/assets/video-thumbnail.png",
      title: "How to Build a Portfolio Website",
      creator: "Tech Guru",
      creatorUsername: "tech_guru",
      dateLiked: "2024-08-22",
      duration: "08:45",
      views: 154000,
      category: "Tech",
    },
    {
      id: "v2",
      thumbnail: "/assets/landscape-video.png",
      title: "Top 10 Indie Songs of the Month",
      creator: "Music Vibes",
      creatorUsername: "music_vibes",
      dateLiked: "2024-08-21",
      duration: "12:30",
      views: 89000,
      category: "Music",
    },
    {
      id: "v3",
      thumbnail: "/assets/video-thumbnail.png",
      title: "Epic Gaming Moments of 2024",
      creator: "Game Master",
      creatorUsername: "game_master",
      dateLiked: "2024-08-20",
      duration: "15:10",
      views: 221000,
      category: "Gaming",
    },
    {
      id: "v4",
      thumbnail: "/assets/landscape-video.png",
      title: "Quick 5-Minute Morning Yoga",
      creator: "Wellness Coach",
      creatorUsername: "wellness_coach",
      dateLiked: "2024-08-19",
      duration: "04:50",
      views: 56000,
      category: "Fitness",
    },
    {
      id: "v5",
      thumbnail: "/assets/video-thumbnail.png",
      title: "Unboxing the New Smartphone",
      creator: "Tech Guru",
      creatorUsername: "tech_guru",
      dateLiked: "2024-08-18",
      duration: "10:00",
      views: 310000,
      category: "Tech",
    },
    {
      id: "v6",
      thumbnail: "/assets/landscape-video.png",
      title: "Cooking a Perfect Steak",
      creator: "Foodie Channel",
      creatorUsername: "foodie_channel",
      dateLiked: "2024-08-17",
      duration: "07:20",
      views: 189000,
      category: "Cooking",
    },
  ],
}

// Helper function to get video duration category
const getDurationCategory = (duration) => {
  const [minutes, seconds] = duration.split(":").map(Number)
  const totalSeconds = minutes * 60 + seconds
  if (totalSeconds < 60) return "Short"
  if (totalSeconds <= 600) return "Medium"
  return "Long"
}

// Dummy data for charts based on video data
const categoryData = likedVideosData.videos.reduce((acc, video) => {
  acc[video.category] = (acc[video.category] || 0) + 1
  return acc
}, {})

const chartCategoryData = Object.entries(categoryData).map(([name, count]) => ({
  name,
  count,
}))

const durationData = likedVideosData.videos.reduce((acc, video) => {
  const category = getDurationCategory(video.duration)
  acc[category] = (acc[category] || 0) + 1
  return acc
}, {})

const chartDurationData = Object.entries(durationData).map(([label, count]) => ({
  label,
  value: count,
}))

const totalDurationInSeconds = likedVideosData.videos.reduce((sum, video) => {
  const [minutes, seconds] = video.duration.split(":").map(Number)
  return sum + minutes * 60 + seconds
}, 0)

const averageDuration = new Date(totalDurationInSeconds * 1000)
  .toISOString()
  .slice(14, 19)

export default function LikedVideosDashboard(selectedUser) {
  const [isDataLoading] = useState(false)
  const [showTable, setShowTable] = useState(false)
  const [sortOrder, setSortOrder] = useState("most_recent")
  const [durationFilter, setDurationFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [previewItem, setPreviewItem] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const { data: videoData, loading: videoLoading, error: videoError } = useQuery(GET_USER_LIKED_VIDEOS,{variables:{ userId: selectedUser?.selectedUser?.id}});
    
         /* console.log(...) */ void 0;

  // Map API videos to UI shape (fallback to placeholders to avoid UI break)
  const apiVideos = (videoData?.getUserLikedVideos || []).map((v) => ({
    id: v?.id,
    title: v?.caption || "Video",
    thumbnail: v?.videoUrl || "/assets/video-thumbnail.png", // no thumbnail in API
    creator: "",                               // not provided by API
    dateLiked: "1970-01-01",                   // placeholder for stable sort
    duration: "00:00",                          // not provided
    views: 0,                                    // not provided
    category: "General",                       // fallback
  }));

  // Helper function to render a stat card
  const renderStatCard = (title, value, IconComponent) => (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex flex-col items-center text-center">
      <IconComponent size={24} className="text-gray-500 mb-2" />
      <span className="text-sm font-medium text-gray-500">{title}</span>
      {isDataLoading ? (
        <Skeleton className="h-6 w-20 mt-1" />
      ) : (
        <span className="text-2xl font-bold text-gray-900 mt-1">
          {typeof value === "number" ? (
            <CountUp start={0} end={value} duration={1.5} />
          ) : (
            value
          )}
        </span>
      )}
    </div>
  )

  // Filter and sort videos (use API data if present)
  const filteredAndSortedVideos = apiVideos.length
    ? apiVideos.filter((video) => {
        const durationCategory = getDurationCategory(video.duration || "00:00")
        if (durationFilter !== "all" && durationCategory !== durationFilter) {
          return false
        }
        if (categoryFilter !== "all" && video.category !== categoryFilter) {
          return false
        }
        return true
      }).sort((a, b) => {
        if (sortOrder === "most_recent") {
          return new Date(b.dateLiked).getTime() - new Date(a.dateLiked).getTime()
        }
        if (sortOrder === "oldest") {
          return new Date(a.dateLiked).getTime() - new Date(b.dateLiked).getTime()
        }
        if (sortOrder === "most_viewed") {
          return (b.views || 0) - (a.views || 0)
        }
        return 0
      })
    : [];

  // Helper function to render a bar chart
  const renderBarChart = (title, data) => {
    const maxVal = Math.max(...data.map((d) => d.count))
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart2 size={18} className="mr-2 text-gray-500" />
          {title}
        </h3>
        <div className="h-48 flex items-end justify-between space-x-2 px-2 overflow-hidden">
          {data.map((bar, index) => {
            const heightPercentage = (bar.count / maxVal) * 100
            return (
              <div
                key={index}
                className="flex flex-col items-center min-w-0 flex-1 max-w-20"
              >
                <div
                  className="bg-purple-500 w-8 md:w-12 rounded-t-lg transition-all duration-1000 ease-out"
                  style={{ height: `${heightPercentage}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2 font-medium truncate">
                  {bar.name || bar.day}
                </span>
                <span className="text-xs text-gray-400 truncate">
                  {bar.count}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Helper function to render a pie chart
  const renderPieChart = (title, data) => {
    let cumulativePercentage = 0
    const total = data.reduce((sum, item) => sum + item.value, 0)
    const colors = ["#8b5cf6", "#3b82f6", "#10b981"]

    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex flex-col sm:flex-row items-center justify-center gap-6">
        <div className="w-32 h-32 relative flex-shrink-0">
          <svg width="128" height="128" viewBox="0 0 128 128" className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = item.value / total
              const startAngle = cumulativePercentage * 360
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
              const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
              cumulativePercentage += percentage
              return (
                <path
                  key={index}
                  d={path}
                  fill={colors[index % colors.length]}
                  className="hover:opacity-80 transition-opacity"
                />
              )
            })}
            <circle cx="64" cy="64" r="25" fill="white" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm font-bold text-gray-900">{total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>
        <div className="space-y-2 flex-1 w-full sm:w-auto">
          {data.map((item, index) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: colors[index % colors.length] }}></div>
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Handle video preview function
  const handleVideoPreview = (video) => {
    // Convert video data to the format expected by the preview modal
    const previewData = {
      id: video.id,
      type: "Video",
      icon: Video,
      date: video.dateLiked,
      videoUrl: video.thumbnail,
      thumbnail: video.thumbnail,
      title: video.title,
      creator: video.creator,
      duration: video.duration,
      views: video.views
    };
    
    setPreviewItem(previewData);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewItem(null);
  };

  // Render preview modal
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
          {/* Video Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                <previewItem.icon className="w-5 h-5 text-[#B65FCF]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{previewItem.type}</h3>
                {previewItem.date && <p className="text-xs text-gray-500">Liked on {previewItem.date}</p>}
                {previewItem.creator && <p className="text-xs text-gray-500">By {previewItem.creator}</p>}
              </div>
            </div>
            <button 
              onClick={closePreview}
              className="text-gray-500 hover:bg-gray-100 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Video Content */}
          <div className="relative">
            {previewItem.videoUrl ? (
              <div className="w-full aspect-video bg-gray-50">
                <video
                  src={previewItem.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>
            ) : previewItem.thumbnail ? (
              <div className="w-full aspect-video bg-gray-50">
                <img
                  src={previewItem.thumbnail}
                  alt={previewItem.title}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-full aspect-video bg-gray-50 flex items-center justify-center">
                <previewItem.icon className="w-16 h-16 text-gray-300" />
              </div>
            )}
            {previewItem.title && (
              <div className="p-3 bg-white border-t border-gray-100">
                <p className="text-sm font-medium text-gray-900">{previewItem.title}</p>
                {previewItem.views && (
                  <p className="text-xs text-gray-500 mt-1">{previewItem.views.toLocaleString()} views</p>
                )}
              </div>
            )}
          </div>
          
          {/* Video Actions */}
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 text-gray-600">
                  <MessageCircle className="w-5 h-5" />
                </button>
                <button className="flex items-center gap-1 text-gray-600">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
              <button className="text-gray-600">
                <Play className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-gray-50 lg:ml-0 min-w-0">
      {renderPreviewModal()}
      <div className="ml-16 lg:ml-0 min-w-0">
        {/* Page Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-gray-900 truncate">
              Liked Videos
            </h1>
            <p className="text-sm text-gray-500 truncate">
              All videos liked by [Username]
            </p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-48">
              {renderStatCard("Total Liked Videos", (apiVideos.length ? apiVideos.length : 0), Heart)}
            </div>
            {/* <div className="relative hidden sm:block">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search videos..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-48"
              />
            </div> */}
          </div>
        </header>

        <main className="p-4 sm:p-6 min-w-0">
          {/* Controls and Toggles */}
          <div className="flex flex-col sm:flex-row items-center justify-between flex-wrap gap-2 mb-6">
            {/* <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="most_recent">Sort by: Recent</option>
                  <option value="oldest">Sort by: Oldest</option>
                  <option value="most_viewed">Sort by: Most Viewed</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
              <div className="relative">
                <select
                  value={durationFilter}
                  onChange={(e) => setDurationFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Durations</option>
                  <option value="Short">Short (&lt; 1 min)</option>
                  <option value="Medium">Medium (1-10 min)</option>
                  <option value="Long">Long (&gt; 10 min)</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {Object.keys(categoryData).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div> */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <span className="text-sm text-gray-500">View as:</span>
              <button
                onClick={() => setShowTable(false)}
                className={`py-1 px-3 rounded-lg text-sm font-medium transition-colors ${
                  !showTable
                    ? "bg-purple-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setShowTable(true)}
                className={`py-1 px-3 rounded-lg text-sm font-medium transition-colors ${
                  showTable
                    ? "bg-purple-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Table
              </button>
            </div>
          </div>

          {/* Videos Gallery / Table Section */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            {filteredAndSortedVideos.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500 text-lg font-semibold">
                Video not found
              </div>
            ) : !showTable ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredAndSortedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="group rounded-lg overflow-hidden border border-gray-200 transition-transform transform hover:scale-[1.02] active:scale-100 cursor-pointer"
                    onClick={() => handleVideoPreview(video)}
                  >
                    <div className="relative aspect-video bg-gray-100 overflow-hidden">
                      <video
                        src={video.thumbnail}
                        alt={`Thumbnail for ${video.title}`}
                        className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                      />
                      <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs font-semibold px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <div className="p-3 bg-white">
                      <h4 className="text-sm font-semibold truncate">
                        {video.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        by {video.creator}
                      </p>
                      <p className="text-xs text-gray-500">
                        Liked: {video.dateLiked}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thumbnail
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Video Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Creator
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Liked
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Views
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedVideos.map((video, index) => (
                      <tr 
                        key={video.id} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleVideoPreview(video)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <video
                            src={video.thumbnail}
                            alt="Video thumbnail"
                            className="w-20 h-12 object-cover rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {video.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {video.creator}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {video.duration}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {video.dateLiked}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {video.views.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          
          {/* Charts Section */}
          {/* <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {renderBarChart("Liked Videos by Category", chartCategoryData)}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <LineChart size={18} className="mr-2 text-gray-500" />
                Videos Liked Over Time
              </h3>
              <div className="h-48 flex items-center justify-center text-gray-400">
                Timeline Graph Coming Soon
              </div>
            </div>
            {renderPieChart("Duration Split", chartDurationData)}
          </section> */}
        </main>
      </div>
    </div>
  )
}
