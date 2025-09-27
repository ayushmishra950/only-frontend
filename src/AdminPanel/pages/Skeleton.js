"use client"

const Skeleton = ({ className = "", variant = "circle", ...props }) => {
  const baseClasses = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
  const variants = {
    circle: "rounded-full",
    rectangle: "rounded",
  }
  return (
    <div
      className={`${baseClasses} ${variants[variant]} ${className}`}
      style={{
        background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 2s infinite",
      }}
      {...props}
    />
  )
}

// Add shimmer animation to global styles
if (typeof document !== "undefined") {
  const style = document.createElement("style")
  style.textContent = `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `
  document.head.appendChild(style)
}

export default Skeleton
