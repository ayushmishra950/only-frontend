"use client"

import { useState, useMemo } from "react"
import {
  Heart,
  User,
  Tags,
  Image as ImageIcon,
  Text,
  Copy,
  Search,
  ChevronDown,
  LineChart,
  BarChart2,
  Calendar,
  Layers,
  Play,
  Video,
  FileText,
  MessageCircle,
  X,
  ChevronRight
} from "lucide-react";
import {GET_USER_LIKED_POSTS}  from "../../graphql/mutations"
import {  useQuery } from '@apollo/client';

// Reusable Skeleton component for loading states
const Skeleton = ({ className }) => (
  <div className={`bg-gray-200 animate-pulse rounded-md ${className}`}></div>
)

// Dummy data for the Liked Posts dashboard
const likedPostsData = {
  totalPosts: 1256,
  mostLikedCreator: {
    name: "Jane Doe",
    username: "janedoe",
  },
  lastLikedDate: "August 22, 2024",
  posts: [
    {
      id: "p1",
      type: "Image",
      thumbnail: "/assets/mountain-post.png",
      creator: "Traveler Tom",
      creatorUsername: "traveler_tom",
      dateLiked: "2024-08-22",
      likes: 5400,
      caption: "Exploring the serene beauty of the mountains. So peaceful here!",
      category: "Travel",
    },
    {
      id: "p2",
      type: "Carousel",
      thumbnail: "/assets/sunset-comment.png",
      creator: "Foodie Fred",
      creatorUsername: "foodie_fred",
      dateLiked: "2024-08-21",
      likes: 8900,
      caption: "A delicious five-course meal from my favorite restaurant. A must-try!",
      category: "Food",
    },
    {
      id: "p3",
      type: "Text",
      thumbnail: "/assets/placeholder.jpg",
      creator: "Writer Wendy",
      creatorUsername: "writer_wendy",
      dateLiked: "2024-08-20",
      likes: 2100,
      caption: "Reflecting on the power of words and how they shape our world. What's your favorite quote?",
      category: "Inspiration",
    },
    {
      id: "p4",
      type: "Image",
      thumbnail: "/assets/landscape-story.png",
      creator: "Fashion Fiona",
      creatorUsername: "fashion_fiona",
      dateLiked: "2024-08-19",
      likes: 7600,
      caption: "New autumn collection is out! Loving these bold colors.",
      category: "Fashion",
    },
    {
      id: "p5",
      type: "Carousel",
      thumbnail: "/assets/tranquil-forest-path.png",
      creator: "Tech Tim",
      creatorUsername: "tech_tim",
      dateLiked: "2024-08-18",
      likes: 12100,
      caption: "Unboxing the latest gadget. The features are truly next level!",
      category: "Tech",
    },
    {
      id: "p6",
      type: "Image",
      thumbnail: "/assets/landscape-video.png",
      creator: "Traveler Tom",
      creatorUsername: "traveler_tom",
      dateLiked: "2024-08-17",
      likes: 6800,
      caption: "Morning view from the mountain cabin. Pure bliss.",
      category: "Travel",
    },
  ],
}

export default function LikedPostsDashboard(selectedUser) {
  /* console.log(...) */ void 0;
  const [previewItem, setPreviewItem] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  
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
  const [showTable, setShowTable] = useState(false)
  const [sortOrder, setSortOrder] = useState("most_recent")
  const [postTypeFilter, setPostTypeFilter] = useState("all")
      const { data: postData, loading: postLoading, error: postError } = useQuery(GET_USER_LIKED_POSTS,{variables:{ userId: selectedUser?.selectedUser?.id}});
  
       /* console.log(...) */ void 0;
       
       // Normalize API posts to match UI structure; keep design intact
       const apiPosts = (postData?.getUserLikedPosts || []).map((p) => ({
         id: p?.id,
         type: p?.imageUrl ? "Image" : "Text",
         thumbnail: p?.imageUrl || "/assets/placeholder.jpg",
         creator: "",                 // Not provided by API
         dateLiked: "1970-01-01",     // Placeholder to avoid sort errors
         likes: 0,                    // Not provided by API
         caption: p?.caption || "",
         category: "General",         // Fallback since API doesn't return category
       }));
       
  // Use useMemo to cache filtered and sorted data
  const filteredAndSortedPosts = useMemo(() => {
    const base = apiPosts.length ? apiPosts : likedPostsData.posts
    return base
      .filter((post) => {
        if (postTypeFilter !== "all" && post.type !== postTypeFilter) {
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
        if (sortOrder === "most_liked") {
          return (b.likes || 0) - (a.likes || 0)
        }
        return 0
      })
  }, [sortOrder, postTypeFilter, apiPosts])

  // Chart Data based on current list
  const categoryData = (apiPosts.length ? apiPosts : likedPostsData.posts).reduce((acc, post) => {
    acc[post.category] = (acc[post.category] || 0) + 1
    return acc
  }, {})

  const chartCategoryData = Object.entries(categoryData).map(([name, count]) => ({
    name,
    count,
  }))

  const postTypeData = (apiPosts.length ? apiPosts : likedPostsData.posts).reduce((acc, post) => {
    acc[post.type] = (acc[post.type] || 0) + 1
    return acc
  }, {})

  const chartPostTypeData = Object.entries(postTypeData).map(([label, value]) => ({
    label,
    value,
  }))

  const timelineData = [
    { week: "Week 1", count: 5 },
    { week: "Week 2", count: 8 },
    { week: "Week 3", count: 3 },
    { week: "Week 4", count: 10 },
  ]

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
    const colors = {
      Image: "#8b5cf6",
      Text: "#3b82f6",
      Carousel: "#10b981",
    }
  
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
                  fill={colors[item.label] || "#ccc"}
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
                <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: colors[item.label] || "#ccc" }}></div>
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Handle post preview function
  const handlePostPreview = (post) => {
    // Convert post data to the format expected by the preview modal
    const previewData = {
      id: post.id,
      type: post.type,
      icon: post.type === "Image" ? ImageIcon : post.type === "Text" ? Text : Copy,
      date: post.dateLiked,
      imageUrl: post.thumbnail,
      thumbnail: post.thumbnail,
      creator: post.creator,
      caption: post.caption
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
            {previewItem.imageUrl ? (
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
            {previewItem.caption && (
              <div className="p-3 bg-white border-t border-gray-100">
                <p className="text-sm text-gray-700">{previewItem.caption}</p>
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
                  <Heart className="w-5 h-5" />
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
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-gray-900 truncate">
              Liked Posts
            </h1>
            <p className="text-sm text-gray-500 truncate">
              All posts liked by [Username]
            </p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-48">
              {renderStatCard("Total Liked Posts", (apiPosts.length ? apiPosts.length : likedPostsData.totalPosts), Heart)}
            </div>
            {/* <div className="relative hidden sm:block">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search posts..."
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
                  <option value="most_liked">Sort by: Most Liked</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
              <div className="relative">
                <select
                  value={postTypeFilter}
                  onChange={(e) => setPostTypeFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Post Types</option>
                  <option value="Image">Image</option>
                  <option value="Text">Text</option>
                  <option value="Carousel">Carousel</option>
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

          {/* Posts Gallery / Table Section */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            {!showTable ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredAndSortedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="group rounded-lg overflow-hidden border border-gray-200 transition-transform transform hover:scale-[1.02] active:scale-100 cursor-pointer"
                    onClick={() => handlePostPreview(post)}
                  >
                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                      <img
                        src={post.thumbnail}
                        alt={`Thumbnail for post from ${post.creator}`}
                        className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                      />
                      <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white p-1 rounded-full">
                        {post.type === "Image" && <ImageIcon size={16} />}
                        {post.type === "Text" && <Text size={16} />}
                        {post.type === "Carousel" && <Copy size={16} />}
                      </div>
                    </div>
                    <div className="p-3 bg-white">
                      <h4 className="text-sm font-semibold truncate">
                        {post.creator}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {post.caption}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Heart size={14} className="mr-1 text-red-500" />
                        <span>{post.likes.toLocaleString()} Likes</span>
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
                        Thumbnail
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Caption
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Creator
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Post Type
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
                    {filteredAndSortedPosts.map((post, index) => (
                      <tr 
                        key={post.id} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handlePostPreview(post)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={post.thumbnail}
                            alt="Post thumbnail"
                            className="w-12 h-12 object-cover rounded"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 truncate max-w-xs">
                          {post.caption}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {post.creator}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {post.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {post.dateLiked}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {post.likes.toLocaleString()}
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
            {renderBarChart("Liked Posts by Category", chartCategoryData)}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <LineChart size={18} className="mr-2 text-gray-500" />
                Posts Liked Over Time
              </h3>
              <div className="h-48 flex items-center justify-center text-gray-400">
                Timeline Graph Coming Soon
              </div>
            </div>
            {renderDonutChart("Post Type Split", chartPostTypeData)}
          </section> */}
        </main>
      </div>
    </div>
  )
}
