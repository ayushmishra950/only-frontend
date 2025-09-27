import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import { GET_ME } from '../../graphql/mutations';
import { GetTokenFromCookie } from '../getToken/GetToken';

const BlockedUserMonitor = () => {
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  // Function to clear authentication cookie
  const clearAuthCookie = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    /* console.log(...) */ void 0;
  };

  // Function to handle blocked user logout
  const handleBlockedUserLogout = () => {
    /* console.log(...) */ void 0;
    
    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Show alert
    alert("You have been blocked by admin.");
    
    // Clear authentication
    clearAuthCookie();
    localStorage.clear();
    sessionStorage.clear();
    
    // Redirect to login
    navigate('/login', { replace: true });
    
    // Force page reload for complete cleanup
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Function to check user status
  const checkUserStatus = async () => {
    try {
      const user = GetTokenFromCookie();
      
      // Only check if user is logged in
      if (!user || !user.id) {
        return;
      }

      /* console.log(...) */ void 0;

      // Make GraphQL request to check user status
      const response = await axiosInstance.post('/graphql', {
        query: GET_ME.loc.source.body,
      });

      const userData = response.data?.data?.getMe;
      
      if (userData && userData.is_blocked === true) {
        /* console.log(...) */ void 0;
        handleBlockedUserLogout();
        return;
      }

      /* console.log(...) */ void 0;

    } catch (error) {
      console.error('❌ Error checking user status:', error);
      
      // Check if error indicates user is blocked
      const graphqlErrors = error.response?.data?.errors;
      
      if (graphqlErrors && Array.isArray(graphqlErrors)) {
        for (const gqlError of graphqlErrors) {
          if (gqlError.message === "User is blocked" || 
              gqlError.message === "User blocked" ||
              gqlError.message.includes("blocked")) {
            
            /* console.log(...) */ void 0;
            handleBlockedUserLogout();
            return;
          }
        }
      }
      
      // Check for authentication errors that might indicate blocking
      if (error.response?.status === 401 || error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error ||
                            error.message;
        
        if (errorMessage && errorMessage.toLowerCase().includes('blocked')) {
          /* console.log(...) */ void 0;
          handleBlockedUserLogout();
          return;
        }
      }
    }
  };

  useEffect(() => {
    const user = GetTokenFromCookie();
    
    // Only start monitoring if user is logged in
    if (user && user.id) {
      /* console.log(...) */ void 0;
      
      // Check immediately
      checkUserStatus();
      
      // Set up polling every 10 seconds
      intervalRef.current = setInterval(checkUserStatus, 10000);
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        /* console.log(...) */ void 0;
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [navigate]);

  // This component doesn't render anything
  return null;
};

export default BlockedUserMonitor;