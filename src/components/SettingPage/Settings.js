import React from "react";
import { useNavigate } from "react-router-dom";
import SettingItem from "./SettingItem";

// Simple inline icons to avoid extra dependencies
const Icon = {
  bookmark: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 2a2 2 0 0 0-2 2v18l8-4 8 4V4a2 2 0 0 0-2-2H6z" />
    </svg>
  ),
  archive: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 3h18v4H3V3zm2 6h14v12H5V9zm3 3v2h8v-2H8z" />
    </svg>
  ),
  activity: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 13h4l2-6 4 14 3-8h5" />
    </svg>
  ),
  lock: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a5 5 0 0 0-5 5v3H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 1 1 6 0v3H9z" />
    </svg>
  ),
  block: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-8 10a8 8 0 0 1 12.9-6.3L5.7 17.9A7.96 7.96 0 0 1 4 12zm8 8a8 8 0 0 1-6.3-3.1L18.9 4.6A8 8 0 0 1 12 20z" />
    </svg>
  ),
  time: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm1 11H7v-2h4V6h2v7z" />
    </svg>
  ),
  hide: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 5c-7 0-10 7-10 7s2.2 4.3 6.6 6.2L4 23l2 1 4-5c.6.1 1.3.1 2 .1 7 0 10-7 10-7S19 5 12 5z" />
    </svg>
  ),
  arrowLeft: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  ),
};

export default function Settings() {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-none px-4 py-4">
      <div className="flex items-center mb-4">
        <button
          onClick={() => navigate("/")}
          className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
          title="Go back"
        >
          <span className="text-gray-600">{Icon.arrowLeft}</span>
        </button>
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>

      <div className="border rounded-xl divide-y">
        <div className="p-2">
          <SettingItem
            to="/settings/saved"
            icon={<span className="text-blue-500">{Icon.bookmark}</span>}
            title="Saved"
            subtitle="View your saved posts and videos"
          />
          <SettingItem
            to="/settings/archived"
            icon={<span className="text-purple-500">{Icon.archive}</span>}
            title="Archive"
            subtitle="Posts only you can see"
          />
          <SettingItem
            to="/settings/your-activity"
            icon={<span className="text-green-500">{Icon.activity}</span>}
            title="Your Activity"
            subtitle="Review posts you've liked and commented on"
          />
          <SettingItem
            to="/settings/privacy"
            icon={<span className="text-pink-500">{Icon.lock}</span>}
            title="Privacy"
            subtitle="Manage your account privacy"
          />
          <SettingItem
            to="/settings/blocked"
            icon={<span className="text-gray-500">{Icon.block}</span>}
            title="Blocked"
            subtitle="Manage blocked accounts"
          />
          <SettingItem
            to="/settings/time-management"
            icon={<span className="text-orange-500">{Icon.time}</span>}
            title="Time Management"
            subtitle="See how much time you spend on the app"
          />
          <SettingItem
            to="/settings/hide-your-story"
            icon={<span className="text-indigo-500">{Icon.hide}</span>}
            title="Hide Your Story"
            subtitle="Hide your story from specific people"
          />
        </div>
      </div>
    </div>
  );
}