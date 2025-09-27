"use client"
import { useState, useEffect } from "react"
import { User, Heart, BookOpen, MessageCircle, Activity, ArrowLeft, Eye } from "lucide-react"
import LikeRecord from "./LikeRecord"
import StoryRecord from "./StoryRecord"
import CommentRecord from "./CommentRecord"
import ActivityRecord from "./ActivityRecord"
import Skeleton from "./Skeleton"
import { useQuery } from "@apollo/client"
import { GET_USER_LIKED_REELS, GET_USER_LIKED_VIDEOS, GET_USER_LIKED_POSTS } from "../../graphql/mutations"
import { GET_USER_COMMENTED_REELS, GET_USER_COMMENTED_VIDEOS, GET_USER_COMMENTED_POSTS } from "../../graphql/mutations"


const UserDetail = ({ selectedUser, onViewUser, onBackToUsers }) => {
  /* console.log(...) */ void 0
  const [activeTab, setActiveTab] = useState("Like Record")
  const [showLikeRecord, setShowLikeRecord] = useState(true)
  const [profileImageLoading, setProfileImageLoading] = useState(true)
  const[likeCount,setLikeCount] = useState(0);
  const[commentCount,setCommentCount]=useState(0);

  const { data: reelData } = useQuery(GET_USER_LIKED_REELS, { variables: { userId: selectedUser?.id } })
    const { data: videoData } = useQuery(GET_USER_LIKED_VIDEOS, { variables: { userId: selectedUser?.id } })
    const { data: postData } = useQuery(GET_USER_LIKED_POSTS, { variables: { userId: selectedUser?.id } })
      const { data: reelCommentData } = useQuery(GET_USER_COMMENTED_REELS, { variables: { userId: selectedUser?.id } })
  const { data: videoCommentData } = useQuery(GET_USER_COMMENTED_VIDEOS, { variables: { userId: selectedUser?.id } })
  const { data: postCommentData } = useQuery(GET_USER_COMMENTED_POSTS, { variables: { userId: selectedUser?.id } })


      let apiCommentReelItems = (reelCommentData?.getUserCommentedReels || [])
    
      let apiCommentVideoItems = (videoCommentData?.getUserCommentedVideos || [])
    
      let apiCommentPostItems = (postCommentData?.getUserCommentedPosts || [])
    
      let CommentItems = [...apiCommentReelItems, ...apiCommentVideoItems, ...apiCommentPostItems];

let totalCommentItemsLength = CommentItems.length;

// Step 6: Handle fallback if all arrays are empty
let finalCommentItems = totalCommentItemsLength > 0 ? CommentItems : 0;



      // Step 1: Map reel data
let apiReelItems = (reelData?.getUserLikedReels || [])

// Step 2: Map video data
let apiVideoItems = (videoData?.getUserLikedVideos || [])

// Step 3: Map post data
let apiPostItems = (postData?.getUserLikedPosts || [])

// Step 4: Merge all liked items
let likedItems = [...apiReelItems, ...apiVideoItems, ...apiPostItems];

// Step 5: Total liked items length
let totalLikedItemsLength = likedItems.length;

// Step 6: Handle fallback if all arrays are empty
let finalLikedItems = totalLikedItemsLength > 0 ? likedItems : 0;
  

    useEffect(()=>{
        if(finalLikedItems?.length>0){
            setLikeCount(finalLikedItems?.length);
        }

         if(finalCommentItems?.length>0){
            setCommentCount(finalCommentItems?.length);
        }
    },[finalLikedItems,finalCommentItems])


        

  useEffect(() => {
    const imageTimer = setTimeout(() => {
      setProfileImageLoading(false)
    }, 800)
    return () => clearTimeout(imageTimer)
  }, [])

  const tabs = [
    { name: "Like Record", icon: Heart },
    { name: "Story Record", icon: BookOpen },
    { name: "Comment Record", icon: MessageCircle },
  ]

  const handleTabClick = (tabName) => {
    setActiveTab(tabName)
    if (tabName === "Like Record") {
      setShowLikeRecord(true)
    }
  }

  const handleBackFromLikeRecord = () => {
    setShowLikeRecord(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 sm:gap-6">
            <div className="flex flex-col items-center">
              {profileImageLoading ? (
                <Skeleton variant="circle" className="w-24 h-24 mb-3" />
              ) : selectedUser?.profileImage ? (
                <img 
                  src={selectedUser.profileImage || selectedUser?.name?.charAt(0) } 
                  alt={selectedUser.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-lg mb-3"
                  onError={(e) => {
                    // If image fails to load, show first letter instead
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg mb-3">
                  <span className="text-3xl font-bold text-white">
                    {selectedUser?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              {selectedUser?.profileImage && (
                <div 
                  className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg mb-3" 
                  style={{ display: 'none' }}
                >
                  <span className="text-3xl font-bold text-white">
                    {selectedUser?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              <button
                onClick={() => onBackToUsers && onBackToUsers()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Users</span>
              </button>
            </div>
            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{selectedUser?.name || 'Unknown User'}</h1>
                  <p className="text-gray-600 text-sm sm:text-base">{selectedUser?.username || '@unknown'}</p>
                </div>
                <button
                  onClick={() => onViewUser && onViewUser()}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B65FCF] transition-colors mx-auto lg:mx-0"
                >
                  <Eye className="mr-2" size={16} />
                  View User
                </button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4">
                 <div  className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-gray-900">{likeCount}</div>
                    <div className="text-sm text-gray-600">Total Likes</div>
                  </div>

                    <div  className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-gray-900">{commentCount}</div>
                    <div className="text-sm text-gray-600">Total Comments</div>
                  </div>

                    <div  className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-gray-900">{selectedUser?.following?.length}</div>
                    <div className="text-sm text-gray-600">Total Following</div>
                  </div>

                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-gray-900">{selectedUser?.followers?.length}</div>
                    <div className="text-sm text-gray-600">Total Followers</div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          {/* Mobile Tab Bar - Grid Layout */}
          <div className="md:hidden">
            <div className="grid grid-cols-2 gap-1 p-2">
              {tabs.map((tab, index) => {
                const IconComponent = tab.icon
                const isActive = activeTab === tab.name
                return (
                  <button
                    key={tab.name}
                    onClick={() => handleTabClick(tab.name)}
                    className={`flex flex-col items-center gap-2 px-3 py-4 font-medium text-xs border-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "text-[#B65FCF] border-[#B65FCF] bg-purple-50"
                        : "text-gray-600 border-gray-200 hover:text-gray-900 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <IconComponent className="w-6 h-6" />
                    <span className="text-center leading-tight">
                      {tab.name.split(' ').map((word, i) => (
                        <span key={i} className="block">
                          {word}
                        </span>
                      ))}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
          
          {/* Desktop Tab Bar */}
          <div className="hidden md:flex overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              const isActive = activeTab === tab.name
              return (
                <button
                  key={tab.name}
                  onClick={() => handleTabClick(tab.name)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors duration-200 ${
                    isActive
                      ? "text-[#B65FCF] border-[#B65FCF] bg-purple-50"
                      : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto p-3 sm:p-4 lg:p-6">
        {activeTab === "Like Record" ? (
          <LikeRecord onBack={handleBackFromLikeRecord}  selectedUser={selectedUser} />
        ) : activeTab === "Story Record" ? (
          <StoryRecord selectedUser={selectedUser} />
        ) : activeTab === "Comment Record" ? (
          <CommentRecord selectedUser={selectedUser} />
        ) : activeTab === "Activity Record" ? (
          <ActivityRecord />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            Content for {activeTab} will be displayed here
          </div>
        )}
      </div>
    </div>
  )
}

export default UserDetail
