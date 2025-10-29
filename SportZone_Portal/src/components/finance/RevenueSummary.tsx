import React from "react";

interface RevenueSummaryData {
  totalRevenue?: number;
  totalFieldRevenue?: number;
  totalServiceRevenue?: number;
}

interface RevenueSummaryProps {
  data?: RevenueSummaryData;
  loading: boolean;
  error?: string;
}

const RevenueSummary: React.FC<RevenueSummaryProps> = ({
  data,
  loading,
  error,
}) => {
  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!data) return <div>Không có dữ liệu</div>;
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="bg-white rounded shadow p-6 border-t-8 border-green-600 flex flex-col items-center">
        <div className="font-semibold text-white bg-green-600 rounded-t px-4 py-2 mb-4">
          Tổng doanh thu
        </div>
        <div className="text-3xl font-bold text-green-600 text-center">
          {data.totalRevenue?.toLocaleString()}
        </div>
      </div>
      <div className="bg-white rounded shadow p-6 border-t-8 border-green-600 flex flex-col items-center">
        <div className="font-semibold text-white bg-green-600 rounded-t px-4 py-2 mb-4">
          Doanh thu từ thuê sân
        </div>
        <div className="text-3xl font-bold text-green-600 text-center">
          {data.totalFieldRevenue?.toLocaleString()}
        </div>
      </div>
      <div className="bg-white rounded shadow p-6 border-t-8 border-green-600 flex flex-col items-center">
        <div className="font-semibold text-white bg-green-600 rounded-t px-4 py-2 mb-4">
          Doanh thu từ dịch vụ
        </div>
        <div className="text-3xl font-bold text-green-600 text-center">
          {data.totalServiceRevenue?.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default RevenueSummary;
