import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
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

const ConfirmOtp = () => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState(120); 
  const [showSuccess, setShowSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    
    if (isVerifying) return; // Prevent multiple submissions
    setIsVerifying(true);

    if (enteredOtp.length !== 6) {
      alert("Please enter all 6 digits of the OTP");
      setIsVerifying(false);
      return;
    }

    // Get OTP from sessionStorage
    const storedOtpData = sessionStorage.getItem('user');
    if (!storedOtpData) {
      alert("OTP not found in session. Please try again.");
      setIsVerifying(false);
      return;
    }

    let parsedOtpData;
    try {
      parsedOtpData = JSON.parse(storedOtpData);
    } catch (error) {
      console.error("Error parsing OTP from sessionStorage:", error);
      alert("Invalid OTP data. Try again.");
      setIsVerifying(false);
      return;
    }

    const storedOtp = parsedOtpData?.otp?.toString();

    if (!storedOtp) {
      alert("Stored OTP is missing or invalid.");
      setIsVerifying(false);
      return;
    }

    const enteredOtpString = enteredOtp.toString();

    if (enteredOtpString === storedOtp) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/newPassword');
      }, 2000);
    } else {
      alert("❌ OTP does not match. Please try again.");
      setIsVerifying(false);
    }
  };

  const formatTime = () => {
    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const seconds = String(timeLeft % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <SuccessPopup show={showSuccess} />
      
      <form className="bg-white p-8 rounded-2xl shadow-md text-center w-full max-w-sm" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify OTP</h2>
        <p className="text-sm text-gray-600 mb-2">
          Enter the 6-digit code sent to your number
        </p>
        <p className="text-red-500 font-medium mb-4">
          OTP expires in: {formatTime()}
        </p>
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
              className="w-10 h-12 text-xl text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={timeLeft === 0}
            />
          ))}
        </div>
        <button
          type="submit"
          className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center ${isVerifying ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={otp.some(digit => digit === '') || timeLeft === 0 || isVerifying}
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

export default ConfirmOtp;
