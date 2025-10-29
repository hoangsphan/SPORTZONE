import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyRevenueItem {
  period: string;
  revenue: number;
}

interface SimpleBarChartProps {
  data: {
    monthlyRevenue: MonthlyRevenueItem[];
  };
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data }) => {
  if (!data || !data.monthlyRevenue) return null;
  const labels = data.monthlyRevenue.map((item) => item.period);
  const revenues = data.monthlyRevenue.map((item) => item.revenue);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Doanh thu theo tháng",
        data: revenues,
        backgroundColor: "#16a34a",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Biểu đồ doanh thu theo tháng" },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default SimpleBarChart;
