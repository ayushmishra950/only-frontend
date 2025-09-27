"use client"

import {
  Search,
  Bell,
  User,
  Clock,
  TrendingUp,
  LineChart,
  BarChart2,
  PieChart,
  Calendar,
  Zap,
  Coffee,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import CountUp from "react-countup"
import { useQuery, gql } from "@apollo/client"

// GraphQL query to fetch activity logs
const ACTIVITY_LOGS_QUERY = gql`
  query ActivityLogs($userId: ID!) {
    activityLogs(userId: $userId) {
      date
      totalMinutes
      sessions {
        startTime
        endTime
        duration
        device
      }
    }
  }
`;

// This is a dummy component for the skeleton loading state
const Skeleton = ({ className }) => (
  <div className={`bg-gray-200 animate-pulse rounded-md ${className}`}></div>
)

export default function UserActivityDashboard({ selectedUser }) {
  const [isAnimated, setIsAnimated] = useState(false)
  const [isCardLoading, setIsCardLoading] = useState(true)

  // Fetch activity logs for the selected user
  const { data, loading, error } = useQuery(ACTIVITY_LOGS_QUERY, {
    variables: { userId: selectedUser?.id },
    skip: !selectedUser?.id,
    fetchPolicy: "cache-first",
  });

  // Compute all-time totals and average per day
  const logs = data?.activityLogs || [];
  const totalMinutesAllTime = logs.reduce(
    (sum, log) => sum + (Number(log?.totalMinutes) || 0),
    0
  );
  const totalHoursAllTime = Number((totalMinutesAllTime / 60).toFixed(1));
  const uniqueDays = logs.length;
  const averageHoursPerDay = uniqueDays
    ? Number(((totalMinutesAllTime / uniqueDays) / 60).toFixed(1))
    : 0;

  // Today's active time in hours
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMinutes = logs.reduce((sum, log) =>
    sum + (log?.date === todayStr ? (Number(log?.totalMinutes) || 0) : 0)
  , 0);
  const todayHours = Number((todayMinutes / 60).toFixed(1));

  useEffect(() => {
    // Animate charts after a short delay
    const chartTimer = setTimeout(() => {
      setIsAnimated(true)
    }, 100)

    // Simulate a loading state for stat cards
    const cardTimer = setTimeout(() => {
      setIsCardLoading(false)
    }, 800)

    return () => {
      clearTimeout(chartTimer)
      clearTimeout(cardTimer)
    }
  }, [])

  // 1. Overview Stat Cards
  const stats = [
    {
      title: "Total Active Hours (All Time)",
      value: loading ? 0 : totalHoursAllTime,
      startValue: 0,
      displayValue: undefined,
      change: null,
      icon: Clock,
      color: "text-blue-500",
    },
    {
      title: "Average Daily Usage",
      value: loading ? 0 : averageHoursPerDay,
      startValue: 0,
      displayValue: undefined,
      change: null,
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "Today Active Time",
      value: loading ? 0 : todayHours,
      startValue: 0,
      displayValue: undefined,
      change: null,
      icon: Clock,
      color: "text-purple-500",
    },
  ]

  // 2. Charts Data (computed from logs): Last 7 days, per day active hours
  const getDateString = (d = new Date()) => d.toISOString().split('T')[0];
  const daysBack = 7;
  const last7Days = Array.from({ length: daysBack }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (daysBack - 1 - i)); // oldest -> newest
    return getDateString(d);
  });

  // Map date -> totalMinutes for quick lookup
  const minutesByDate = logs.reduce((map, l) => {
    if (l?.date) map.set(l.date, Number(l.totalMinutes) || 0);
    return map;
  }, new Map());

  const dailyUsageData = last7Days.map((dateStr) => {
    const minutes = minutesByDate.get(dateStr) || 0;
    const hours = Number((minutes / 60).toFixed(1));
    const day = new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short' });
    return { day, value: hours };
  });

  // Weekly Summary: last 4 weeks, sum of minutes per week -> hours
  const startOfWeek = (d) => {
    const date = new Date(d);
    const day = date.getDay(); // 0=Sun..6=Sat
    const diff = (day + 6) % 7; // Monday as start
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - diff);
    return date;
  };
  const currentWeekStart = startOfWeek(new Date());
  const weekStarts = Array.from({ length: 4 }, (_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - (3 - i) * 7); // oldest -> newest
    return d;
  });

  const weeklySummaryData = weekStarts.map((ws, idx) => {
    let minutes = 0;
    for (let offset = 0; offset < 7; offset++) {
      const d = new Date(ws);
      d.setDate(d.getDate() + offset);
      const ds = getDateString(d);
      minutes += minutesByDate.get(ds) || 0;
    }
    const hours = Number((minutes / 60).toFixed(1));
    return { week: `Wk ${idx + 1}`, value: hours };
  });

  // Calculate device split data from sessions
  const deviceSplitData = useMemo(() => {
    if (!logs || logs.length === 0) return [
      { label: "Mobile", value: 0, color: "bg-purple-500" },
      { label: "Desktop", value: 0, color: "bg-blue-500" },
      { label: "Tablet", value: 0, color: "bg-green-500" },
    ];

    // Collect all sessions from all logs
    const allSessions = logs.flatMap(log => log.sessions || []);
    
    // Calculate total minutes by device
    const deviceMinutes = {
      Mobile: 0,
      Desktop: 0,
      Tablet: 0
    };
    
    allSessions.forEach(session => {
      if (session.device && session.duration) {
        deviceMinutes[session.device] += session.duration;
      }
    });
    
    // Calculate percentages
    const totalMinutes = Object.values(deviceMinutes).reduce((sum, val) => sum + val, 0);
    
    return [
      { label: "Mobile", value: totalMinutes > 0 ? Math.round((deviceMinutes.Mobile / totalMinutes) * 100) : 0, color: "bg-purple-500" },
      { label: "Desktop", value: totalMinutes > 0 ? Math.round((deviceMinutes.Desktop / totalMinutes) * 100) : 0, color: "bg-blue-500" },
      { label: "Tablet", value: totalMinutes > 0 ? Math.round((deviceMinutes.Tablet / totalMinutes) * 100) : 0, color: "bg-green-500" },
    ];
  }, [logs])
  const deviceTotal = deviceSplitData.reduce((sum, item) => sum + item.value, 0)

  // 3. Detailed Activity Table
  const activityData = [
    {
      date: "20 Aug 2025",
      hours: "1h 50m",
      login: "09:00 PM",
      logout: "10:50 PM",
      device: "Desktop",
    },
    {
      date: "19 Aug 2025",
      hours: "2h 10m",
      login: "07:30 AM",
      logout: "09:40 AM",
      device: "Mobile",
    },
    {
      date: "18 Aug 2025",
      hours: "0h 45m",
      login: "11:20 PM",
      logout: "12:05 AM",
      device: "Tablet",
    },
    {
      date: "17 Aug 2025",
      hours: "3h 05m",
      login: "04:00 PM",
      logout: "07:05 PM",
      device: "Desktop",
    },
    {
      date: "16 Aug 2025",
      hours: "1h 30m",
      login: "09:30 AM",
      logout: "11:00 AM",
      device: "Mobile",
    },
  ]

  // 4. Engagement Insights
  const timeSplitData = useMemo(() => {
    if (!logs || logs.length === 0) return [
      { label: "Morning", value: 0, color: "bg-red-400" },
      { label: "Afternoon", value: 0, color: "bg-orange-400" },
      { label: "Evening", value: 0, color: "bg-yellow-400" },
      { label: "Night", value: 0, color: "bg-blue-400" },
    ];

    // Collect all sessions from all logs
    const allSessions = logs.flatMap(log => log.sessions || []);
    
    // Calculate total minutes by time of day
    const timeMinutes = {
      Morning: 0,   // 5:00 - 11:59
      Afternoon: 0, // 12:00 - 16:59
      Evening: 0,   // 17:00 - 20:59
      Night: 0      // 21:00 - 4:59
    };
    
    allSessions.forEach(session => {
      if (session.startTime && session.duration) {
        const startHour = new Date(session.startTime).getHours();
        
        // Determine time of day
        let timeOfDay;
        if (startHour >= 5 && startHour < 12) {
          timeOfDay = 'Morning';
        } else if (startHour >= 12 && startHour < 17) {
          timeOfDay = 'Afternoon';
        } else if (startHour >= 17 && startHour < 21) {
          timeOfDay = 'Evening';
        } else {
          timeOfDay = 'Night';
        }
        
        timeMinutes[timeOfDay] += session.duration;
      }
    });
    
    // Calculate percentages
    const totalMinutes = Object.values(timeMinutes).reduce((sum, val) => sum + val, 0);
    
    return [
      { label: "Morning", value: totalMinutes > 0 ? Math.round((timeMinutes.Morning / totalMinutes) * 100) : 0, color: "bg-red-400" },
      { label: "Afternoon", value: totalMinutes > 0 ? Math.round((timeMinutes.Afternoon / totalMinutes) * 100) : 0, color: "bg-orange-400" },
      { label: "Evening", value: totalMinutes > 0 ? Math.round((timeMinutes.Evening / totalMinutes) * 100) : 0, color: "bg-yellow-400" },
      { label: "Night", value: totalMinutes > 0 ? Math.round((timeMinutes.Night / totalMinutes) * 100) : 0, color: "bg-blue-400" },
    ];
  }, [logs])

  // Chart rendering functions
  const renderStatsCards = () => {
    return stats.map((stat, index) => (
      <div
        key={index}
        className="bg-white rounded-lg p-3 sm:p-6 shadow-sm border border-gray-200 min-w-0"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">{stat.title}</h3>
          <stat.icon size={16} className={`${stat.color}`} />
        </div>
        {isCardLoading ? (
          <Skeleton className="h-6 w-24 mb-2" />
        ) : (
          <div className="flex items-end justify-between min-w-0">
            <span className="text-lg sm:text-3xl font-bold text-gray-900 truncate">
              {typeof stat.value === "number" ? (
                <CountUp
                  start={stat.startValue ?? 0}
                  end={stat.value}
                  duration={1.5}
                  decimals={stat.value % 1 !== 0 ? 1 : 0}
                  separator=""
                  useEasing={true}
                  easingFn={(t, b, c, d) => c * ((t = t / d - 1) * t * t + 1) + b}
                />
              ) : (
                stat.displayValue
              )}

            </span>
          </div>
        )}
        {stat.change && (
          <div className="flex items-center mt-1 sm:mt-2 min-w-0">
            <TrendingUp className="text-green-500 mr-1 flex-shrink-0" size={14} />
            <span className="text-xs sm:text-sm text-green-500 truncate">{stat.change}</span>
          </div>
        )}
      </div>
    ))
  }

  const renderBarChart = (title, data, color) => {
    const maxVal = Math.max(...data.map((d) => d.value))
    return (
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 min-w-0">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 truncate">
          <BarChart2 size={18} className="inline mr-2 text-gray-500" />
          {title}
        </h3>
        <div className="h-48 sm:h-64 flex items-end justify-center space-x-2 sm:space-x-6 px-2 sm:px-4 overflow-hidden">
          {data.map((bar, index) => {
            const heightPercentage = (bar.value / maxVal) * 100
            return (
              <div key={index} className="flex flex-col items-center min-w-0 flex-1 max-w-16">
                <div
                  className={`${color} w-8 sm:w-12 rounded-t-lg shadow-sm hover:opacity-80 transition-all duration-1000 ease-out`}
                  style={{
                    height: isAnimated ? `${heightPercentage}%` : "0px",
                    transitionDelay: `${index * 0.2}s`,
                  }}
                ></div>
                <span className="text-xs text-gray-500 mt-1 sm:mt-2 font-medium truncate">
                  {bar.day || bar.week}
                </span>
                <span className="text-xs text-gray-400 truncate">{bar.value}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderDonutChart = (title, data) => {
    let cumulativePercentage = 0
    const createDonutSegment = (percentage, startAngle, color) => {
      const endAngle = startAngle + percentage * 360
      const largeArcFlag = percentage > 0.5 ? 1 : 0

      const startAngleRad = (startAngle * Math.PI) / 180
      const endAngleRad = (endAngle * Math.PI) / 180

      const radius = 45
      const centerX = 64
      const centerY = 64

      const x1 = centerX + radius * Math.cos(startAngleRad)
      const y1 = centerY + radius * Math.sin(startAngleRad)
      const x2 = centerX + radius * Math.cos(endAngleRad)
      const y2 = centerY + radius * Math.sin(endAngleRad)

      return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
    }
    const colors = {
      "bg-purple-500": "#8b5cf6",
      "bg-blue-500": "#3b82f6",
      "bg-green-500": "#10b981",
    }
    const total = data.reduce((sum, item) => sum + item.value, 0)

    return (
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 min-w-0">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 truncate">
          <PieChart size={18} className="inline mr-2 text-gray-500" />
          {title}
        </h3>
        <div className="flex items-center justify-center gap-6">
          <div className="w-32 h-32 relative">
            <svg width="128" height="128" viewBox="0 0 128 128" className="transform -rotate-90">
              {data.map((item, index) => {
                const percentage = item.value / total
                const startAngle = cumulativePercentage * 360
                const path = createDonutSegment(percentage, startAngle, item.color)
                cumulativePercentage += percentage

                return (
                  <path
                    key={index}
                    d={path}
                    fill={colors[item.color]}
                    className="hover:opacity-80 transition-opacity"
                  />
                )
              })}
              <circle cx="64" cy="64" r="25" fill="white" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm font-bold text-gray-900">{total}%</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
          </div>
          <div className="space-y-2 flex-1">
            {data.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gray-50 lg:ml-0 min-w-0">
      <div className="mx-auto min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">
              Activity Dashboard
            </h1>

          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 sm:p-6 min-w-0">


          {/* 1. Overview Stat Cards */}
          <section className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            {renderStatsCards()}
          </section>

          {/* 2. Charts Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Daily Usage Bar Chart */}
            <div className="lg:col-span-2">
              {renderBarChart("Daily Usage (Hours)", dailyUsageData, "bg-blue-500 hover:bg-blue-600")}
            </div>
            {/* Weekly Summary Bar Chart */}
            <div className="hidden lg:block">
              {renderBarChart("Weekly Summary (Hours)", weeklySummaryData, "bg-purple-500 hover:bg-purple-600")}
            </div>
          </section>
          {/* <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            <div className="md:col-span-2 xl:col-span-1">
              {renderDonutChart("Device Split", deviceSplitData)}
            </div>
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 truncate">Engagement Insights</h3>
              <div className="flex items-center justify-between mb-4">
                <span className="flex items-center gap-2 text-gray-700 font-medium">
                  <Zap size={18} className="text-yellow-500" />
                  Active Streak
                </span>
                <span className="text-lg font-bold text-gray-900">6 Days <ChevronRight size={16} className="inline-block text-gray-500" /></span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="flex items-center gap-2 text-gray-700 font-medium">
                  <Coffee size={18} className="text-gray-500" />
                  Idle Days
                </span>
                <span className="text-lg font-bold text-gray-900">3 days</span>
              </div>
              <div className="mt-6">
                <h4 className="text-sm text-gray-500 mb-2">Time Spent Split</h4>
                <div className="grid grid-cols-3 gap-2">
                  {timeSplitData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${item.color} flex items-center justify-center text-white text-xs sm:text-sm font-bold`}>
                        {item.value}%
                      </div>
                      <span className="text-xs mt-1 text-gray-600">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section> */}

          {/* 3. Detailed Activity Table */}
          {/* <section className="mt-6 sm:mt-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <h3 className="text-lg font-semibold p-4 sm:p-6 text-gray-900 border-b border-gray-200">
                <LineChart size={18} className="inline mr-2 text-gray-500" />
                Detailed Activity
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Active Hours
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        First Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Logout
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Device
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activityData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {row.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {row.hours}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {row.login}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {row.logout}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {row.device}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section> */}
        </main>
      </div>
    </div>
  )
}
