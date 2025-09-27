import React from "react";
import { Link } from "react-router-dom";

// Reusable list item with left icon, title+subtitle, and right chevron
export default function SettingItem({ to, icon, title, subtitle }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between w-full px-4 py-4 hover:bg-gray-50 rounded-lg transition"
    >
      <div className="flex items-start gap-4">
        <div className="mt-1 text-gray-500">
          {icon}
        </div>
        <div>
          <div className="font-medium text-gray-900">{title}</div>
          {subtitle && (
            <div className="text-sm text-gray-500">{subtitle}</div>
          )}
        </div>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5 text-gray-400"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
      </svg>
    </Link>
  );
}