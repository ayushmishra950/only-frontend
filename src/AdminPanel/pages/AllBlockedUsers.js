"use client"

import { Eye, Search, User, MoreVertical, Ban, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import {GET_ALL_USERS_BY_ADMIN,UNBLOCK_ADMIN_BY_USER}  from "../../graphql/mutations"
import { gql, useMutation,useQuery } from '@apollo/client';
import Skeleton from "./Skeleton";

export default function AllBlockedUsers({ onBack, blockedUsersData = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [unblockingUserId, setUnblockingUserId] = useState(null);
   console.log("BlockedUsers data:", blockedUsersData);
  const { data: usersData, loading: usersLoading, error: usersError, refetch } = useQuery(GET_ALL_USERS_BY_ADMIN, {
    errorPolicy: 'all',
    onError: (error) => {
      console.error("Query error:", error);
    }
  });

  const [unblockUser] = useMutation(UNBLOCK_ADMIN_BY_USER, {
      errorPolicy: 'all',
      update(cache, { data }) {
        try {
          // Update the cache immediately after successful mutation
          const existingUsers = cache.readQuery({ query: GET_ALL_USERS_BY_ADMIN });
          if (existingUsers && data?.unblockUser) {
            const updatedUsers = existingUsers.getAllUsersByAdmin.map(user => 
              user.id === data.unblockUser.id 
                ? { ...user, is_blocked: false }
                : user
            );
            cache.writeQuery({
              query: GET_ALL_USERS_BY_ADMIN,
              data: { getAllUsersByAdmin: updatedUsers }
            });
            console.log("Cache updated successfully");
          }
        } catch (cacheError) {
          console.error("Cache update error:", cacheError);
        }
      },
      onError: (error) => {
        console.error("Mutation error:", error);
      }
    });


      const handleUnBlock = async (user) => {
    console.log("Unblocking user:", user);
    if (!user || !user?.id) {
      console.error("Invalid user data");
      return;
    }

    const userId = String(user?.id);
    setUnblockingUserId(userId);
    
    try {
      const result = await unblockUser({
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
            following: user.following || [],
            followers: user.followers || [],
            posts: user.posts || []
          }
        }
      });
      
      console.log("Unblock successful:", result);
      
      // Update local state to remove user from blocked list
      setBlockedUsers(prevUsers => 
        prevUsers.filter(blockedUser => blockedUser.id !== user.id)
      );
      
      // Refetch to ensure data consistency
      await refetch();

    } catch (err) {
      console.error("Error unblocking user:", err);
      console.error("Error details:", err.message);
      console.error("GraphQL errors:", err.graphQLErrors);
      console.error("Network error:", err.networkError);
      
      // Show user-friendly error message
      const errorMessage = err.graphQLErrors?.[0]?.message || err.message || "Failed to unblock user";
      alert(`Error: ${errorMessage}. Please try again.`);
      
      // Refetch on error to ensure UI is in sync
      await refetch();
    } finally {
      setUnblockingUserId(null);
    }
  };

  // Process blocked users data
  useEffect(() => {
    if (blockedUsersData && blockedUsersData.length > 0 && usersData?.getAllUsersByAdmin) {
      // Match blocked user IDs with complete user data
      // const matchedUsers = blockedUsersData
      //   .map(blockedUserId => {
      //     // Find the complete user data for this blocked user ID
      //     return usersData.getAllUsersByAdmin.find(user => 
      //       user.id.toString() === blockedUserId.toString()
      //     );
      //   })
      //   .filter(user => user !== undefined); // Remove any unmatched users
      
      setBlockedUsers(blockedUsersData);
      setIsLoading(false);
    } else if (blockedUsersData && blockedUsersData.length === 0) {
      // If no blocked users, show empty state
      setBlockedUsers([]);
      setIsLoading(false);
    } 
  }, [blockedUsersData, usersData]);

  const filteredUsers = blockedUsers.filter(user => 
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Show error if query failed
  if (usersError) {
    console.error("Users query error:", usersError);
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center">
        <button
          onClick={onBack}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Blocked Users</h2>
      </div>

      {usersError && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error loading users: {usersError.message}
        </div>
      )}

      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search blocked users..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#B65FCF] focus:border-[#B65FCF] sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden border-b border-gray-200 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Photo
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading || usersLoading ? (
                Array(3).fill(0).map((_, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td colSpan="5" className="px-4 sm:px-6 py-4">
                      <Skeleton variant="rect" className="h-12" />
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="w-10 h-10 bg-[#B65FCF] rounded-full flex items-center justify-center text-white font-medium">
                        {user.name ? user.name.charAt(0) : user.username ? user.username.charAt(0) : 'U'}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name || 'N/A'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      @{user.username || 'N/A'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleUnBlock(user)} 
                        disabled={unblockingUserId === user.id}
                        className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Ban className="mr-2" size={16} />
                        {unblockingUserId === user.id ? "Unblocking..." : "Unblock"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 sm:px-6 py-12 text-center text-gray-500">
                    {searchTerm ? "No blocked users found" : "No blocked users"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}