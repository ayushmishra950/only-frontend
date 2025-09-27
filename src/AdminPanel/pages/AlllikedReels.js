"use client"

import { useState } from "react"
import {
  Heart,
  User,
  Tags,
  Clock,
  Search,
  ChevronDown,
  Calendar,
  BarChart2,
  LineChart,
  Play,
  Video,
  FileText,
  MessageCircle,
  X,
  ChevronRight
} from "lucide-react"
import CountUp from "react-countup";
import {GET_USER_LIKED_REELS}  from "../../graphql/mutations"
import {  useQuery } from '@apollo/client';


// Reusable Skeleton component for loading states
const Skeleton = ({ className }) => (
  <div className={`bg-gray-200 animate-pulse rounded-md ${className}`}></div>
)


// Dummy data for the Liked Reels dashboard
const likedReelsData = {
  totalReels: 543,
  mostLikedCreator: {
    name: "Alex Johnson",
    username: "alexj",
  },
  lastLikedDate: "August 20, 2024",
  reels: [
    {
      id: "r1",
      thumbnail: "/assets/majestic-castle-reel.png",
      creator: "Creator A",
      creatorUsername: "creator_a",
      dateLiked: "2024-08-20",
      likes: 15400,
      category: "Comedy",
    },
    {
      id: "r2",
      thumbnail: "/assets/tranquil-forest-path.png",
      creator: "Creator B",
      creatorUsername: "creator_b",
      dateLiked: "2024-08-19",
      likes: 8900,
      category: "Music",
    },
    {
      id: "r3",
      thumbnail: "/assets/landscape-story.png",
      creator: "Creator C",
      creatorUsername: "creator_c",
      dateLiked: "2024-08-18",
      likes: 22100,
      category: "Sports",
    },
    {
      id: "r4",
      thumbnail: "/assets/sunset-comment.png",
      creator: "Creator D",
      creatorUsername: "creator_d",
      dateLiked: "2024-08-17",
      likes: 5600,
      category: "Comedy",
    },
    {
      id: "r5",
      thumbnail: "/assets/mountain-post.png",
      creator: "Creator E",
      creatorUsername: "creator_e",
      dateLiked: "2024-08-16",
      likes: 31000,
      category: "Travel",
    },
    {
      id: "r6",
      thumbnail: "/assets/landscape-video.png",
      creator: "Creator A",
      creatorUsername: "creator_a",
      dateLiked: "2024-08-15",
      likes: 18900,
      category: "Music",
    },
    {
      id: "r7",
      thumbnail: "/assets/majestic-castle-reel.png",
      creator: "Creator F",
      creatorUsername: "creator_f",
      dateLiked: "2024-08-14",
      likes: 9200,
      category: "Comedy",
    },
    {
      id: "r8",
      thumbnail: "/assets/tranquil-forest-path.png",
      creator: "Creator G",
      creatorUsername: "creator_g",
      dateLiked: "2024-08-13",
      likes: 45000,
      category: "Dance",
    },
    {
      id: "r9",
      thumbnail: "/assets/sunset-comment.png",
      creator: "Creator A",
      creatorUsername: "creator_a",
      dateLiked: "2024-08-12",
      likes: 25000,
      category: "Comedy",
    },
  ],
}

// Dummy data for charts
const categoryData = likedReelsData.reels.reduce((acc, reel) => {
  acc[reel.category] = (acc[reel.category] || 0) + 1
  return acc
}, {})

const chartCategoryData = Object.entries(categoryData).map(([name, count]) => ({
  name,
  count,
}))

const timelineData = [
  { day: "Aug 14", count: 2 },
  { day: "Aug 15", count: 3 },
  { day: "Aug 16", count: 5 },
  { day: "Aug 17", count: 1 },
  { day: "Aug 18", count: 4 },
  { day: "Aug 19", count: 3 },
  { day: "Aug 20", count: 6 },
]

export default function LikedReelsDashboard( selectedUser) {
  /* console.log(...) */ void 0;
  const [isDataLoading] = useState(false)
  const [showTable, setShowTable] = useState(false)
  const [sortOrder, setSortOrder] = useState("most_recent")
  const [previewItem, setPreviewItem] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)


    const { data: reelData, loading: reelLoading, error: reelError } = useQuery(GET_USER_LIKED_REELS,{variables:{ userId: selectedUser?.selectedUser?.id}});
    /* console.log(...) */ void 0;

    // Map API reels to UI shape; keep design intact with safe fallbacks
    const apiReels = (reelData?.getUserLikedReels || []).map((r) => ({
      id: r?.id,
      thumbnail: r?.videoUrl || "/assets/placeholder.jpg", // No thumbnail in API
      creator: r?.title || "Reel",                            // No creator in API
      dateLiked: "1970-01-01",                                // Placeholder for sorting
      likes: 0,                                                // Not provided by API
      category: "General",                                     // Fallback
    }));

    // Base list to use across UI (API if present, else dummy)
    const baseReels = apiReels.length ? apiReels : likedReelsData.reels;

    // Category aggregations for charts and stats
    const categoryData = baseReels.reduce((acc, reel) => {
      acc[reel.category] = (acc[reel.category] || 0) + 1;
      return acc;
    }, {});

    const chartCategoryData = Object.entries(categoryData).map(([name, count]) => ({
      name,
      count,
    }));
  
  // Helper function to render stat cards
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

  // Helper function to render a bar chart
  const renderBarChart = (title, data) => {
    const maxVal = Math.max(...data.map((d) => d.count))
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <BarChart2 size={18} className="inline mr-2 text-gray-500" />
          {title}
        </h3>
        <div className="h-48 flex items-end justify-between space-x-4 px-2 overflow-hidden">
          {data.map((bar, index) => {
            const heightPercentage = (bar.count / maxVal) * 100
            return (
              <div
                key={index}
                className="flex flex-col items-center min-w-0 flex-1 max-w-16"
              >
                <div
                  className="bg-purple-500 w-8 rounded-t-lg transition-all duration-1000 ease-out"
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

  // Helper function to render a line chart
  const renderLineChart = (title, data) => {
    const maxVal = Math.max(...data.map((d) => d.count))
    const points = data.map((d, i) => ({
      x: (i / (data.length - 1)) * 100,
      y: 100 - (d.count / maxVal) * 100,
    }))
    const path = points
      .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
      .join(" ")

    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <LineChart size={18} className="inline mr-2 text-gray-500" />
          {title}
        </h3>
        <div className="h-48 relative">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
          >
            <path
              d={path}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="1.5"
                fill="#8b5cf6"
                className="transition-transform duration-500 hover:scale-150"
              />
            ))}
          </svg>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {data.map((d, i) => (
            <span key={i} className="flex-1 text-center">
              {d.day}
            </span>
          ))}
        </div>
      </div>
    )
  }

  // Sort the reels based on the selected order (use API if available)
  const sortedReels = [...baseReels].sort((a, b) => {
    if (sortOrder === "most_recent") {
      return new Date(b.dateLiked).getTime() - new Date(a.dateLiked).getTime()
    }
    if (sortOrder === "oldest") {
      return new Date(a.dateLiked).getTime() - new Date(b.dateLiked).getTime()
    }
    if (sortOrder === "most_popular") {
      return (b.likes || 0) - (a.likes || 0)
    }
    return 0
  })

  // Handle reel preview function
  const handleReelPreview = (reel) => {
    // Convert reel data to the format expected by the preview modal
    const previewData = {
      id: reel.id,
      type: "Reel",
      icon: Play,
      date: reel.dateLiked,
      videoUrl: reel.thumbnail, // Using thumbnail as video URL since that's what contains the video in this component
      thumbnail: reel.thumbnail,
      creator: reel.creator
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
          {/* Post Header */}
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

  return (
    <div className="flex-1 bg-gray-50 lg:ml-0 min-w-0">
      {renderPreviewModal()}
      <div className="ml-16 lg:ml-0 min-w-0">
        {/* Page Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-gray-900 truncate">
              Liked Reels
            </h1>
            <p className="text-sm text-gray-500 truncate">
              All reels liked by [Username]
            </p>
          </div>
          {/* <div className="relative hidden sm:block">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search reels..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-48"
            />
          </div> */}
        </header>

        <main className="p-4 sm:p-6 min-w-0">
          {/* Stats Overview */}
          <section className="grid grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            {renderStatCard("Total Liked Reels", (apiReels.length ? apiReels.length : likedReelsData.totalReels), Heart)}
            {renderStatCard("Categories", Object.keys(categoryData).length, Tags)}
          </section>

          {/* Controls and Toggles */}
          <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
            {/* <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="most_recent">Sort by: Most Recent</option>
                  <option value="oldest">Sort by: Oldest</option>
                  <option value="most_popular">Sort by: Most Popular</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
              <button className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg py-2 px-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                <Calendar size={16} />
                Date Range
              </button>
            </div> */}
            <div className="flex items-center space-x-2">
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

          {/* Reels Gallery / Table Section */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            {!showTable ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {sortedReels.map((reel) => (
                  <div
                    key={reel.id}
                    className="group rounded-lg overflow-hidden border border-gray-200 transition-transform transform hover:scale-[1.02] active:scale-100 cursor-pointer"
                    onClick={() => handleReelPreview(reel)}
                  >
                    <div className="relative aspect-[9/16] bg-gray-100 overflow-hidden">
                      <video
                        src={reel.thumbnail}
                        alt={`Reel from ${reel.creator}`}
                        className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Heart size={20} className="text-white mr-1" />
                        <span className="text-white text-sm font-semibold">
                          {reel.likes.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-white">
                      <h4 className="text-sm font-semibold truncate">
                        {reel.creator}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Liked: {reel.dateLiked}
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
                        Sr No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thumbnail
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Creator
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Liked
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Likes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedReels.map((reel, index) => (
                      <tr 
                        key={reel.id} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleReelPreview(reel)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <video
                            src={reel.thumbnail}
                            alt="Reel thumbnail"
                            className="w-12 h-20 object-cover rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {reel.creator}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {reel.dateLiked}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {reel.likes.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          
          {/* Charts Section */}
          {/* <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {renderBarChart("Liked Reels by Category", chartCategoryData)}
            {renderLineChart("Liked Reels per Day", timelineData)}
          </section> */}
        </main>
      </div>
    </div>
  )
}
