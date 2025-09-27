"use client"

import { useState, useMemo } from "react"
import {
  MessageSquare,
  User,
  Tags,
  Clock,
  Search,
  ChevronDown,
  BarChart2,
  LineChart,
  PieChart,
  Calendar,
} from "lucide-react";
import {GET_USER_COMMENTED_VIDEOS }  from "../../graphql/mutations"
import {  useQuery } from '@apollo/client';

// CSS-in-JS for line clamping support
const lineClampStyles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`

// Reusable Skeleton component for loading states
const Skeleton = ({ className }) => (
  <div className={`bg-gray-200 animate-pulse rounded-md ${className}`}></div>
)

// Dummy data for the Video Comment Record dashboard
const videoCommentsData = {
  totalComments: 345,
  mostCommentedCreator: {
    name: "CodeMaster",
    username: "codemaster",
  },
  mostActiveCategory: "Tutorials",
  lastCommentedDate: "August 22, 2024",
  comments: [
    {
      id: "vc1",
      videoTitle: "How to Build a React App",
      videoThumbnail: "/assets/video-thumbnail.png",
      creator: "CodeMaster",
      creatorUsername: "codemaster",
      userComment: "This tutorial is 🔥, thanks!",
      dateCommented: "2024-08-22",
      likesOnComment: 50,
      category: "Tutorials",
    },
    {
      id: "vc2",
      videoTitle: "Best Gaming Moments of 2024",
      videoThumbnail: "/assets/landscape-video.png",
      creator: "GamePro",
      creatorUsername: "game_pro",
      userComment: "That last clip was insane!",
      dateCommented: "2024-08-21",
      likesOnComment: 120,
      category: "Gaming",
    },
    {
      id: "vc3",
      videoTitle: "Exploring the Ancient Ruins",
      videoThumbnail: "/assets/tranquil-forest-path.png",
      creator: "Wanderlust",
      creatorUsername: "wanderlust_official",
      userComment: "Beautiful cinematography!",
      dateCommented: "2024-08-20",
      likesOnComment: 30,
      category: "Travel",
    },
    {
      id: "vc4",
      videoTitle: "Top 10 Music Festival Moments",
      videoThumbnail: "/assets/sunset-comment.png",
      creator: "MusicVibes",
      creatorUsername: "music_vibes",
      userComment: "Awesome setlist, thank you for sharing!",
      dateCommented: "2024-08-19",
      likesOnComment: 75,
      category: "Music",
    },
    {
      id: "vc5",
      videoTitle: "Python for Beginners",
      videoThumbnail: "/assets/video-thumbnail.png",
      creator: "CodeMaster",
      creatorUsername: "codemaster",
      userComment: "Very clear and easy to follow. Subscribed!",
      dateCommented: "2024-08-18",
      likesOnComment: 65,
      category: "Tutorials",
    },
  ],
}

// Helper function to render a stat card
const renderStatCard = (title, value, Icon) => (
  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex flex-col items-center text-center min-h-[120px]">
    <Icon size={24} className="text-gray-500 mb-2 flex-shrink-0" />
    <span className="text-sm font-medium text-gray-500 truncate w-full px-1" title={title}>
      {title}
    </span>
    <span className="text-lg sm:text-2xl font-bold text-gray-900 mt-1 truncate w-full px-1" title={value}>
      {typeof value === 'string' && value.length > 10 ? value.substring(0, 10) + '...' : value}
    </span>
  </div>
)

export default function VideoCommentRecord(selectedUser) {
  const [showTable, setShowTable] = useState(false)
  const [sortOrder, setSortOrder] = useState("most_recent")
  const [categoryFilter, setCategoryFilter] = useState("all")

   const { data: videoData, loading: videoLoading, error: videoError } = useQuery(GET_USER_COMMENTED_VIDEOS ,{variables:{ userId: selectedUser?.selectedUser?.id}});
      
           /* console.log(...) */ void 0;

  // Normalize API data to UI structure
  const apiComments = (videoData?.getUserCommentedVideos || []).map((p) => ({
    id: p?.id,
    videoTitle: p?.caption || "Video",
    videoThumbnail: p?.videoUrl || "/assets/video-thumbnail.png",
    creator: "",
    creatorUsername: "",
    userComment: p?.comments?.[0]?.text || "",
    dateCommented: "1970-01-01",
    likesOnComment: 0,
    category: "General",
  }));

  const baseComments = apiComments.length ? apiComments : [];

  // Memoize filtered and sorted data
  const filteredAndSortedComments = useMemo(() => {
    return baseComments
      .filter((comment) => {
        if (categoryFilter !== "all" && comment.category !== categoryFilter) {
          return false
        }
        return true
      })
      .sort((a, b) => {
        if (sortOrder === "most_recent") {
          return new Date(b.dateCommented).getTime() - new Date(a.dateCommented).getTime()
        }
        if (sortOrder === "oldest") {
          return new Date(a.dateCommented).getTime() - new Date(b.dateCommented).getTime()
        }
        if (sortOrder === "most_liked") {
          return (b.likesOnComment || 0) - (a.likesOnComment || 0)
        }
        return 0
      })
  }, [sortOrder, categoryFilter, apiComments])

  // Chart Data (use baseComments)
  const categoryData = baseComments.reduce((acc, comment) => {
    acc[comment.category] = (acc[comment.category] || 0) + 1
    return acc
  }, {})

  const chartCategoryData = Object.entries(categoryData).map(([name, count]) => ({
    name,
    count,
  }))

  const creatorData = baseComments.reduce((acc, comment) => {
    acc[comment.creator || "Unknown"] = (acc[comment.creator || "Unknown"] || 0) + 1
    return acc
  }, {})

  const chartCreatorData = Object.entries(creatorData).map(([label, value]) => ({
    label,
    value,
  }))

  const timelineData = [
    { week: "Week 1", count: 2 },
    { week: "Week 2", count: 2 },
    { week: "Week 3", count: 1 },
  ]

  // Helper function to render a bar chart
  const renderBarChart = (title, data) => {
    const maxVal = Math.max(...data.map((d) => d.count))
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart2 size={18} className="mr-2 text-gray-500 flex-shrink-0" />
          <span className="truncate" title={title}>{title}</span>
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
                <span className="text-xs text-gray-500 mt-2 font-medium truncate w-full text-center" title={bar.name || bar.week}>
                  {((bar.name || bar.week).length > 8 ? (bar.name || bar.week).substring(0, 8) + '...' : (bar.name || bar.week))}
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

  // Helper function to render a donut chart
  const renderDonutChart = (title, data) => {
    let cumulativePercentage = 0
    const total = data.reduce((sum, item) => sum + item.value, 0)
    const colors = ["#8b5cf6", "#3b82f6", "#10b981", "#ef4444", "#f59e0b"]
  
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
            <circle cx="64" cy="64" r="30" fill="white" />
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
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className={`w-3 h-3 rounded-full flex-shrink-0`} style={{ backgroundColor: colors[index % colors.length] }}></div>
                <span className="text-sm text-gray-700 truncate" title={item.label}>
                  {item.label.length > 12 ? item.label.substring(0, 12) + '...' : item.label}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900 flex-shrink-0 ml-2">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gray-50 lg:ml-0 min-w-0">
      <style dangerouslySetInnerHTML={{ __html: lineClampStyles }} />
      <div className="ml-16 lg:ml-0 min-w-0">
        {/* Page Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-gray-900 truncate">
              Video Comment Record
            </h1>
            <p className="text-sm text-gray-500 truncate">
              All videos where [Username] has commented
            </p>
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
        </header>

        <main className="p-4 sm:p-6 min-w-0">
          {/* Stats Overview */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            {renderStatCard("Total Comments", apiComments.length, MessageSquare)}
          </section>

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
                  <option value="most_liked">Sort by: Most Liked Comment</option>
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
                  <option value="Tutorials">Tutorials</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Travel">Travel</option>
                  <option value="Music">Music</option>
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

          {/* Comments Grid / Table Section */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            {filteredAndSortedComments.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500 text-lg font-semibold">
                Video not found
              </div>
            ) : !showTable ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredAndSortedComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 rounded-lg border border-gray-200 flex flex-col text-center space-y-3 hover:bg-gray-50 transition-colors h-full"
                  >
                    <video
                      src={comment.videoThumbnail}
                      alt="Video thumbnail"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0 w-full">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem]">
                        {comment.videoTitle}
                      </h4>
                      <p className="text-xs text-gray-500 truncate mb-2">
                        Creator: @{comment.creatorUsername}
                      </p>
                      <div className="mt-2 p-2 bg-gray-100 rounded-lg text-sm">
                        <p className="text-gray-800 line-clamp-3 text-left min-h-[3.5rem]">
                          "{comment.userComment.length > 80 ? comment.userComment.substring(0, 80) + '...' : comment.userComment}"
                        </p>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 truncate">
                        Commented on: {comment.dateCommented}
                      </div>
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
                        Video Thumbnail
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Video Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Creator
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User's Comment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Likes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedComments.map((comment, index) => (
                      <tr key={comment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <video
                            src={comment.videoThumbnail}
                            alt="Video thumbnail"
                            className="w-12 h-16 object-cover rounded"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs">
                          <div className="truncate" title={comment.videoTitle}>
                            {comment.videoTitle.length > 25 ? comment.videoTitle.substring(0, 25) + '...' : comment.videoTitle}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="truncate" title={comment.creator}>
                            {comment.creator}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs">
                          <div className="truncate" title={comment.userComment}>
                            {comment.userComment.length > 30 ? comment.userComment.substring(0, 30) + '...' : comment.userComment}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {comment.dateCommented}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {comment.likesOnComment.toLocaleString()}
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
            {renderBarChart("Comments by Video Category", chartCategoryData)}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <LineChart size={18} className="mr-2 text-gray-500" />
                Comments Over Time
              </h3>
              <div className="h-48 flex items-center justify-center text-gray-400">
                Timeline Graph Coming Soon
              </div>
            </div>
            {renderDonutChart("Top Creators Commented On", chartCreatorData)}
          </section> */}
        </main>
      </div>
    </div>
  )
}
