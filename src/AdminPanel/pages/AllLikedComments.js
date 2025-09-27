"use client"

import { useState, useMemo } from "react"
import {
  Heart,
  User,
  MessageCircle,
  Clock,
  Search,
  ChevronDown,
  BarChart2,
  LineChart,
  PieChart,
  Calendar,
} from "lucide-react"

// Reusable Skeleton component for loading states
const Skeleton = ({ className }) => (
  <div className={`bg-gray-200 animate-pulse rounded-md ${className}`}></div>
)

// Dummy data for the Liked Comments dashboard
const likedCommentsData = {
  totalComments: 789,
  mostLikedUser: {
    name: "Alex Smith",
    username: "alexs",
  },
  lastLikedDate: "August 22, 2024",
  comments: [
    {
      id: "c1",
      creator: "Alex Smith",
      creatorUsername: "alexs",
      profilePic: "/assets/john-doe-profile.png",
      text: "This is so relatable! 😂",
      contentType: "Reel",
      contentTitle: "Funny Skit",
      contentThumbnail: "/assets/majestic-castle-reel.png",
      dateLiked: "2024-08-22",
      likes: 154,
    },
    {
      id: "c2",
      creator: "Techie Mike",
      creatorUsername: "tech_mike",
      profilePic: "/assets/placeholder-user.jpg",
      text: "Great breakdown of the new feature!",
      contentType: "Video",
      contentTitle: "Gadget Review",
      contentThumbnail: "/assets/video-thumbnail.png",
      dateLiked: "2024-08-21",
      likes: 89,
    },
    {
      id: "c3",
      creator: "Alex Smith",
      creatorUsername: "alexs",
      profilePic: "/assets/john-doe-profile.png",
      text: "Can't wait to try this recipe!",
      contentType: "Post",
      contentTitle: "Cooking Tips",
      contentThumbnail: "/assets/sunset-comment.png",
      dateLiked: "2024-08-20",
      likes: 221,
    },
    {
      id: "c4",
      creator: "Storyteller Sam",
      creatorUsername: "story_sam",
      profilePic: "/assets/placeholder-user.jpg",
      text: "This story was so inspiring. Thank you!",
      contentType: "Story",
      contentTitle: "Monday Motivation",
      contentThumbnail: "/assets/landscape-story.png",
      dateLiked: "2024-08-19",
      likes: 56,
    },
  ],
}

export default function LikedCommentsDashboard() {
  const [showTable, setShowTable] = useState(false)
  const [sortOrder, setSortOrder] = useState("most_recent")
  const [contentTypeFilter, setContentTypeFilter] = useState("all")

  // Memoize filtered and sorted data
  const filteredAndSortedComments = useMemo(() => {
    return likedCommentsData.comments
      .filter((comment) => {
        if (contentTypeFilter !== "all" && comment.contentType !== contentTypeFilter) {
          return false
        }
        return true
      })
      .sort((a, b) => {
        if (sortOrder === "most_recent") {
          return new Date(b.dateLiked).getTime() - new Date(a.dateLiked).getTime()
        }
        if (sortOrder === "oldest") {
          return new Date(a.dateLiked).getTime() - new Date(b.dateLiked).getTime()
        }
        if (sortOrder === "most_popular") {
          return b.likes - a.likes
        }
        return 0
      })
  }, [sortOrder, contentTypeFilter])

  // Chart Data
  const contentTypeData = likedCommentsData.comments.reduce((acc, comment) => {
    acc[comment.contentType] = (acc[comment.contentType] || 0) + 1
    return acc
  }, {})

  const chartContentTypeData = Object.entries(contentTypeData).map(([name, count]) => ({
    name,
    count,
  }))

  const creatorData = likedCommentsData.comments.reduce((acc, comment) => {
    acc[comment.creator] = (acc[comment.creator] || 0) + 1
    return acc
  }, {})

  const chartCreatorData = Object.entries(creatorData).map(([label, value]) => ({
    label,
    value,
  }))

  const timelineData = [
    { week: "Week 1", count: 2 },
    { week: "Week 2", count: 4 },
    { week: "Week 3", count: 1 },
  ]

  // Helper function to render a stat card
  const renderStatCard = (title, value, IconComponent) => (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex flex-col items-center text-center">
      <IconComponent size={24} className="text-gray-500 mb-2" />
      <span className="text-sm font-medium text-gray-500">{title}</span>
      <span className="text-2xl font-bold text-gray-900 mt-1">
        {value}
      </span>
    </div>
  )

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
                  {bar.name || bar.week}
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
    const colors = ["#8b5cf6", "#3b82f6", "#10b981", "#ef4444"]
  
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

  return (
    <div className="flex-1 bg-gray-50 min-w-0">
      <div className="min-w-0">
        {/* Page Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-gray-900 truncate">
              Liked Comments
            </h1>
            <p className="text-sm text-gray-500 truncate">
              All comments liked by [Username]
            </p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-48">
              {renderStatCard("Total Comments", likedCommentsData.totalComments, MessageCircle)}
            </div>
            <div className="relative hidden sm:block">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search comments..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-48"
              />
            </div>
         </div>
        </header>

         <main className="p-4 sm:p-6 min-w-0">
          {/* Controls and Toggles */}
          <div className="flex flex-col sm:flex-row items-center justify-between flex-wrap gap-2 mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="most_recent">Sort by: Recent</option>
                  <option value="oldest">Sort by: Oldest</option>
                  <option value="most_popular">Sort by: Most Popular</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
              <div className="relative">
                <select
                  value={contentTypeFilter}
                  onChange={(e) => setContentTypeFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Content Types</option>
                  <option value="Reel">Reels</option>
                  <option value="Post">Posts</option>
                  <option value="Video">Videos</option>
                  <option value="Story">Stories</option>
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
            </div>
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
                List
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

          {/* Comments List / Table Section */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            {!showTable ? (
              <div className="space-y-4">
                {filteredAndSortedComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 rounded-lg border border-gray-200 flex items-start space-x-4 hover:bg-gray-50 transition-colors"
                  >
                    <img
                      src={comment.profilePic}
                      alt={`${comment.creator}'s profile pic`}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline space-x-2 mb-1">
                        <span className="font-semibold text-sm truncate">{comment.creator}</span>
                        <span className="text-xs text-gray-500 flex-shrink-0">· {comment.dateLiked}</span>
                      </div>
                      <p className="text-sm text-gray-700 break-words mb-2">
                        {comment.text}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                        <span className="flex-shrink-0">
                          <span className="font-semibold">{comment.contentType}</span> on "{comment.contentTitle}"
                        </span>
                        <Heart size={14} className="text-red-500 flex-shrink-0" />
                        <span>{comment.likes.toLocaleString()} Likes</span>
                      </div>
                    </div>
                    <img
                      src={comment.contentThumbnail}
                      alt="Content thumbnail"
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
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
                        Comment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Creator
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        On Content Type
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
                    {filteredAndSortedComments.map((comment, index) => (
                      <tr key={comment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 truncate max-w-xs">
                          {comment.text}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {comment.creator}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {comment.contentType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {comment.dateLiked}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {comment.likes.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          
          {/* Charts Section */}
          <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {renderBarChart("Liked Comments by Content Type", chartContentTypeData)}
            {/* Timeline Graph - Dummy data for now */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <LineChart size={18} className="mr-2 text-gray-500" />
                Comments Liked Over Time
              </h3>
              <div className="h-48 flex items-center justify-center text-gray-400">
                Timeline Graph Coming Soon
              </div>
            </div>
            {renderDonutChart("Top Comment Creators", chartCreatorData)}
          </section>
        </main>
      </div>
    </div>
  )
}
