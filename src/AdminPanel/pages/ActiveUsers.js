"use client"

import { Eye, Search, User, MoreVertical, Ban, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import {GET_ALL_USERS_BY_ADMIN}  from "../../graphql/mutations"
import { gql, useQuery } from '@apollo/client';
import Skeleton from "./Skeleton";

export default function ActiveUsers({ onBack, activeUsersData = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState([]);

    const { data: usersData, loading: usersLoading, error: usersError } = useQuery(GET_ALL_USERS_BY_ADMIN);
  // Process active users data
  useEffect(() => {
    if (activeUsersData && activeUsersData.length > 0 && usersData?.getAllUsersByAdmin) {
      // Match active user IDs with complete user data
      const matchedUsers = activeUsersData
        .map(activeUserId => {
          // Find the complete user data for this active user ID
          return usersData.getAllUsersByAdmin.find(user => 
            user.id.toString() === activeUserId.toString()
          );
        })
        .filter(user => user !== undefined); // Remove any unmatched users
      
      setActiveUsers(matchedUsers);
      setIsLoading(false);
    } else if (activeUsersData && activeUsersData.length === 0) {
      // If no active users, show empty state
      setActiveUsers([]);
      setIsLoading(false);
    } else if (usersData?.getAllUsersByAdmin && activeUsersData.length === 0) {
      // If users data is loaded but no active users
      setActiveUsers([]);
      setIsLoading(false);
    }
  }, [activeUsersData, usersData]);

  const filteredUsers = activeUsers.filter(user => 
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center">
        <button
          onClick={onBack}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Active Users</h2>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search active users..."
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
                  User ID
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profile
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
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
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                      {user.id}
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 sm:px-6 py-12 text-center text-gray-500">
                    {searchTerm ? "No active users found" : "No active users online"}
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