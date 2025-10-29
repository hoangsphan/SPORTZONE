import React from "react";
import SimpleBarChart from "./SimpleBarChart";

type MonthlyRevenue = {
  month: string;
  revenue: number;
};

type RevenueChartProps = {
  data: {
    monthlyRevenue: MonthlyRevenue[];
    [key: string]: unknown;
  } | null;
  loading: boolean;
  error?: string;
};

const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  loading,
  error,
}) => {
  if (loading) return <div>Đang tải biểu đồ...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!data || !data.monthlyRevenue || data.monthlyRevenue.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400">
        (Biểu đồ doanh thu sẽ hiển thị ở đây)
      </div>
    );
  }
  return (
    <div className="h-64 flex items-center justify-center">
      <div className="w-full max-w-[600px]">
        <SimpleBarChart
          data={{
            monthlyRevenue: data.monthlyRevenue.map(({ month, revenue }) => ({
              period: month,
              revenue,
            })),
          }}
        />
      </div>
    </div>
  );
};

export default RevenueChart;
