"use client"

import { useState,useEffect} from "react"
import { Eye, MessageCircle, User, Play, Video, FileText, X, ChevronRight, Heart } from "lucide-react"
import { GET_ACHIVE_STORIES_BY_USERS, GET_MY_STORIES } from "../../graphql/mutations"
import { useQuery, useMutation } from '@apollo/client';
import { GetTokenFromCookie } from '../../components/getToken/GetToken';

const StoryRecord = ({ onBack,selectedUser }) => {
  const [activeTab, setActiveTab] = useState("All Stories")
  const [token, setToken] = useState();
  const [previewItem, setPreviewItem] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
    useEffect(() => {
        const decodedUser = GetTokenFromCookie();
        if (decodedUser?.id) {
          setToken(decodedUser);
          
        }
      }, []);
    // Auto-refresh stories every 30 seconds to show newly uploaded stories
  
  // Use GET_MY_STORIES instead of GET_ACHIVE_STORIES_BY_USERS to get all user stories
  const { data: storyData, loading: storyLoading, error: storyError, refetch: refetchStories } = useQuery(GET_MY_STORIES, { 
    variables: { userId: selectedUser?.id },
    skip: !selectedUser?.id,
    fetchPolicy: 'cache-and-network'
  });
  console.log('My Stories Data:', storyData)

    useEffect(() => {
      if (!token?.id) return;
      
      const interval = setInterval(() => {
        refetchStories();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }, [token?.id, refetchStories]);
  // Sample data for stories
  const stories = [
    {
      id: 1,
      type: "audio",
      thumbnail: "/landscape-story.png",
      uploadDate: "15 Aug 2025",
      views: 1250,
      replies: 45,
      status: "Active",
    },
    {
      id: 2,
      type: "reel",
      thumbnail: "/majestic-castle-reel.png",
      uploadDate: "15 Aug 2025",
      views: 230,
      replies: 12,
      status: "Active",
    },
    {
      id: 3,
      type: "post",
      thumbnail: "/mountain-post.png",
      uploadDate: "15 Aug 2025",
      views: 310,
      replies: 8,
      status: "Active",
    },
    {
      id: 4,
      type: "comment",
      thumbnail: "/sunset-comment.png",
      uploadDate: "14 Aug 2025",
      views: 250,
      replies: 15,
      status: "Expired",
    },
  ]

  const tabs = ["All Stories"]

  const getTypeIcon = (type) => {
    switch (type) {
      case "audio":
        return "🎤"
      case "reel":
        return "🎬"
      case "post":
        return "📝"
      case "comment":
        return "💬"
      default:
        return "📄"
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case "audio":
        return "Audio"
      case "reel":
        return "Reel"
      case "post":
        return "Post"
      case "comment":
        return "Comment"
      default:
        return "Story"
    }
  }

  // Calculate percentages for pie chart
  const totalViews = 8940
  const reelViews = 2500
  const postViews = 3200
  const audioViews = 2140
  const commentViews = 1100

  const reelPercentage = (reelViews / totalViews) * 100
  const postPercentage = (postViews / totalViews) * 100
  const audioPercentage = (audioViews / totalViews) * 100
  const commentPercentage = (commentViews / totalViews) * 100

  // Create SVG path for donut chart
  const createPath = (startAngle, endAngle, innerRadius = 40, outerRadius = 64) => {
    const start = polarToCartesian(64, 64, outerRadius, endAngle)
    const end = polarToCartesian(64, 64, outerRadius, startAngle)
    const innerStart = polarToCartesian(64, 64, innerRadius, endAngle)
    const innerEnd = polarToCartesian(64, 64, innerRadius, startAngle)

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"

    return [
      "M",
      start.x,
      start.y,
      "A",
      outerRadius,
      outerRadius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      "L",
      innerEnd.x,
      innerEnd.y,
      "A",
      innerRadius,
      innerRadius,
      0,
      largeArcFlag,
      1,
      innerStart.x,
      innerStart.y,
      "Z",
    ].join(" ")
  }

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    }
  }



  const recentStories = [
    { date: "Aug 9", replies: 12 },
    { date: "Aug 10", replies: 8 },
    { date: "Aug 11", replies: 15 },
    { date: "Aug 12", replies: 6 },
    { date: "Aug 13", replies: 18 },
    { date: "Aug 14", replies: 10 },
    { date: "Aug 15", replies: 22 },
  ]

  const weeklyViews = [
    { day: "Mon", views: 1200 },
    { day: "Tue", views: 1450 },
    { day: "Wed", views: 1100 },
    { day: "Thu", views: 1650 },
    { day: "Fri", views: 1800 },
    { day: "Sat", views: 1350 },
    { day: "Sun", views: 1600 },
  ]

  // Convert backend stories to frontend format
  const convertedStories = storyData?.getMyStories?.map(story => ({
    id: story.id,
    type: story.mediaType === 'image' ? 'post' : story.mediaType === 'video' ? 'reel' : 'post',
    thumbnail: story.mediaUrl,
    uploadDate: new Date(story.createdAt).toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }),
    views: Math.floor(Math.random() * 1000) + 100, // Random views for now
    replies: Math.floor(Math.random() * 50), // Random replies for now
    status: new Date(story.expiresAt) > new Date() ? "Active" : "Expired",
    caption: story.caption,
    mediaUrl: story.mediaUrl,
    mediaType: story.mediaType,
    createdAt: story.createdAt,
    expiresAt: story.expiresAt,
    isArchived: story.isArchived
  })) || [];

    const activeStories = convertedStories.filter((story) => story.status === "Active")
  const expiredStories = convertedStories.filter((story) => story.status === "Expired")
  const totalStories = convertedStories.length

  const activePercentage = (activeStories.length / totalStories) * 100
  const expiredPercentage = (expiredStories.length / totalStories) * 100

  const filteredStories = () => {
    switch (activeTab) {
      case "Active Stories":
        return convertedStories.filter(story => story.status === "Active")
      case "Expired Stories":
        return convertedStories.filter(story => story.status === "Expired")
      default:
        return convertedStories
    }
  }

  const maxViews = Math.max(...weeklyViews.map(item => item.views))

  // Handle story preview function
  const handleStoryPreview = (story) => {
    // Convert story data to the format expected by the preview modal
    const previewData = {
      id: story.id,
      type: story.type === 'post' ? 'Image' : story.type === 'reel' ? 'Video' : 'Story',
      icon: story.type === 'post' ? FileText : story.type === 'reel' ? Video : FileText,
      date: story.uploadDate,
      videoUrl: story.mediaType === 'video' ? story.mediaUrl || story.thumbnail : null,
      imageUrl: story.mediaType === 'image' ? story.mediaUrl || story.thumbnail : null,
      thumbnail: story.thumbnail,
      title: story.caption || `${getTypeLabel(story.type)} Story`,
      creator: story.creator || '',
      views: story.views
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
          {/* Story Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                {previewItem.icon && <previewItem.icon className="w-5 h-5 text-[#B65FCF]" />}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{previewItem.type}</h3>
                {previewItem.date && <p className="text-xs text-gray-500">Uploaded on {previewItem.date}</p>}
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
          
          {/* Story Content */}
          <div className="relative">
            {previewItem.videoUrl ? (
              <div className="w-full aspect-video bg-gray-50">
                <video
                  src={previewItem.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>
            ) : previewItem.imageUrl ? (
              <div className="w-full aspect-video bg-gray-50">
                <img
                  src={previewItem.imageUrl}
                  alt={previewItem.title}
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
                {previewItem.icon && <previewItem.icon className="w-16 h-16 text-gray-300" />}
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
          
          {/* Story Actions */}
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
    <div className="min-h-screen bg-gray-50 font-inter">
      {renderPreviewModal()}
      {/* Header with Profile */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Side - Profile */}
            <div className="flex-1">
              {/* Profile removed */}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-900 font-inter tracking-tight">
                    {storyLoading ? '...' : totalStories}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Total Stories</div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-900 font-inter tracking-tight">
                    {storyLoading ? '...' : activeStories.length}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Active Stories</div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-900 font-inter tracking-tight">
                    {storyLoading ? '...' : expiredStories.length}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Expired Stories</div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex justify-between items-center border-b border-gray-200 mb-6">
                <div className="flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-4 px-1 text-sm font-medium transition-colors relative ${
                        activeTab === tab
                          ? "text-purple-600 border-b-2 border-purple-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                
                {/* Refresh Button */}
                {/* <button
                  onClick={() => refetchStories()}
                  disabled={storyLoading}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <svg className={`w-4 h-4 ${storyLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button> */}
              </div>

              {/* Recent Comments/Engagement Section */}
              {/* <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Engagement</h3>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <button className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full font-medium">
                    All Reels
                  </button>
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                    Posts
                  </button>
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                    Comments
                  </button>
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                    Audio Stories
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">
                      🎬
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">New comment on <span className="font-medium">Mountain Adventure Reel</span></p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                    <div className="text-sm text-gray-500">+5 replies</div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                      📝
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">New comment on <span className="font-medium">Sunset Photography Post</span></p>
                      <p className="text-xs text-gray-500">15 minutes ago</p>
                    </div>
                    <div className="text-sm text-gray-500">+3 replies</div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                      🎤
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">New comment on <span className="font-medium">Travel Story Audio</span></p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                    <div className="text-sm text-gray-500">+8 replies</div>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                    View All Comments
                  </button>
                </div>
              </div> */}
            </div>

            {/* Right Side - Analytics */}
            {/* <div className="lg:w-80 bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Total Stories</span>
                  <span className="font-bold text-gray-900 font-inter">
                    {storyLoading ? '...' : totalStories}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Active Stories</span>
                  <span className="font-bold text-gray-900 font-inter">
                    {storyLoading ? '...' : activeStories.length}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Story Status Distribution</h4>
                <div className="w-32 h-32 mx-auto mb-4 relative">
                  <svg width="128" height="128" className="transform -rotate-90">
                    <path
                      d={createPath(0, activePercentage * 3.6)}
                      fill="#10B981"
                      className="hover:opacity-80 transition-opacity"
                    />
                    <path
                      d={createPath(activePercentage * 3.6, 360)}
                      fill="#6B7280"
                      className="hover:opacity-80 transition-opacity"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900 font-inter tracking-tight">
                        {storyLoading ? '...' : totalStories}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">Total Stories</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Active</span>
                    </div>
                    <span className="font-medium">{activePercentage.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="text-gray-600">Expired</span>
                    </div>
                    <span className="font-medium">{expiredPercentage.toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Story Engagement</h4>
                <div className="flex items-end justify-between h-20 gap-1">
                  {recentStories.map((story, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="w-6 bg-purple-500 rounded-t"
                        style={{
                          height: `${(story.replies / 22) * 60}px`,
                          minHeight: "4px"
                        }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-1">{story.date.split(' ')[1]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Weekly Views</h4>
                <div className="flex items-end justify-between h-16 gap-1">
                  {weeklyViews.map((item, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="w-6 bg-blue-500 rounded-t"
                        style={{
                          height: `${(item.views / maxViews) * 48}px`,
                          minHeight: "4px"
                        }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-1">{item.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Main Content - Stories List */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="grid gap-4">
              {filteredStories().map((story) => (
                <div
                  key={story.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100 cursor-pointer"
                  onClick={() => handleStoryPreview(story)}
                >
                  {/* Story Thumbnail */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                      <img
                        src={story.thumbnail || "/placeholder.svg"}
                        alt={getTypeLabel(story.type)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs">
                      {getTypeIcon(story.type)}
                    </div>
                  </div>

                  {/* Story Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{getTypeLabel(story.type)} Story</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          story.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {story.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Uploaded on {story.uploadDate}</p>
                  </div>

                  {/* Story Stats */}
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{story.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{story.replies}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button 
                    className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStoryPreview(story);
                    }}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {storyLoading && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">⏳</div>
                <p className="text-gray-500">Loading your stories...</p>
              </div>
            )}

            {storyError && (
              <div className="text-center py-12">
                <div className="text-red-400 mb-2">❌</div>
                <p className="text-red-500">Error loading stories: {storyError.message}</p>
                <button 
                  onClick={() => refetchStories()}
                  className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Retry
                </button>
              </div>
            )}

            {!storyLoading && !storyError && filteredStories().length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">📚</div>
                <p className="text-gray-500">No stories found. Upload your first story!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoryRecord
