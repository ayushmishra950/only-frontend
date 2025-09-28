import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setRegisterFormData } from '../../redux/registerSlice';
import axios from 'axios';

const SuccessPopup = ({ show }) => (
  <div
    className={`fixed top-6 left-0 w-full flex justify-center z-50 transition-all duration-500 ${
      show
        ? 'opacity-100 scale-100 translate-y-0'
        : 'opacity-0 scale-90 -translate-y-8 pointer-events-none'
    }`}
    style={{ pointerEvents: show ? 'auto' : 'none' }}
  >
    <div className="flex items-center gap-3 px-6 py-3 border-2 border-purple-500 text-black rounded-xl shadow-lg bg-transparent">
      <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <span className="font-semibold text-lg">OTP Verified Successfully!</span>
    </div>
  </div>
);

const OtpInput = () => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState(120); 
  const [showSuccess, setShowSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const otpData = location?.state?.form?.registerUser;
     
  const otpValue = otpData?.otp;
  const otpExpiry = otpData?.otpExpiryTime;

  const reduxFormData = useSelector((state) => state.register.formData);

  // Get OTP data from localStorage as backup
  const getOtpData = () => {
    const localStorageData = localStorage.getItem('otpData');
    if (localStorageData) {
      try {
        return JSON.parse(localStorageData);
      } catch (e) {
        console.error('Error parsing localStorage OTP data:', e);
      }
    }
    return null;
  };

  // Handle paste event for OTP
  useEffect(() => {
    const handlePaste = (e) => {
      const pastedData = e.clipboardData.getData('text/plain').trim();
      
      // Check if pasted data is a 6-digit number
      if (/^\d{6}$/.test(pastedData)) {
        e.preventDefault();
        const otpArray = pastedData.split('').slice(0, 6);
        setOtp(otpArray);
        
        // Focus on the last input field
        if (inputRefs.current[5]) {
          inputRefs.current[5].focus();
        }
      }
    };

    // Add event listener to the window
    window.addEventListener('paste', handlePaste);

    // Cleanup
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Show redux object in console before verify
    /* console.log(...) */ void 0;
    
    // Also check localStorage
    const localStorageOtp = getOtpData();
    /* console.log(...) */ void 0;
    
    // If Redux data is missing but localStorage has data, use localStorage
    if ((!reduxFormData.otp || !reduxFormData.email) && localStorageOtp) {
      /* console.log(...) */ void 0;
      // You can dispatch this data back to Redux if needed
    }
  }, [reduxFormData]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      try {
        if (inputRefs.current[index + 1]) {
          inputRefs.current[index + 1].focus();
        }
      } catch (error) {
        console.error("Error focusing next input:", error);
      }
    }
  };

  const handleKeyDown = (e, index) => {
    try {
      if (e.key === 'Backspace' && index > 0 && !otp[index]) {
        if (inputRefs.current[index - 1]) {
          inputRefs.current[index - 1].focus();
        }
      }
    } catch (error) {
      console.error("Error handling key down event:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    
    if (isVerifying) return; // Prevent multiple submissions
    setIsVerifying(true);

    if (enteredOtp.length !== 6) {
      alert("Please enter all 6 digits of the OTP");
      return;
    }

    // Get OTP data - try Redux first, then localStorage
    let otpData = reduxFormData;
    if (!otpData.otp || !otpData.email) {
      const localStorageData = getOtpData();
      if (localStorageData) {
        otpData = localStorageData;
        /* console.log(...) */ void 0;
      } else {
        alert("OTP data not found. Please try registering again.");
        navigate('/register');
        return;
      }
    }
    
    // Convert otpExpiryTime to timestamp if it's a string
    let expiryTime = otpData.otpExpiryTime;
    if (typeof expiryTime === 'string') {
      expiryTime = new Date(expiryTime).getTime();
    }
    
    // Fix: define currentTime
    const currentTime = Date.now();
    /* console.log(...) */ void 0;
    /* console.log(...) */ void 0;
    /* console.log(...) */ void 0;
    
    if (currentTime > expiryTime || timeLeft === 0) {
      alert("OTP has expired. Please request a new one.");
      return;
    }

    // Convert both OTPs to strings for comparison
    const enteredOtpString = enteredOtp.toString();
    const storedOtpString = otpData.otp.toString();

    /* console.log(...) */ void 0;

    if (enteredOtpString === storedOtpString) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      // OTP verify hone ke baad user ko backend me save karo
      try {
        const query = `
          mutation RegisterUser($email: String!, $otp: Int!) {
            registerUser(email: $email, otp: $otp) {
              id
              name
              email
              phone
              createTime
              token
            }
          }
        `;
        const variables = {
          email: otpData.email,
          otp: parseInt(enteredOtp),
        };
        const response = await axios.post(
          'https://social-media-4hxh.onrender.com/graphql', 
          { query, variables }, 
          { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
        );
        
        // Check for GraphQL errors
        if (response.data.errors && response.data.errors.length > 0) {
          setShowSuccess(false);
          alert('❌ ' + response.data.errors[0].message);
          return;
        }
        
        // Clear localStorage after successful registration
        localStorage.removeItem('otpData');
        
        // Success - navigate to login page
        setTimeout(() => navigate('/login'), 2000);
      } catch (err) {
        setShowSuccess(false);
        console.error('Registration error:', err);
        
        // Handle different types of errors
        if (err.response?.data?.errors) {
          alert('❌ ' + err.response.data.errors[0].message);
        } else if (err.response?.data?.message) {
          alert('❌ ' + err.response.data.message);
        } else {
          alert('❌ Registration failed: ' + (err.message || 'Unknown error'));
        }
      }
    } else {
      /* console.log(...) */ void 0;
      alert("Your OTP is not matched. Please check and try again.");
    }
  };

  const formatTime = () => {
    if (timeLeft <= 0) return '00:00';
    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const seconds = String(timeLeft % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      // Call the resend OTP API
      const query = `
        mutation ResendOtp($email: String!) {
          resendOtp(email: $email) {
            success
            message
            otp
            otpExpiryTime
          }
        }
      `;
      
      const email = reduxFormData?.email || getOtpData()?.email;
      if (!email) {
        alert('Email not found. Please try registering again.');
        navigate('/register');
        return;
      }

      const response = await axios.post(
        'https://social-media-4hxh.onrender.com/graphql',
        { 
          query,
          variables: { email }
        },
        { 
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true 
        }
      );

      const { data, errors } = response.data;
      
      if (errors) {
        throw new Error(errors[0].message || 'Failed to resend OTP');
      }

      if (data.resendOtp.success) {
        // Update the OTP in Redux and localStorage
        const updatedData = {
          ...reduxFormData,
          otp: data.resendOtp.otp,
          otpExpiryTime: data.resendOtp.otpExpiryTime
        };
        
        dispatch(setRegisterFormData(updatedData));
        localStorage.setItem('otpData', JSON.stringify(updatedData));
        
        // Reset the timer
        setTimeLeft(120);
        setOtp(new Array(6).fill(''));
        alert('New OTP has been sent to your email');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      alert(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
};

const maskEmail = (email) => {
if (!email) {
  // Try to get email from localStorage if not in Redux
  const otpData = getOtpData();
  if (otpData && otpData.email) {
    email = otpData.email;
  } else {
    return 'your email';
  }
}
  
const [username, domain] = email.split('@');
if (!username || !domain) return email; // In case of invalid email format
  
// Show first 3 characters, then 3 asterisks, then the domain
const firstPart = username.substring(0, 3);
const maskedPart = '***';
  
return `${firstPart}${maskedPart}@${domain}`;
};

return (
<div className="min-h-screen flex items-center justify-center bg-gray-100">
  <SuccessPopup show={showSuccess} />
  
  <form className="bg-white p-8 rounded-2xl shadow-md text-center w-full max-w-sm" onSubmit={handleSubmit}>
    <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify OTP</h2>
    <p className="text-sm text-gray-600 mb-1">
      The verification code has been sent to your email
    </p>
    <p className="text-sm font-medium text-blue-600 mb-2">
      {maskEmail(reduxFormData.email)}
    </p>
    {timeLeft > 0 ? (
      <p className="text-red-500 font-medium mb-4">
        OTP expires in: {formatTime()}
      </p>
    ) : (
      <button
        type="button"
        onClick={handleResendOtp}
        disabled={isResending}
        className="text-blue-600 font-medium mb-4 hover:underline focus:outline-none"
      >
        {isResending ? 'Sending...' : 'Resend OTP'}
      </button>
    )}
    <div className="flex justify-center space-x-2 mb-6">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          maxLength="1"
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className={`w-10 h-12 text-xl text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
          disabled={timeLeft === 0}
        />
      ))}
    </div>
    <button
      type="submit"
      disabled={timeLeft === 0 || otp.some(digit => digit === '') || isVerifying}
      className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center ${isVerifying ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {isVerifying ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Verifying...
        </>
      ) : (
        'Verify OTP'
      )}
    </button>
  </form>
</div>
);
};

export default OtpInput;
