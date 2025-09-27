import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { FOLLOW_AND_UNFOLLOW,SEND_FOLLOW_REQUEST_MUTATION, SUGGESTED_USERS, BLOCK_USER, UNBLOCK_USER } from '../../graphql/mutations'; // ✅ make sure path is correct

import { FaSearch, FaUser, FaTimes, FaHeart, FaComment, FaPaperPlane, FaThumbsUp } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { GetTokenFromCookie } from '../getToken/GetToken';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [realSuggestion, setRealSuggestion] = useState([]);
  const navigate = useNavigate();
  const token = sessionStorage.getItem('user');
  const suggestionsRowRef = React.useRef(null);
  const [showLeftArrow, setShowLeftArrow] = React.useState(false);
  const [showRightArrow, setShowRightArrow] = React.useState(false);
  const [tokenUser, setTokenUser] = useState();



  let tokens = "";
  useEffect(() => {
    const decodedUser = GetTokenFromCookie();
    tokens = decodedUser?.id

    if (decodedUser?.id) {
      setTokenUser(decodedUser)
    }
  }, [])

  // Fetch user suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!tokenUser?.id) return;
      
      try {
        setIsLoading(true);
        const res = await axios.post('http://localhost:5000/graphql', {
          query: `
          query GetSuggestions($userId: ID!) {
            suggestedUsers(userId: $userId) {
              id
              name
              profileImage
              username
              followers { id name }
              following { id name }
              posts { 
                id 
                caption 
                imageUrl 
                createdAt 
                likes {
                  user {
                    id
                    name
                  }
                  likedAt
                }
                comments {
                  id
                  text
                  user {
                    id
                    name
                  }
                  commentedAt
                }
              }
            }
          }
        `,
          variables: { userId: tokenUser.id }
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (res.data?.data?.suggestedUsers) {
          setRealSuggestion({ suggestedUsers: res.data.data.suggestedUsers });
        }
      } catch (err) {
        console.error("Error fetching suggestions:", err.response?.data || err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [tokenUser?.id]);

  // Real user suggestions from the server
  const dummySuggestions = []; // Keep empty as we'll use real suggestions
  // Always use real suggestions if available, otherwise show empty
  const suggestedUsers = realSuggestion?.suggestedUsers || [];
  const suggestionsToShow = suggestedUsers;

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [navigate, token]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        const loaded = JSON.parse(saved);
        setRecentSearches(loaded);
        // Try to update with latest data from searchResults if available
        setSearchResults(prevResults => {
          if (!prevResults || prevResults.length === 0) return prevResults;
          const updated = loaded.map(item => {
            const latest = prevResults.find(u => u.id === item.id);
            return latest ? latest : item;
          });
          setRecentSearches(updated);
          localStorage.setItem('recentSearches', JSON.stringify(updated));
          return prevResults;
        });
      }
    } catch (error) {
      console.error("Error loading recent searches from localStorage:", error);
      // Reset to empty array if there's an error
      setRecentSearches([]);
    }
  }, []);

  useEffect(() => {
    try {
      if (recentSearches.length > 0) {
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
      }
    } catch (error) {
      console.error("Error saving recent searches to localStorage:", error);
    }
  }, [recentSearches]);

  // Debounce function with proper this binding
  const debounce = (func, delay) => {
    let timeoutId;
    return function(...args) {
      const context = this;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(context, args);
      }, delay);
    };
  };

  const handleSearch = async (query = searchQuery) => {
    const searchTerm = query.trim();
    
    // Always reset states before new search
    setSearchResults([]);
    setShowSuggestions(false);
    
    if (!searchTerm) {
      setShowSuggestions(true);
      return;
    }
    
    if (!tokenUser?.id) {
      return;
    }
    setIsLoading(true);
    setShowSuggestions(false);

    const graphqlQuery = `
      query searchUsers($username: String!,$userId: ID!) {
        searchUsers(username: $username, userId: $userId) {
          id
          name
          username
          email
          phone
          profileImage
          isPrivate
          bio
          is_blocked
          createTime
          followers { id name }
          following { id name }
          posts { 
            id 
            caption 
            imageUrl 
            createdAt 
            likes {
              user {
                id
                name
              }
              likedAt
            }
            comments {
              id
              text
              user {
                id
                name
              }
              commentedAt
            }
          }
        }
      }
    `;

    /* console.log(...) */ void 0;

    try {
      const response = await axios.post(
        'http://localhost:5000/graphql',
        { query: graphqlQuery, variables: { username: query, userId: tokenUser?.id } },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      /* console.log(...) */ void 0;
      const { data, errors } = response.data;

      if (data?.searchUsers) {
        const blockedUser = data.searchUsers.find(
          (user) => user.name.toLowerCase() === query.toLowerCase() && user.is_blocked
        );

        if (blockedUser) {
          return;
        }
      }


      if (errors && errors.length > 0) {
        /* console.log(...) */ void 0;
        setSearchResults([]);
      } else if (data?.searchUsers) {
        /* console.log(...) */ void 0;
        // Debug: Print all comments for each post
        data.searchUsers.forEach(user => {
          if (user.posts) {
            user.posts.forEach(post => {
              /* console.log(...) */ void 0;
            });
          }
        });

        // Check the structure of the first user's posts to debug
        if (data.searchUsers.length > 0 && data.searchUsers[0].posts) {
          /* console.log(...) */ void 0;

          // Check the structure of likes and comments in the first post
          const firstPost = data.searchUsers[0].posts[0];
          if (firstPost) {
            /* console.log(...) */ void 0;
            /* console.log(...) */ void 0;
          }
        }

        const validUsers = data.searchUsers
          .filter(user => user && user.id && user.name)
          .filter(user => user.name !== "Unknown User" && user.username !== "unknown_user") // Filter out blocked users
          .map(user => {
          // Process each post to ensure likes and comments are properly structured
          const processedPosts = (user.posts || []).map(post => {
            // Make sure likes and comments are arrays
            const postLikes = Array.isArray(post.likes) ? post.likes : [];
            // Filter out invalid comments and ensure structure
            const postComments = Array.isArray(post.comments)
              ? post.comments.filter(c => c && c.text && c.user && c.user.name)
              : [];
            return {
              ...post,
              likes: postLikes,
              comments: postComments,
              likesCount: postLikes.length,  // Add explicit count properties
              commentsCount: postComments.length
            };
          });
          return {
            ...user,
            name: user.name || 'Unknown User',
            username: user.username || '',
            email: user.email || '',
            phone: user.phone || '',
            profileImage: user.profileImage || '',
            bio: user.bio || '',
            createTime: user.createTime || new Date().toISOString(),
            followers: user.followers || [],
            following: user.following || [],
            posts: processedPosts
          };
        });

        setSearchResults(validUsers);
        // Always update recentSearches with latest data from validUsers
        setRecentSearches(prev => {
          const updated = prev.map(item => {
            const latest = validUsers.find(u => u.id === item.id);
            return latest ? latest : item;
          });
          localStorage.setItem('recentSearches', JSON.stringify(updated));
          return updated;
        });

        validUsers.forEach(user => {
          if (!recentSearches.find(item => item.id === user.id)) {
            setRecentSearches(prev => [user, ...prev.slice(0, 4)]);
          }
        });
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize the debounced search function
  const debouncedSearch = React.useMemo(
    () => 
      debounce((query) => {
        handleSearch(query);
      }, 300),
    [tokenUser?.id] // Recreate when user changes
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Handle empty query immediately
    if (!value.trim()) {
      setSearchResults([]);
      setShowSuggestions(true);
      return;
    }
    
    // Trigger debounced search
    debouncedSearch(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSuggestions(true);
    setSelectedUser(null);
    setShowUserDetails(false);
  };

  const removeRecentSearch = (id) => {
    setRecentSearches(prev => prev.filter(item => item.id !== id));
  };

  const handleRecentSearchClick = (user) => {
    setSearchQuery(user.name);
    handleSearch(user.name);
  };

  const handleUserClick = (user) => {
    // Find the latest user object from searchResults by ID
    const latestUser = searchResults.find(u => u.id === user.id) || user;
    setSelectedUser(latestUser);
    setShowUserDetails(true);
  };

  const closeUserDetails = () => {
    setSelectedUser(null);
    setShowUserDetails(false);
  };

  // Update arrow visibility based on scroll position
  const updateArrowVisibility = () => {
    try {
      const container = suggestionsRowRef.current;
      if (!container) return;
      setShowLeftArrow(container.scrollLeft > 10);
      setShowRightArrow(container.scrollWidth - container.scrollLeft - container.clientWidth > 10);
    } catch (error) {
      console.error("Error updating arrow visibility:", error);
    }
  };

  React.useEffect(() => {
    try {
      updateArrowVisibility();
      const container = suggestionsRowRef.current;
      if (!container) return;

      try {
        container.addEventListener('scroll', updateArrowVisibility);
        window.addEventListener('resize', updateArrowVisibility);
      } catch (error) {
        console.error("Error adding event listeners:", error);
      }

      return () => {
        try {
          container.removeEventListener('scroll', updateArrowVisibility);
          window.removeEventListener('resize', updateArrowVisibility);
        } catch (error) {
          console.error("Error removing event listeners:", error);
        }
      };
    } catch (error) {
      console.error("Error in arrow visibility effect:", error);
    }
  }, []);

  // Update arrow visibility when suggestions change
  React.useEffect(() => {
    try {
      const timer = setTimeout(updateArrowVisibility, 100);
      return () => clearTimeout(timer);
    } catch (error) {
      console.error("Error updating arrow visibility:", error);
    }
  }, [suggestionsToShow]);

  // Scroll handler for arrows
  const scrollSuggestions = (direction) => {
    try {
      const container = suggestionsRowRef.current;
      if (!container) return;
      const scrollAmount = 220 + 24; // card width + gap
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    } catch (error) {
      console.error("Error scrolling suggestions:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-3">
      <div className="max-w-4xl mx-auto">
        {/* Search Input with Back Button */}
        <div className="flex items-center gap-1.5 mb-4">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-sm" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Search users..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-transparent"
            />
            {isLoading && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        {!isLoading && searchResults.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Results ({searchResults.length})
            </h2>
            <div className="space-y-2">
              {searchResults.map((user) => (
                <UserCard key={user.id} user={user} onClick={() => handleUserClick(user)} />
              ))}
            </div>
          </div>
        )}
        {/* No Results */}
        {!isLoading && searchQuery && searchResults.length === 0 && (
          <div className="text-center py-8">
            <FaUser className="mx-auto text-4xl text-gray-300 mb-2" />
            <h3 className="text-lg font-semibold text-gray-600">No users found</h3>
          </div>
        )}
        {/* Suggestions */}
        {!isLoading && !searchQuery && showSuggestions && suggestionsToShow.length > 0 && (
          <div className="mt-6 relative">
            <h3 className="text-base font-semibold text-gray-700 mb-3">Suggestions</h3>
            <div
              ref={suggestionsRowRef}
              className="flex flex-row gap-4 overflow-x-auto pb-1 no-scrollbar md:scroll-smooth"
              style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {suggestionsToShow.map((user) => (
                <SuggestionCard
                  key={user?.id}
                  user={user}
                  onCardClick={() => handleRecentSearchClick(user)}
                  onProfileClick={() => handleUserClick(user)}
                />
              ))}
            </div>
            {/* Arrows removed as requested */}
          </div>
        )}
        {/* Recent Searches */}
        {!isLoading && !searchQuery && showSuggestions && recentSearches.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Searches</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentSearches.map((user) => (
                <RecentSearchCard
                  key={user.id}
                  user={user}
                  onClick={() => handleUserClick(user)}
                  onRemove={() => removeRecentSearch(user.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={closeUserDetails}
          updateUser={(updatedUser) => setSelectedUser(updatedUser)}
          setRecentSearches={setRecentSearches}
          persistUserInLists={(updatedUser) => {
            // Update searchResults list
            setSearchResults(prev => prev.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u));

            // Update recent searches list and localStorage
            setRecentSearches(prev => {
              const updated = prev.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u);
              try { localStorage.setItem('recentSearches', JSON.stringify(updated)); } catch { }
              return updated;
            });

            // Update suggestions if present in realSuggestion
            setRealSuggestion(prev => {
              if (!prev || !Array.isArray(prev.suggestedUsers)) return prev;
              const updatedSuggestions = prev.suggestedUsers.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u);
              return { ...prev, suggestedUsers: updatedSuggestions };
            });
          }}
          updateRecentSearches={(updatedUser) => {
            // Force update recent searches immediately
            setRecentSearches(prev => {
              const updated = prev.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u);
              try { localStorage.setItem('recentSearches', JSON.stringify(updated)); } catch { }
              return updated;
            });
          }}
        />
      )}
    </div>
  );
};

const UserCard = ({ user, onClick }) => {
  // Don't render blocked users
  if (user.name === "Unknown User" || user.username === "unknown_user") {
    return null;
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center space-x-3">
        {/* Profile Image */}
        <div className="flex-shrink-0">
          <img
            src={user.profileImage || 'https://ui-avatars.com/api/?name=User&background=random'}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover border border-gray-200"
          />
        </div>
        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-medium text-gray-900 truncate">{user.name}</h3>
            {user.username && (
              <span className="text-xs text-gray-500">@{user.username}</span>
            )}
          </div>
          {user.bio && (
            <p className="text-gray-600 text-xs mt-1 line-clamp-1">{user.bio}</p>
          )}
          <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
            {user.followers && <span>{user.followers.length} followers</span>}
            {user.following && <span>{user.following.length} following</span>}
          </div>
        </div>
        {/* Action Button */}
        <div className="flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onClick(); }}
            className="bg-purple-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-purple-700 transition-colors"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
};

const RecentSearchCard = ({ user, onClick, onRemove }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3" onClick={onClick}>
        <img
          src={user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Guest')}&background=random`
          }
          alt={user?.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <h4 className="font-medium text-gray-900">{user?.name}</h4>
          {user?.username && <p className="text-sm text-gray-500">@{user?.username}</p>}
        </div>
      </div>
      <button
        onClick={onRemove}
        className="text-gray-400 hover:text-red-500 transition-colors"
      >
        <FaTimes />
      </button>
    </div>
  </div>
);

// Debug helper function
const debugPostData = (post) => {
  if (!post) return "No post data";

  const likesInfo = Array.isArray(post.likes)
    ? `${post.likes.length} likes (array)`
    : `likes: ${typeof post.likes} (not array)`;

  const commentsInfo = Array.isArray(post.comments)
    ? `${post.comments.length} comments (array)`
    : `comments: ${typeof post.comments} (not array)`;

  return `Post ${post.id}: ${likesInfo}, ${commentsInfo}`;
};

const UserDetailsModal = ({ user, onClose, updateUser, setRecentSearches, persistUserInLists, updateRecentSearches }) => {

  const [followUser] = useMutation(FOLLOW_AND_UNFOLLOW);
  const loggedInUserId = JSON.parse(sessionStorage.getItem('user'))?.id;
  const loggedInUser = JSON.parse(sessionStorage.getItem('user'));
  
  // Initialize isFollowing based on whether the current user is in the followers list
  const [isFollowing, setIsFollowing] = useState(
    user?.followers?.some(follower => follower.id === loggedInUserId) || false
  );
  
  const [isBlocked, setIsBlocked] = useState(false);
  const [followersCount, setFollowersCount] = useState(user?.followers?.length || 0);
  const [followingCount, setFollowingCount] = useState(user?.following?.length || 0);
  const [followLoading, setFollowLoading] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'followers', 'following'
  const [hasRequestedFollow, setHasRequestedFollow] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showCommentInput, setShowCommentInput] = useState({});
  const [commentText, setCommentText] = useState({});
  const [tokenUser, setTokenUser] = useState();
  const [temp, setTemp] = useState(false)

  const [block] = useMutation(BLOCK_USER);
  const [unblock] = useMutation(UNBLOCK_USER);
    // const [sendFollowRequest] = useMutation(SEND_FOLLOW_REQUEST_MUTATION);
const [sendFollowRequest] = useMutation(SEND_FOLLOW_REQUEST_MUTATION);

  useEffect(() => {
    const decodedUser = GetTokenFromCookie();

    if (decodedUser?.id) {
      setTokenUser(decodedUser)
    }
  }, [])


  // Initialize with data from user object if available
  const initialLikesMap = {};
  const initialCommentsMap = {};
  const initialLikedMap = {};

  if (user?.posts) {
    user.posts.forEach(post => {
      // Use explicit count properties if available, otherwise calculate from arrays
      initialLikesMap[post.id] = post.likesCount !== undefined ? post.likesCount :
        (Array.isArray(post.likes) ? post.likes.length : 0);

      initialCommentsMap[post.id] = post.commentsCount !== undefined ? post.commentsCount :
        (Array.isArray(post.comments) ? post.comments.length : 0);

      initialLikedMap[post.id] = Array.isArray(post.likes) && post.likes.some(like => like.user?.id === loggedInUserId);

      console.log(`UserDetailsModal - Post ${post.id} initialized with:`, {
        likesCount: initialLikesMap[post.id],
        commentsCount: initialCommentsMap[post.id],
        isLiked: initialLikedMap[post.id]
      });
    });
    /* console.log(...) */ void 0;
    /* console.log(...) */ void 0;
  }

  const [postLikes, setPostLikes] = useState(initialLikesMap);
  const [postComments, setPostComments] = useState(initialCommentsMap);
  const [isLiked, setIsLiked] = useState(initialLikedMap);

  useEffect(() => {
    /* console.log(...) */ void 0;
    /* console.log(...) */ void 0;


    // Initialize post states
    if (user?.posts) {
      const likesMap = {};
      const commentsMap = {};
      const likedMap = {};
      const commentInputMap = {};
      const commentTextMap = {};

      /* console.log(...) */ void 0;

      user.posts.forEach(post => {
        /* console.log(...) */ void 0;
        console.log("UserDetailsModal - Post data:", {
          likesCount: post.likesCount,
          commentsCount: post.commentsCount,
          likesArray: post.likes,
          commentsArray: post.comments
        });

        // Use explicit count properties if available, otherwise calculate from arrays
        const likesCount = post.likesCount !== undefined ? post.likesCount :
          (Array.isArray(post.likes) ? post.likes.length : 0);

        const commentsCount = post.commentsCount !== undefined ? post.commentsCount :
          (Array.isArray(post.comments) ? post.comments.length : 0);

        /* console.log(...) */ void 0;

        // Store counts in state maps
        likesMap[post.id] = likesCount;
        commentsMap[post.id] = commentsCount;

        // Check if the current user has liked this post
        const userLiked = Array.isArray(post.likes) && post.likes.some(like => like.user?.id === loggedInUserId);
        likedMap[post.id] = userLiked;

        // Initialize UI state
        commentInputMap[post.id] = false;
        commentTextMap[post.id] = '';
      });


      // Update all state at once
      setPostLikes(likesMap);
      setPostComments(commentsMap);
      setIsLiked(likedMap);
      setShowCommentInput(commentInputMap);
      setCommentText(commentTextMap);
      setSelectedPost(null); // Reset selected post when user changes
    }
  }, [user, loggedInUserId]);

  // Only update local follow UI when the viewed user actually changes,
  // and only if user hasn't interacted yet.
  useEffect(() => {
    if (!userInteracted) {
      setIsFollowing(Boolean(user?.followers?.some(f => f.id === loggedInUserId)));
    }
    setFollowersCount(user?.followers?.length || 0);
  }, [user?.id, userInteracted]);

  // Listen for follow request acceptance/rejection
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'followRequestUpdate' && e.newValue) {
        const updateData = JSON.parse(e.newValue);
        if (updateData.targetUserId === user?.id && updateData.requesterId === loggedInUserId) {
          if (updateData.action === 'accepted') {
            setIsFollowing(true);
            setHasRequestedFollow(false);
            // Refresh user data to get updated followers list
            window.location.reload();
          } else if (updateData.action === 'rejected') {
            setHasRequestedFollow(false);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user?.id, loggedInUserId]);


  // const handlePrivateButtonClick = async () => {
  //   if (followLoading || hasRequestedFollow) return;
    
  //   setFollowLoading(true);
  //   try {
  //     await axios.post('http://localhost:5000/graphql', {
  //       query: `
  //         mutation SendFollowRequest($privateUserId: ID!, $requesterId: ID!, $requesterName: String!) {
  //           sendFollowRequest(privateUserId: $privateUserId, requesterId: $requesterId, requesterName: $requesterName) {
  //             id
  //             message
  //             success
  //           }
  //         }
  //       `,
  //       variables: {
  //         privateUserId: user.id,
  //         requesterId: loggedInUserId,
  //         requesterName: loggedInUser?.name || 'Someone'
  //       }
  //     });
      
  //     setHasRequestedFollow(true);
  //     /* console.log(...) */ void 0;
  //   } catch (error) {
  //     console.error('Error sending follow request:', error);
  //   } finally {
  //     setFollowLoading(false);
  //   }
  // };



  const handlePrivateButtonClick = async () => {
    /* console.log(...) */ void 0;
  if (followLoading || hasRequestedFollow) return;

  try {
    const { data } = await sendFollowRequest({
      variables: {
        privateUserId: user?.id,
        requesterId: tokenUser?.id,
        requesterName: tokenUser?.name,
      }
    });

    if (data?.sendFollowRequest?.success) {
      setHasRequestedFollow(true);
      /* console.log(...) */ void 0;
    } else {
      console.error('Failed to send follow request');
    }
  } catch (error) {
    console.error('Error sending follow request:', error);
  }
};

  const handleFollowToggle = async () => {
    if (followLoading) return;
    setFollowLoading(true);

    const currentIsFollowing = isFollowing;
    const currentFollowersCount = user.followers?.length || 0;

    try {
      // Get current state before making changes
      
      // Toggle the following state
      const newIsFollowing = !currentIsFollowing;
      
      // Update the local state immediately for a responsive UI
      setIsFollowing(newIsFollowing);
      
      // Calculate new followers count (ensure it doesn't go below 0)
      const newFollowersCount = newIsFollowing 
        ? Math.max(0, currentFollowersCount + 1) 
        : Math.max(0, currentFollowersCount - 1);
      
      setFollowersCount(newFollowersCount);

      // Update following count
      const currentFollowingCount = user.following?.length || 0;
      const newFollowingCount = newIsFollowing
        ? currentFollowingCount + 1
        : Math.max(0, currentFollowingCount - 1);
      setFollowingCount(newFollowingCount);
      
      // Update the user object in the parent component
      const updatedUser = {
        ...user,
        followers: newIsFollowing
          ? [...(user.followers || []), { id: loggedInUserId, name: loggedInUser?.name }]
          : (user.followers || []).filter(f => f.id !== loggedInUserId),
        // Correctly update the 'following' array as well
        following: newIsFollowing
          ? [...(user.following || []), { id: user.id, name: user.name }]
          : (user.following || []).filter(f => f.id !== user.id)
      };
      
      // Update the user in the parent component
      updateUser(updatedUser);
      persistUserInLists(updatedUser);
      updateRecentSearches(updatedUser);
      
      // Make the API call
      const { data } = await followUser({ 
        variables: { id: user.id }
      });

      if (data?.followAndUnfollow) {
        console.log('✅ Follow/Unfollow successful in search page');
        
        // Update local state with server response if available
        const serverUser = data.followAndUnfollow;
        if (serverUser.followers) {
          setIsFollowing(serverUser.followers.some(f => f.id === loggedInUserId));
          setFollowersCount(serverUser.followers?.length || 0);
        }
        if (serverUser.following) {
          setFollowingCount(serverUser.following?.length || 0);
        }
        
        // Trigger global profile update event
        window.dispatchEvent(new CustomEvent('profileUpdated', {
          detail: { userId: user.id, action: newIsFollowing ? 'follow' : 'unfollow' }
        }));
      }
      
    } catch (err) {
      console.error('Follow/Unfollow error:', err.message);
      // Revert the UI if there's an error
      setIsFollowing(currentIsFollowing);
      setFollowersCount(currentFollowersCount);
      setFollowingCount(user.following?.length || 0);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleBlockUser = async (userId) => {
    if(!tokenUser?.id || !userId){return}
    try {
      const { data } = await block({
        variables: { userId: tokenUser?.id, targetUserId: userId }
      });
        setIsBlocked(true);

      if (data?.blockUser) {
        /* console.log(...) */ void 0;

        // Close the user details modal
        // setSelectedUser(null);
        // setShowUserDetails(false);
        // Optionally remove from search results
        // setSearchResults(prev => prev.filter(user => user.id !== userId));
      }
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const handleLikePost = async (postId) => {
    // Find the post
    const post = user.posts.find(p => p.id === postId);
    if (!post) return;

    // Update UI optimistically
    const newIsLiked = !isLiked[postId];

    // Get current likes count from the most reliable source
    let currentLikes = 0;
    if (post.likesCount !== undefined) {
      currentLikes = post.likesCount;
    } else if (typeof postLikes[postId] === 'number') {
      currentLikes = postLikes[postId];
    } else if (Array.isArray(post.likes)) {
      currentLikes = post.likes.length;
    }

    const newLikeCount = newIsLiked ? currentLikes + 1 : currentLikes - 1;

    /* console.log(...) */ void 0;

    // Update state immediately for responsive UI
    setIsLiked(prev => ({ ...prev, [postId]: newIsLiked }));
    setPostLikes(prev => ({ ...prev, [postId]: newLikeCount }));

    // Also update the post object's explicit count
    if (post.likesCount !== undefined) {
      post.likesCount = newLikeCount;
    }

    try {
      // Send request to backend - using the same format as in Main.js
      const query = `mutation LikePost($userId: ID!, $postId: ID!) { 
        LikePost(userId: $userId, postId: $postId)
      }`;

      const variables = { userId: loggedInUserId, postId };

      const response = await axios.post("http://localhost:5000/graphql",
        { query, variables },
        { headers: { 'Content-Type': 'application/json' } }
      );

      /* console.log(...) */ void 0;

      // Update the user object to reflect the like change
      const updatedUser = { ...user };
      const postIndex = updatedUser.posts.findIndex(p => p.id === postId);

      if (postIndex !== -1) {
        // Make sure likes array exists
        if (!Array.isArray(updatedUser.posts[postIndex].likes)) {
          updatedUser.posts[postIndex].likes = [];
        }

        // If the user has liked the post, add their like
        if (newIsLiked) {
          updatedUser.posts[postIndex].likes.push({
            user: {
              id: loggedInUserId,
              name: loggedInUser?.name || 'You'
            },
            likedAt: new Date().toISOString()
          });
        } else {
          // If the user has unliked the post, remove their like
          updatedUser.posts[postIndex].likes = updatedUser.posts[postIndex].likes.filter(
            like => like.user?.id !== loggedInUserId
          );
        }

        // Update the user object
        updateUser(updatedUser);
      }
    } catch (err) {
      console.error("Error liking post:", err);
      // Revert UI changes on error
      setIsLiked(prev => ({ ...prev, [postId]: !newIsLiked }));
      setPostLikes(prev => ({
        ...prev,
        [postId]: newIsLiked ? currentLikes - 1 : currentLikes + 1
      }));
    }
  };

  const handleCommentToggle = (postId) => {
    setShowCommentInput(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();

    if (!commentText[postId]?.trim()) return;

    const text = commentText[postId].trim();

    // Find the post
    const post = user.posts.find(p => p.id === postId);
    if (!post) return;

    // Get current comments count from the most reliable source
    let currentComments = 0;
    if (post.commentsCount !== undefined) {
      currentComments = post.commentsCount;
    } else if (typeof postComments[postId] === 'number') {
      currentComments = postComments[postId];
    } else if (Array.isArray(post.comments)) {
      currentComments = post.comments.length;
    }

    const newCommentCount = currentComments + 1;

    /* console.log(...) */ void 0;

    // Update UI optimistically
    setPostComments(prev => ({ ...prev, [postId]: newCommentCount }));

    // Also update the post object's explicit count
    if (post.commentsCount !== undefined) {
      post.commentsCount = newCommentCount;
    }

    // Clear comment input
    setCommentText(prev => ({ ...prev, [postId]: '' }));

    try {
      // Send request to backend - using the same format as in Main.js
      const query = `mutation CommentPost($userId: ID!, $postId: ID!, $text: String!) { 
        CommentPost(userId: $userId, postId: $postId, text: $text) {
          text
          commentedAt
          user {
            name
            username
            profileImage
          }
        }
      }`;

      const variables = {
        userId: loggedInUserId,
        postId,
        text: text
      };

      const response = await axios.post("http://localhost:5000/graphql",
        { query, variables },
        { headers: { 'Content-Type': 'application/json' } }
      );

      /* console.log(...) */ void 0;

      // Update the user object with the new comment
      const updatedUser = { ...user };
      const postIndex = updatedUser.posts.findIndex(p => p.id === postId);

      if (postIndex !== -1) {
        // Make sure comments array exists
        if (!Array.isArray(updatedUser.posts[postIndex].comments)) {
          updatedUser.posts[postIndex].comments = [];
        }

        // Add the new comment to the post
        updatedUser.posts[postIndex].comments.push({
          id: `temp-${Date.now()}`,
          text: text,
          user: {
            id: loggedInUserId,
            name: loggedInUser?.name || 'You',
            username: loggedInUser?.username,
            profileImage: loggedInUser?.profileImage
          },
          commentedAt: new Date().toISOString()
        });

        // Update the user object
        updateUser(updatedUser);
      }
    } catch (err) {
      console.error("Error commenting on post:", err);
      // Revert UI changes on error
      setPostComments(prev => ({ ...prev, [postId]: currentComments }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen w-full bg-white">
        {/* Fixed Header */}
        <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200 flex justify-between items-center shadow-sm">
          <h2 className="text-lg font-bold text-purple-700 tracking-wide flex items-center gap-2">
            <FaUser className="text-purple-400" /> User Profile
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-purple-600 transition-colors focus:outline-none">
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6">

          {/* Profile Info */}
          <div className="p-6 flex flex-col items-center">
            <div className="relative group mb-4">
              <img
                src={user.profileImage || 'https://via.placeholder.com/100x100?text=User'}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-purple-200 shadow-md group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h3 className="text-2xl font-extrabold text-purple-700 mb-1 animate-fade-in">{user.name || 'Unknown User'}</h3>
            {user.username && <p className="text-md text-purple-400 mb-1 animate-fade-in-slow">@{user.username}</p>}
            {user.bio && <p className="text-gray-600 text-center mb-2 animate-fade-in-slow">{user.bio}</p>}
            <div className="flex items-center justify-center gap-8 py-3 border-t border-b w-full my-4 animate-fade-in-slow">
              <div className="text-center">
                <div className="font-bold text-lg text-purple-700">{user.posts?.length || 0}</div>
                <div className="text-xs text-gray-500">Posts</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-purple-700">{followersCount}</div>
                <div className="text-xs text-gray-500">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-purple-700">{followingCount}</div>
                <div className="text-xs text-gray-500">Following</div>
              </div>
            </div>
            {/* Private badge under counts for private accounts */}
            {user?.isPrivate && !isFollowing && (
              <div className="w-full flex items-center justify-center mt-3">
                <button 
                  onClick={handlePrivateButtonClick}
                  disabled={followLoading || hasRequestedFollow}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-full border transition-colors ${
                    hasRequestedFollow 
                      ? 'bg-blue-100 text-blue-600 border-blue-300 cursor-not-allowed' 
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 cursor-pointer'
                  }`}
                >
                  {followLoading ? 'Sending...' : hasRequestedFollow ? 'Requested' : 'Private'}
                </button>
              </div>
            )}
            {/* Show actions and tabs for non-private accounts OR if following private account */}
            {(!user?.isPrivate || isFollowing) && (
              <>
                {/* Follow/Unfollow button moved just below counts */}
                <div className="w-full flex items-center justify-center gap-2 mb-2">
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`px-4 py-2 text-sm rounded-lg font-semibold shadow-sm transition-all duration-200 focus:outline-none ${
                      isFollowing 
                        ? 'bg-gray-300 hover:bg-gray-400 text-gray-800' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    } ${followLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>

                  <button
                    onClick={() => handleBlockUser(user.id)}
                    className={`px-4 py-2 text-sm rounded-lg font-semibold shadow-sm transition-all duration-200 focus:outline-none ${isBlocked ? 'bg-gray-300 hover:bg-gray-400 text-gray-800' : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                  >
                    {isBlocked ? 'Unblock' : 'Block'}
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b mt-4 w-full animate-fade-in-slow">
                  <button
                    onClick={() => setActiveTab('posts')}
                    className={`flex-1 py-2 text-sm font-semibold transition-all duration-200 ${activeTab === 'posts' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' : 'text-gray-500 hover:text-purple-400'}`}
                  >
                    Posts
                  </button>
                  <button
                    onClick={() => setActiveTab('shorts')}
                    className={`flex-1 py-2 text-sm font-semibold transition-all duration-200 ${activeTab === 'shorts' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' : 'text-gray-500 hover:text-purple-400'}`}
                  >
                    Shorts
                  </button>
                </div>

                {/* Tab Content */}
                <div className="mt-4 w-full animate-fade-in-slow">
                  {activeTab === 'posts' && (
                    <div className="space-y-4">
                      {user.posts && user.posts.length > 0 ? (
                        user.posts.map(post => (
                          <div key={post.id} className="border rounded-2xl overflow-hidden bg-white shadow transition-shadow duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-purple-400 border-gray-200 transition-transform group">
                            {/* Post Header */}
                            <div className="flex items-center p-3 bg-gradient-to-r from-purple-50 to-white border-b border-gray-100">
                              <img
                                src={user.profileImage || 'https://via.placeholder.com/40'}
                                alt={user.name}
                                className="w-8 h-8 rounded-full mr-2 border-2 border-purple-200"
                              />
                              <div>
                                <div className="font-semibold text-sm text-purple-700">{user.name}</div>
                                {user.username && <div className="text-xs text-gray-500">@{user.username}</div>}
                              </div>
                            </div>
                            {/* Post Image */}
                            <img
                              src={post.imageUrl || 'https://via.placeholder.com/400'}
                              alt={post.caption || 'Post'}
                              className="w-full object-cover max-h-80 bg-gray-50"
                            />
                            {/* Divider */}
                            <div className="h-1 bg-gradient-to-r from-purple-100 via-white to-purple-100" />
                            {/* Post Actions (moved above caption) */}
                            <div className="flex justify-around py-3 text-sm text-gray-700 border-t border-b bg-white/80">
                              <button
                                onClick={() => handleLikePost(post.id)}
                                className="flex items-center gap-1 cursor-pointer hover:text-purple-600 transition-colors"
                              >
                                <FaHeart className={isLiked[post.id] ? "text-red-500" : ""} size={18} />
                                <span className="ml-1 font-semibold">{postLikes[post.id] || 0} likes</span>
                              </button>
                              <button
                                onClick={() => handleCommentToggle(post.id)}
                                className="flex items-center gap-1 cursor-pointer hover:text-purple-600 transition-colors"
                              >
                                <FaComment size={18} />
                                <span className="ml-1 font-semibold">{postComments[post.id] || 0} comments</span>
                              </button>
                              <div className="flex items-center gap-1">
                                <FaPaperPlane />
                                <span>Share</span>
                              </div>
                              <div className="text-xs text-gray-400 flex items-center">
                                {new Date(Number(post.createdAt)).toLocaleDateString()}
                              </div>
                            </div>
                            {/* Caption */}
                            {post.caption && (
                              <div className="px-4 py-3 bg-purple-50 border-b border-purple-100">
                                <span className="font-semibold text-sm text-purple-700 mr-2">Caption:</span>
                                <span className="text-base text-black font-bold">{post.caption}</span>
                              </div>
                            )}
                            {/* Comments Section */}
                            <div className="px-4 pt-3 pb-2">
                              {Array.isArray(post.comments) && post.comments.length > 0 && (
                                <>
                                  <div className="font-semibold text-purple-600 text-sm mb-1">Comments</div>
                                  <div className="space-y-2">
                                    {post.comments.slice(0, selectedPost === post.id ? undefined : 3).map((comment, index) => (
                                      <div key={comment.id || `temp-${index}-${comment.text}`} className="bg-gray-100 rounded-lg px-3 py-1 text-sm flex items-center justify-between">
                                        <div className="flex items-center">
                                          <span className="font-bold text-purple-700 mr-2">{comment.user?.name || 'User'}:</span>
                                          <span className="text-gray-700">{comment.text}</span>
                                        </div>
                                        <button
                                          className="flex items-center gap-1 text-gray-500 hover:text-blue-600 ml-2 focus:outline-none"
                                          title="Like this comment"
                                        // onClick={() => handleLikeComment(comment.id)} // Implement logic if needed
                                        >
                                          <FaThumbsUp />
                                          <span className="text-xs">{comment.likesCount || 0}</span>
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                  {post.comments.length > 3 && (
                                    <button
                                      className="text-xs text-blue-500 cursor-pointer hover:underline mt-2"
                                      onClick={() => setSelectedPost(post.id === selectedPost ? null : post.id)}
                                    >
                                      {selectedPost === post.id
                                        ? 'Show less'
                                        : `View all ${post.comments.length} comments`}
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                            {/* Add Comment Section */}
                            {showCommentInput[post.id] && (
                              <form
                                onSubmit={(e) => handleCommentSubmit(e, post.id)}
                                className="px-4 py-3 border-t border-gray-200 bg-white flex gap-2"
                              >
                                <input
                                  type="text"
                                  placeholder="Add a comment..."
                                  className="flex-grow border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                                  value={commentText[post.id] || ''}
                                  onChange={(e) => setCommentText(prev => ({
                                    ...prev,
                                    [post.id]: e.target.value
                                  }))}
                                  autoFocus
                                />
                                <button
                                  type="submit"
                                  className="bg-purple-600 text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-purple-700 cursor-pointer transition-transform duration-200 hover:scale-105"
                                  disabled={!commentText[post.id]?.trim()}
                                >
                                  Post
                                </button>
                              </form>
                            )}
                            {!showCommentInput[post.id] && (
                              <div className="px-4 py-3 border-t bg-white">
                                <button
                                  onClick={() => handleCommentToggle(post.id)}
                                  className="w-full text-center text-sm text-purple-600 hover:text-purple-800 transition-colors"
                                >
                                  Add a comment...
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-gray-500">No posts yet</div>
                      )}
                    </div>
                  )}

                  {activeTab === 'shorts' && (
                    <div className="space-y-4">
                      <div className="py-8 text-center text-gray-500">No shorts available</div>
                    </div>
                  )}
                </div>
              </>
            )}
            {/* Bottom actions removed per request; close is available in header */}
          </div>
        </div>
      </div>
    </div>
  );
};

// Square-style SuggestionCard
const SuggestionCard = ({ user, onCardClick, onProfileClick }) => {
  // Calculate mutual followers if available
  const loggedInUser = JSON.parse(sessionStorage.getItem('user'));
  let mutualFollowers = 0;
  if (user?.followers && loggedInUser && loggedInUser.following) {
    const followingIds = loggedInUser.following.map(f => f.id || f);
    mutualFollowers = user.followers.filter(f => followingIds.includes(f.id)).length;
  }

  return (
    <div
      onClick={onCardClick}
      className="flex flex-col items-center justify-between bg-white rounded-2xl shadow border border-gray-200 p-3 hover:shadow-lg transition-shadow cursor-pointer group"
      style={{ width: '170px', height: '170px', minWidth: '170px', minHeight: '170px' }}
    >
      {/* Profile Image */}
      <img
        src={user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Guest')}&background=random`}
        alt={user?.name}
        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 group-hover:border-purple-400 transition-all mb-1 mt-1"
      />
      {/* User Info */}
      <div className="flex flex-col items-center flex-1 justify-center w-full mt-0.5 mb-0.5">
        <h4 className="text-[13px] font-semibold text-gray-900 truncate w-full text-center leading-tight">{user?.name}</h4>
        {user?.username && (
          <span className="text-[11px] text-gray-500 text-center w-full leading-tight">@{user?.username}</span>
        )}
        {user?.bio && (
          <p className="text-gray-500 text-[10px] mt-0.5 mb-0.5 line-clamp-1 text-center w-full leading-tight">{user?.bio}</p>
        )}
        <div className="text-[10px] text-gray-400 mt-0.5 text-center w-full leading-tight">
          {mutualFollowers > 0
            ? `${mutualFollowers} mutual follower${mutualFollowers > 1 ? 's' : ''}`
            : user?.followers && user.followers.length > 0
              ? `${user.followers.length} follower${user.followers.length > 1 ? 's' : ''}`
              : 'No followers yet'}
        </div>
      </div>
      {/* Action Button */}
      <button
        onClick={e => { e.stopPropagation(); onProfileClick(); }}
        className="bg-blue-600 text-white px-2 py-1 rounded-full hover:bg-blue-700 transition-colors font-semibold shadow-sm text-xs mt-1 w-full"
        style={{ minHeight: '26px' }}
      >
        View Profile
      </button>
    </div>
  );
};

export default SearchPage;
