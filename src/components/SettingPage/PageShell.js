import React from "react";
import { Link } from "react-router-dom";

// Simple page shell with title and back link
export default function PageShell({ title, children }) {
  return (
    <div className="w-full max-w-none px-4 py-4">
      <div className="flex items-center gap-4 mb-4">
        <Link
          to="/settings"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#f0f4ff',
            color: '#2563eb',
            border: 'none',
            borderRadius: '999px',
            padding: '6px 16px',
            fontWeight: 600,
            fontSize: 15,
            textDecoration: 'none',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            transition: 'background 0.2s, color 0.2s',
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = '#2563eb';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = '#f0f4ff';
            e.currentTarget.style.color = '#2563eb';
          }}
        >
          <span style={{ fontSize: 18, marginRight: 6 }}>&larr;</span> Back
        </Link>
        <h2 className="text-xl font-semibold" style={{marginBottom: 0}}>{title}</h2>
      </div>
      <div style={{padding: 0}}>{children}</div>
    </div>
  );
}