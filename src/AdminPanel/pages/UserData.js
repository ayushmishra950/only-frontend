"use client"

import { Eye, Search, Bell, User, MoreVertical, Ban } from "lucide-react";
import { useState, useEffect } from "react";
import Skeleton from "./Skeleton";
import { GET_ALL_USERS_BY_ADMIN,GET_ALL_USERS, UNBLOCK_ADMIN_BY_USER, BLOCK_ADMIN_BY_USER } from "../../graphql/mutations"
import { useMutation, useQuery } from '@apollo/client';

export default function UserData({ onViewClick }) {
  const [imageLoadingStates, setImageLoadingStates] = useState({})
  const [openMenuId, setOpenMenuId] = useState(null)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close if clicked outside any menu button or menu panel
      if (!e.target.closest('[data-dropdown-root="true"]')) {
        setOpenMenuId(null)
      }
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpenMenuId(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  
  const { data: usersData, loading: usersLoading, error: usersError, refetch } = useQuery(GET_ALL_USERS_BY_ADMIN);
  const [blockUser] = useMutation(BLOCK_ADMIN_BY_USER, {
    update(cache, { data }) {
      // Update the cache immediately after successful mutation
      const existingUsers = cache.readQuery({ query: GET_ALL_USERS_BY_ADMIN });
      if (existingUsers && data.blockUser) {
        const updatedUsers = existingUsers.users.map(user => 
          user.id === data.blockUser.id 
            ? { ...user, is_blocked: true }
            : user
        );
        cache.writeQuery({
          query: GET_ALL_USERS_BY_ADMIN,
          data: { users: updatedUsers }
        });
      }
    }
  });
  console.log(usersData)  
  
  const [unblockUser] = useMutation(UNBLOCK_ADMIN_BY_USER, {
    update(cache, { data }) {
      // Update the cache immediately after successful mutation
      const existingUsers = cache.readQuery({ query: GET_ALL_USERS_BY_ADMIN });
      if (existingUsers && data.unblockUser) {
        const updatedUsers = existingUsers.users.map(user => 
          user.id === data.unblockUser.id 
            ? { ...user, is_blocked: false }
            : user
        );
        cache.writeQuery({
          query: GET_ALL_USERS_BY_ADMIN,
          data: { users: updatedUsers }
        });
      }
    }
  });

  const handleBlockToggle = async (user) => {
    /* console.log(...) */ void 0
    if (!user || !user?.id) return;

    const userId = String(user?.id); 
    try {
      if (user.is_blocked) {
        await unblockUser({
          variables: { userId: userId },
          optimisticResponse: {
            unblockUser: {
              __typename: "User",
              id: user.id,
              name: user.name,
              username: user.username,
              email: user.email,
              profileImage: user.profileImage,
              is_blocked: false,
              following: user.following,
              followers: user.followers,
              posts: user.posts
            }
          }
        });
      } else {
        await blockUser({
          variables: { userId: userId },
          optimisticResponse: {
            blockUser: {
              __typename: "User",
              id: user.id,
              name: user.name,
              username: user.username,
              email: user.email,
              profileImage: user.profileImage,
              is_blocked: true,
              following: user.following,
              followers: user.followers,
              posts: user.posts
            }
          }
        });
      }

      setOpenMenuId(null);
    } catch (err) {
      console.error("Error toggling block status:", err.message);
      // Refetch on error to ensure UI is in sync
      await refetch();
    }
  };


  // Real user data from backend
  const users = usersData?.getAllUsersByAdmin || [];

  useEffect(() => {
    if (users && users.length > 0) {
      const initialStates = {}
      users.forEach((user) => {
        initialStates[user.id] = true
      })
      setImageLoadingStates(initialStates)

      // Simulate image loading
      users.forEach((user, index) => {
        setTimeout(
          () => {
            setImageLoadingStates((prev) => ({
              ...prev,
              [user.id]: false,
            }))
          },
          500 + index * 200,
        )
      })
    }
  }, [users])

  const renderTableRows = () => {
    return users.map((user, index) => (
      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
          {imageLoadingStates[user.id] ? (
            <Skeleton variant="circle" className="w-10 h-10" />
          ) : user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              onError={(e) => {
                // If image fails to load, show first letter instead
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : (
            <div className="w-10 h-10 bg-[#B65FCF] rounded-full flex items-center justify-center text-white font-medium">
              {user.name?.charAt(0) || 'U'}
            </div>
          )}
          {user.profileImage && (
            <div
              className="w-10 h-10 bg-[#B65FCF] rounded-full flex items-center justify-center text-white font-medium"
              style={{ display: 'none' }}
            >
              {user.name?.charAt(0) || 'U'}
            </div>
          )}
        </td>
        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
          <div data-dropdown-root="true" className="inline-flex items-center gap-2 relative">
            <button
              onClick={() => onViewClick && onViewClick(user)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B65FCF] transition-colors"
            >
              <Eye className="mr-2" size={16} />
              View
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                setMenuPos({ top: rect.bottom + 8, left: rect.right - 128 }); // 128px = menu width
                setOpenMenuId(openMenuId === user.id ? null : user.id);
              }}
              className="p-2 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 focus:outline-none"
              aria-label="More actions"
            >
              <MoreVertical size={16} />
            </button>
            {/* {openMenuId === user.id && (
              <div className="fixed w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50" style={{ top: menuPos.top, left: menuPos.left }}>
                <button
                  onClick={(e) => { e.stopPropagation();  setOpenMenuId(null); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                  title="Block user"
                  type="button"
                >
                  <Ban size={16} />
                  Block
                </button>
              </div>
            )} */}

            {openMenuId === user.id && (
              <div
                className="fixed w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                style={{ top: menuPos.top, left: menuPos.left }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBlockToggle(user);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md ${user.is_blocked ? "text-green-600" : "text-red-600"
                    }`}
                  title={user.is_blocked ? "Unblock user" : "Block user"}
                  type="button"
                >
                  <Ban size={16} />
                  {user.is_blocked ? "Unblock" : "Block"}
                </button>
              </div>
            )}

          </div>
        </td>
      </tr>
    ))
  }

  return (
    <div className="flex-1 bg-gray-50 min-w-0">
      {/* Top Bar - Hidden on mobile, shown on desktop */}
      <header className="hidden lg:block bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">User Data</h1>
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B65FCF] focus:border-transparent w-48"
              />
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell size={20} />
            </button>
            <button className="w-10 h-10 bg-[#B65FCF] rounded-full flex items-center justify-center text-white hover:bg-[#A855F7] transition-colors flex-shrink-0">
              <User size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-3 sm:p-4 lg:p-6 min-w-0">
        {/* Mobile title */}
        <div className="lg:hidden mb-4">
          <h1 className="text-xl font-semibold text-gray-900">User Management</h1>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B65FCF] focus:border-transparent"
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sr. No.
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profile Image
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usersLoading ? (
                  <tr>
                    <td colSpan="5" className="px-4 sm:px-6 py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B65FCF]"></div>
                        <span className="ml-2">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : usersError ? (
                  <tr>
                    <td colSpan="5" className="px-4 sm:px-6 py-8 text-center text-red-500">
                      Error loading users: {usersError.message}
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 sm:px-6 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  renderTableRows()
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {usersLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B65FCF]"></div>
              <span className="ml-2 text-gray-500">Loading users...</span>
            </div>
          ) : usersError ? (
            <div className="text-center py-8 text-red-500">
              Error loading users: {usersError.message}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No users found
            </div>
          ) : (
            users.map((user, index) => (
              <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex-shrink-0">
                      {imageLoadingStates[user.id] ? (
                        <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                      ) : user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-[#B65FCF] rounded-full flex items-center justify-center text-white font-medium text-lg">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      {user.profileImage && (
                        <div
                          className="w-12 h-12 bg-[#B65FCF] rounded-full flex items-center justify-center text-white font-medium text-lg"
                          style={{ display: 'none' }}
                        >
                          {user.name?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">#{index + 1}</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                    </div>
                  </div>
                  <div data-dropdown-root="true" className="flex-shrink-0 ml-4 relative inline-flex items-center gap-2">
                    <button
                      onClick={() => onViewClick && onViewClick(user)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B65FCF] transition-colors"
                    >
                      <Eye className="mr-2" size={16} />
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMenuPos({ top: rect.bottom + 8, left: rect.right - 128 }); // 128px = menu width
                        setOpenMenuId(openMenuId === user.id ? null : user.id);
                      }}
                      className="p-2 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 focus:outline-none"
                      aria-label="More actions"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {/* {openMenuId === user.id && (
                      <div className="fixed w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50" style={{ top: menuPos.top, left: menuPos.left }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                          title="Block user"
                          type="button"
                        >
                          <Ban size={16} />
                          Block
                        </button>
                      </div>
                    )} */}

                    {openMenuId === user.id && (
                      <div
                        className="fixed w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                        style={{ top: menuPos.top, left: menuPos.left }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBlockToggle(user);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md ${user.is_blocked ? "text-green-600" : "text-red-600"
                            }`}
                          title={user.is_blocked ? "Unblock user" : "Block user"}
                          type="button"
                        >
                          <Ban size={16} />
                          {user.is_blocked ? "Unblock" : "Block"}
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
