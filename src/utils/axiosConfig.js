import axios from 'axios';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true, // Important for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to clear authentication cookie
const clearAuthCookie = () => {
  // Clear the token cookie
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  
  // Also clear any other auth-related cookies if they exist
  document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "userToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  
  /* console.log(...) */ void 0;
};

// Function to handle forced logout
const handleForcedLogout = (message = "You have been blocked by admin.") => {
  /* console.log(...) */ void 0;
  
  // Show alert to user
  alert(message);
  
  // Clear authentication cookies
  clearAuthCookie();
  
  // Clear any localStorage/sessionStorage if used
  localStorage.clear();
  sessionStorage.clear();
  
  // Redirect to login page
  window.location.href = "/login";
};

// Response interceptor to handle blocked user errors
axiosInstance.interceptors.response.use(
  (response) => {
    // If response is successful, return it
    return response;
  },
  (error) => {
    /* console.log(...) */ void 0;
    
    // Check if it's a GraphQL error response
    const graphqlErrors = error.response?.data?.errors;
    
    if (graphqlErrors && Array.isArray(graphqlErrors)) {
      // Check each error for blocked user message
      for (const gqlError of graphqlErrors) {
        if (gqlError.message === "User is blocked" || 
            gqlError.message === "User blocked" ||
            gqlError.message.includes("blocked")) {
          
          /* console.log(...) */ void 0;
          handleForcedLogout("You have been blocked by admin.");
          return Promise.reject(error);
        }
      }
    }
    
    // Check for authentication errors
    if (error.response?.status === 401 || 
        error.response?.status === 403) {
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message;
      
      if (errorMessage && errorMessage.toLowerCase().includes('blocked')) {
        /* console.log(...) */ void 0;
        handleForcedLogout("You have been blocked by admin.");
        return Promise.reject(error);
      }
    }
    
    // Return the error for other cases
    return Promise.reject(error);
  }
);

// Request interceptor to ensure cookies are sent
axiosInstance.interceptors.request.use(
  (config) => {
    // Ensure credentials are included
    config.withCredentials = true;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;