import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NewPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
    const {email} = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : "";
/* console.log(...) */ void 0

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
    
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character';
    }
    return '';
  };

  const handleChange = (e) => {
    try {
      const { name, value } = e.target;
      const newFormData = { ...formData, [name]: value };
      setFormData(newFormData);
      
      // Validate new password strength
      if (name === 'newPassword') {
        const error = validatePassword(value);
        setPasswordError(error);
      }
      
      // Check if passwords match when either field changes
      if (name === 'newPassword' || name === 'confirmPassword') {
        if (newFormData.newPassword && newFormData.confirmPassword) {
          const match = newFormData.newPassword === newFormData.confirmPassword;
          setPasswordsMatch(match);
          if (!match) {
            setError('Passwords do not match.');
          } else if (passwordError) {
            setError(passwordError);
          } else {
            setError('');
          }
        } else {
          setPasswordsMatch(true);
          if (name === 'newPassword' && value) {
            setError(validatePassword(value) || '');
          } else {
            setError('');
          }
        }
      }
      
      setSuccess('');
    } catch (error) {
      console.error("Error handling form change:", error);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (isLoading) return;
  
  setIsLoading(true);
  setError('');
  setSuccess('');

  const {email} = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : "";
  const { newPassword, confirmPassword } = formData;

  if (!email || !confirmPassword || !newPassword) {
    setError('All fields are required.');
    setIsLoading(false);
    return;
  }

  if (!passwordsMatch) {
    setError('Please make sure both passwords match.');
    setIsLoading(false);
    return;
  }
  
  const passwordValidationError = validatePassword(newPassword);
  if (passwordValidationError) {
    setError(passwordValidationError);
    setIsLoading(false);
    return;
  }

  else if(newPassword.length<6){
    setError('Password must be at least 6 characters long.');
    setIsLoading(false);
    return;
  }
  

  try {
    const response = await axios.post('http://localhost:5000/graphql', {
      query: `
 mutation newPassword($email: String!, $newPassword: String!) {
  newPassword(email: $email, newPassword: $newPassword)
}
`,
      variables: {
        email ,
        newPassword
      },
    });

    if (response.data.errors) {
      const errorMsg = response.data.errors[0]?.message;
      alert(errorMsg); 
      setError(errorMsg);
      return;
    }
    
    const message = response.data.data.newPassword;

    if (message) {
      setSuccess(message);
      setIsLoading(true); // Show loader on button
      // Show success toast and redirect to login
      toast.success('Password changed successfully!', {
        position: 'top-center',
        autoClose: 1000, // Reduced from 2000ms to 1000ms (1 second)
        hideProgressBar: true, // Hide progress bar for cleaner look
        closeOnClick: false, // Prevent closing on click
        pauseOnHover: false, // Don't pause on hover
        draggable: false, // Disable dragging
        onClose: () => {
          // Clear any user data from session storage
          sessionStorage.removeItem('user');
          // Redirect to login page
          window.location.href = '/login';
        }
      });
    } else {
      alert('Something went wrong');
      setError('Something went wrong');
    }

  } catch (err) {
    const errorMsg = err.response?.data?.errors?.[0]?.message || 'Something went wrong';
    setError(errorMsg);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <>
      <ToastContainer />
      <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-purple-600">Change Password</h2>

        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        {success && <p className="text-green-600 mb-4 text-sm">{success}</p>}

        {/* <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div> */}

        <div className="mb-4 relative">
          <label className="block text-sm font-medium mb-1">New Password</label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              className={`w-full px-4 py-2 pr-10 border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              tabIndex="-1"
            >
              {showNewPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {passwordError && (
            <p className="mt-1 text-xs text-red-500">{passwordError}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Must be at least 8 characters, include one uppercase letter and one special character
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Confirm New Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              className={`w-full px-4 py-2 pr-10 border ${!passwordsMatch && formData.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              tabIndex="-1"
            >
              {showConfirmPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {!passwordsMatch && formData.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md transition duration-300 flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating...
            </>
          ) : (
            'Set New Password'
          )}
        </button>
      </form>
    </div>
    </>
  );
};

export default NewPassword;
