import React, { useState } from 'react';
  import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Password_change = () => {
  const [formData, setFormData] = useState({
    email: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    try {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      setError('');
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

  const { email } = formData;

  if (!email) {
    setError('All fields are required.');
    setIsLoading(false);
    return;
  }
  

  try {
    const response = await axios.post('https://social-media-4hxh.onrender.com/graphql', {
      query: `
 mutation changePassword($email: String!) {
  changePassword(email: $email){
  email
  otp
  }
}
`,
      variables: {
        email ,
      },
    });

    if (response.data.errors) {
      const errorMsg = response.data.errors[0]?.message;
      alert(errorMsg); 
      setError(errorMsg);
      return;
    }
    
    const message = response.data.data.changePassword;

    if (message) {
      // setSuccess(message);
      sessionStorage.setItem('user', JSON.stringify(message));
      navigate('/confirmOtp');
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-purple-600">Change Password</h2>

        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        {success && <p className="text-green-600 mb-4 text-sm">{success}</p>}

        <div className="mb-4">
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
        </div>

        {/* <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Old Password</label>
          <input
            type="password"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
            placeholder="Enter old password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="Enter new password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
            minLength={6}
          />
        </div> */}

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
              Sending OTP...
            </>
          ) : (
            'Update Password'
          )}
        </button>
      </form>
    </div>
  );
};

export default Password_change;
