import React, { useEffect, useState } from "react";
import DashboardService from "../services/dashboardService";
import { toast } from "react-toastify";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// KPI TILES - Summary Cards
const SummaryCard = ({
  title,
  monthValue,
  allTimeValue,
  imageSrc,
  color = "text-gray-900",
  trend,
}) => (
  <div className="flex-1 bg-white rounded-lg p-4 shadow-sm border">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="text-sm text-gray-500">{title}</div>
        <div className={`text-2xl font-bold ${color} mt-2`}>{monthValue}</div>
        <div className="mt-1 text-xs text-gray-500">
          Tất cả: <span className="font-semibold">{allTimeValue}</span>
        </div>
        {trend !== undefined && (
          <div className="mt-2 flex items-center gap-1">
            {trend >= 0 ? (
              <svg
                className="w-4 h-4 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span
              className={`text-xs font-semibold ${
                trend >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {Math.abs(trend)}%
            </span>
            <span className="text-xs text-gray-500">vs tháng trước</span>
          </div>
        )}
      </div>
      <div className="w-12 h-12 flex items-center justify-center">
        <img src={imageSrc} alt={title} className="w-12 h-12 object-contain" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    fetchDashboardData(selectedMonth);
  }, [selectedMonth]);

  const fetchDashboardData = async (month) => {
    setLoading(true);
    try {
      const response = await DashboardService.getDashboardStats(month);
      setDashboardData(response);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải dữ liệu", { autoClose: 800 });
    } finally {
      setLoading(false);
    }
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = dashboardData.donut_data.reduce(
        (sum, item) => sum + item.value,
        0
      );
      const percentage =
        total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;

      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.payload.color }}
            />
            <p className="font-semibold text-gray-800">{data.name}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">Số lượng: </span>
              <span className="text-sm font-semibold text-gray-800">
                {data.value}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">Tỷ lệ: </span>
              <span className="text-sm font-semibold text-blue-600">
                {percentage}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = (entry) => {
    const total = dashboardData.donut_data.reduce(
      (sum, item) => sum + item.value,
      0
    );
    const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
    return `${percentage}%`;
  };

  if (loading || !dashboardData) {
    return (
      <div className="w-full px-8 py-8">
        <div className="text-center py-12 text-gray-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4">Đang tải... </p>
        </div>
      </div>
    );
  }

  const { kpi, average, donut_data } = dashboardData;

  // Progress circle data
  const progressData = [
    { name: "Current", value: average.current_percentage, color: "#3cb051" },
    {
      name: "Remaining",
      value: 100 - average.current_percentage,
      color: "#e5e7eb",
    },
  ];

  return (
    <div className="w-full px-8 py-8">
      {/* Header with Month Selector */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Tổng quan</h2>
          <p className="text-sm text-gray-500 mt-1">
            Theo dõi hiệu suất đánh giá khách hàng
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-600 mr-2">Chọn tháng:</label>
          <input
            type="month"
            className="px-1 rounded-lg border border-gray-300 bg-white text-gray-700  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
      </div>

      {/* KPI TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Rất hài lòng"
          monthValue={kpi.current.very_satisfied}
          allTimeValue={kpi.all_time.very_satisfied}
          trend={kpi.trends.very_satisfied}
          color="text-green-700"
          imageSrc="/assets/img/emotions/rathailong.png"
        />
        <SummaryCard
          title="Hài lòng"
          monthValue={kpi.current.satisfied}
          allTimeValue={kpi.all_time.satisfied}
          trend={kpi.trends.satisfied}
          color="text-green-600"
          imageSrc="/assets/img/emotions/hailong.png"
        />
        <SummaryCard
          title="Bình thường"
          monthValue={kpi.current.neutral}
          allTimeValue={kpi.all_time.neutral}
          trend={kpi.trends.neutral}
          color="text-yellow-500"
          imageSrc="/assets/img/emotions/binhthuong.png"
        />
        <SummaryCard
          title="Không hài lòng"
          monthValue={kpi.current.negative}
          allTimeValue={kpi.all_time.negative}
          trend={kpi.trends.negative}
          color="text-red-500"
          imageSrc="/assets/img/emotions/khonghailong.png"
        />
      </div>

      {/* 2 CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg overflow-hidden shadow">
          <div className="p-6 border-b">
            <h3 className="text-xl font-bold text-gray-900">
              Phân bổ đánh giá theo tháng
            </h3>
            <p className="text-sm text-gray-500 mt-1">Tháng đã chọn</p>
          </div>

          <div className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donut_data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={100}
                    dataKey="value"
                    animationDuration={800}
                  >
                    {donut_data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 2. AVERAGE PERCENTAGE */}
        <div className="bg-white rounded-lg overflow-hidden shadow">
          <div className="p-6 border-b">
            <h3 className="text-xl font-bold text-gray-900">
              Tỷ lệ hài lòng trung bình
            </h3>
            <p className="text-sm text-gray-500 mt-1">Tháng đã chọn</p>
          </div>

          <div className="p-6">
            <div className="h-80 flex flex-col">
              {/* Chart Area */}
              <div className="flex-1 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={progressData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                    >
                      {progressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {average.current_percentage}
                    <span className="text-2xl text-gray-500">%</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Tỷ lệ hài lòng
                  </div>
                </div>
              </div>

              {/* Comparison Info */}
              <div className="flex items-center justify-center gap-6 pt-2">
                <div className="text-center">
                  <div className="text-xs text-gray-500">Tháng trước</div>
                  <div className="text-lg font-bold text-gray-700">
                    {average.previous_percentage}%
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {average.difference >= 0 ? (
                    <>
                      <svg
                        className="w-6 h-6 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-2xl font-bold text-green-600">
                        {average.difference}%
                      </span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-6 h-6 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-2xl font-bold text-red-600">
                        {average.difference}%
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
