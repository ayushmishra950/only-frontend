import React, { useMemo } from "react";
import PageShell from "./PageShell";
import { gql, useQuery } from "@apollo/client";
import { GetTokenFromCookie } from "../getToken/GetToken";

const ACTIVITY_LOGS_QUERY = gql`
  query ActivityLogs($userId: ID!) {
    activityLogs(userId: $userId) {
      date
      totalMinutes
    }
  }
`;

export default function TimeManagement() {
  const decoded = GetTokenFromCookie();
  const userId = decoded?.id;

  const { data, loading, error } = useQuery(ACTIVITY_LOGS_QUERY, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: "cache-first",
    errorPolicy: "ignore",
  });

  const { chartData, maxVal } = useMemo(() => {
    const logs = data?.activityLogs || [];

    const getDateString = (d = new Date()) => d.toISOString().split("T")[0];
    const daysBack = 7;
    const last7Days = Array.from({ length: daysBack }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (daysBack - 1 - i)); // oldest -> newest
      return getDateString(d);
    });

    const minutesByDate = logs.reduce((map, l) => {
      if (l?.date) map.set(l.date, Number(l.totalMinutes) || 0);
      return map;
    }, new Map());

    const dataPoints = last7Days.map((dateStr, index) => {
      const minutes = minutesByDate.get(dateStr) || 0;
      const hours = Number((minutes / 60).toFixed(1));
      const today = getDateString();
      const isToday = dateStr === today;
      const day = isToday ? "Today" : new Date(dateStr).toLocaleDateString(undefined, { weekday: "short" });
      return { day, value: hours };
    });

    const max = Math.max(1, ...dataPoints.map((d) => d.value));
    return { chartData: dataPoints, maxVal: max };
  }, [data]);

  return (
    <PageShell title="Time Management">
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 truncate">
          Last 7 Days Activity (Hours)
        </h3>
        <div className="h-48 sm:h-64 flex items-end justify-center space-x-2 sm:space-x-6 px-2 sm:px-4 overflow-hidden">
          {(loading ? Array.from({ length: 7 }, () => ({ day: "", value: 0 })) : chartData).map((bar, index) => {
              // Calculate height percentage with clear visual differences like Instagram
              let heightPercentage = 0;
              if (bar.value > 0) {
                // Linear scaling with wider range for better visual distinction
                const ratio = bar.value / maxVal;
                if (ratio >= 0.8) {
                  heightPercentage = 75 + (ratio - 0.8) * 75; // 75-90% for high usage
                } else if (ratio >= 0.5) {
                  heightPercentage = 50 + (ratio - 0.5) * 83; // 50-75% for medium usage
                } else if (ratio >= 0.2) {
                  heightPercentage = 25 + (ratio - 0.2) * 83; // 25-50% for low-medium usage
                } else {
                  heightPercentage = 8 + ratio * 85; // 8-25% for very low usage
                }
              } else {
                heightPercentage = 3; // Very small for no activity
              }
              
              return (
                <div key={index} className="flex flex-col items-center min-w-0 flex-1 max-w-16">
                  <div
                    className={`bg-[#B65FCF] w-8 sm:w-12 rounded-t-lg shadow-sm ${
                      loading ? "opacity-50" : "hover:opacity-80"
                    } transition-all duration-700 ease-out ${
                      bar.value === 0 ? "bg-gray-200" : ""
                    }`}
                    style={{ 
                      height: `${heightPercentage}%`,
                      minHeight: bar.value > 0 ? "12px" : "4px"
                    }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-1 sm:mt-2 font-medium truncate">
                    {bar.day}
                  </span>
                  <span className="text-xs text-gray-400 truncate">
                    {bar.value === 0 ? "0m" : bar.value < 1 ? `${Math.round(bar.value * 60)}m` : `${bar.value}h`}
                  </span>
                </div>
              );
            })}
          </div>
        {/* )} */}
      </div>
    </PageShell>
  );
}