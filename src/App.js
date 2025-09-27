import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Main from './components/main/Main';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/profile';
import NotificationsPage from './pages/NotificationsPage';
import { ChatProvider } from './context/ChatContext';
import { NotificationProvider } from './context/NotificationContext';
import NotificationManager from './components/notifications/NotificationManager';
import RegisterForm from './components/login/RegisterForm';
import Otp from './components/login/Otp';
import Login from './components/login/Login';
import Password_change from './components/password_change/Password_change';
import ConfirmOtp from './components/password_change/ConfirmOtp';
import NewPassword from './components/password_change/NewPassword';

import SearchPage from './components/searchPage/searchPage';
import { GetTokenFromCookie } from './components/getToken/GetToken';
import VideoCall from './components/videocall/VideoCall'; // or actual path
import BlockedUserMonitor from './components/auth/BlockedUserMonitor';
// Import axios config to initialize interceptors
import './utils/axiosConfig';
import CallUser from './components/videocall/CallUser';
import ReceiveCall from './components/videocall/ReceiveCall';
import IncomingCallNotification from './components/videocall/IncomingCallNotification';
import Reel from './components/Reels/Reel';
import FeatureTest from './components/test/FeatureTest';
import MainApp from '../src/AdminPanel/app/page';
import Settings from './components/SettingPage/Settings';
import Saved from './components/SettingPage/Saved';
import Archive from './components/SettingPage/Archive';
import YourActivity from './components/SettingPage/YourActivity';
import Blocked from './components/SettingPage/Blocked';
import RoleGuard from './AdminPanel/RoleGuard/RoleGuard';
import HideYourStory from './components/SettingPage/HideYourStory';
import Privacy from './components/SettingPage/Privacy';
import TimeManagement from './components/SettingPage/TimeManagement';
import PagesSection from './pages/PagesSection/PagesSection';
import PageDetail from './pages/PageDetail/PageDetail';

function App() {
  useEffect(() => {
    const decodedUser = GetTokenFromCookie();
    /* console.log(...) */ void 0;
  }, []);

  return (
    <Router>
      <NotificationProvider>
        <ChatProvider>
          {/* Global incoming call notification handler */}
          <IncomingCallNotification />
          
          {/* Global notification popup handler */}
          <NotificationManager />
          
          {/* Global blocked user monitor */}
          <BlockedUserMonitor />
          
          <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/otp" element={<Otp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/change" element={<Password_change />} />
                    <Route path="/confirmOtp" element={<ConfirmOtp />} />
          <Route path="/newPassword" element={<NewPassword />} />

          <Route path="/search" element={<SearchPage />} />
          <Route path="/reels" element={<Reel />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/saved" element={<Saved />} />
          <Route path="/settings/archived" element={<Archive />} />
          <Route path="/settings/your-activity" element={<YourActivity />} />
          <Route path="/settings/blocked" element={<Blocked />} />
          <Route path="/settings/hide-your-story" element={<HideYourStory />} />
          <Route path="/settings/privacy" element={<Privacy />} />
          <Route path="/settings/time-management" element={<TimeManagement />} />

  {/* Pages Section */}
  <Route path="/pages" element={<PagesSection />} />
          <Route path="/page/:pageId" element={<PageDetail />} />


          <Route path="/test" element={<FeatureTest />} />

          {/* ✅ New video call route */}
          {/* <Route path="/video/:roomID" element={<VideoCall/>} /> */}
                    <Route path="/call" element={<CallUser />} />
           <Route path="/receive" element={<ReceiveCall />} />
          <Route path="/video-call" element={<VideoCall />} />
            {/* <Route path="/admin" element={<MainApp/>} /> */}
            <Route path="/admin" element={  <RoleGuard allowedRoles={["ADMIN"]}> <MainApp /> </RoleGuard> }/>
        </Routes>
        
        {/* Toast Container for notifications */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={true}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        </ChatProvider>
      </NotificationProvider>
    </Router>
  );
}

export default App;
