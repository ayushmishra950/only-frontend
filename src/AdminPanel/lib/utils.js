import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Essential utility function for combining classes (used by shadcn components)
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Counter animation function
export function animateCounter(element, start, end, duration = 2000) {
  const startTime = performance.now()
  const difference = end - start

  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Easing function (ease-out cubic)
    const easedProgress = 1 - Math.pow(1 - progress, 3)

    const current = Math.floor(start + difference * easedProgress)
    element.textContent = current.toLocaleString()

    if (progress < 1) {
      requestAnimationFrame(updateCounter)
    } else {
      element.textContent = end.toLocaleString()
    }
  }

  requestAnimationFrame(updateCounter)
}

// Animate bar charts
export function animateCharts() {
  const chartContainers = ["registered-chart", "active-chart", "blocked-chart"]

  chartContainers.forEach((chartId) => {
    const chart = document.getElementById(chartId)
    if (chart) {
      const bars = chart.querySelectorAll("[data-height]")
      bars.forEach((bar, index) => {
        const targetHeight = bar.getAttribute("data-height") + "px"
        setTimeout(() => {
          bar.style.height = targetHeight
        }, index * 200)
      })
    }
  })
}

// Theme utilities (if needed for future enhancements)
export function toggleTheme() {
  // Theme toggle functionality can be added here
  /* console.log(...) */ void 0
}

// Search functionality helper
export function handleSearch(query) {
  // Search functionality can be implemented here
  /* console.log(...) */ void 0
}

// Notification helper
export function handleNotifications() {
  // Notification functionality can be implemented here
  /* console.log(...) */ void 0
}
