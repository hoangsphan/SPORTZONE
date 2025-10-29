import React, { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import RevenueSummary from "../components/finance/RevenueSummary";
import RevenueFilter from "../components/finance/RevenueFilter";
import RevenueChart from "../components/finance/RevenueChart";

type MonthlyRevenueItem = {
  month?: string;
  period?: string;
  revenue: number;
};

type RevenueData = {
  ownerId?: number | string;
  ownerName?: string;
  totalRevenue?: number;
  totalFieldRevenue?: number;
  totalServiceRevenue?: number;
  totalOrders?: number;
  facilities?: FacilityType[];
  monthlyRevenue: MonthlyRevenueItem[];
  yearlyRevenue?: MonthlyRevenueItem[];
};

type FilterType = {
  ownerId: string;
  startDate: string;
  endDate: string;
  facilityId: string;
  month?: string;
  year?: string;
};

type FacilityType = {
  facId?: string | number;
  name?: string;
  userId?: string | number;
  [key: string]: string | number | undefined;
};

const FinanceManager: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [filter, setFilter] = useState<FilterType>({
    ownerId: String(user.UId || ""),
    startDate: "",
    endDate: "",
    facilityId: "",
    month: "",
    year: "",
  });
  const [facilities, setFacilities] = useState<FacilityType[]>([]);

  const fetchFacilities = async () => {
    try {
      const res = await fetch(
        "https://localhost:7057/api/Facility/with-details"
      );
      const data = await res.json();
      setFacilities(data);
    } catch {
      setFacilities([]);
    }
  };

  const fetchTotalRevenue = async () => {
    setLoading(true);
    setError("");
    try {
      let url = `https://localhost:7057/api/Order/Owner/${filter.ownerId}/TotalRevenue`;
      const params = [];
      if (filter.startDate) params.push(`startDate=${filter.startDate}`);
      if (filter.endDate) params.push(`endDate=${filter.endDate}`);
      if (filter.facilityId) params.push(`facilityId=${filter.facilityId}`);
      if (params.length > 0) url += `?${params.join("&")}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        console.log("API doanh thu trả về:", data.data);
        if (data.data && Array.isArray(data.data.monthlyRevenue)) {
          setRevenueData(data.data);
        } else if (Array.isArray(data.data)) {
          setRevenueData({ monthlyRevenue: data.data });
        } else {
          setRevenueData({ monthlyRevenue: [] });
        }
      } else {
        setError(data.message || "Lỗi lấy dữ liệu");
      }
    } catch {
      setError("Lỗi kết nối server");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  useEffect(() => {
    fetchTotalRevenue();
  }, [filter]);

  const handleFilterChange = (newFilter: Partial<FilterType>) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setFilter((prev) => ({
      ...prev,
      ...newFilter,
      ownerId: String(user.UId || ""),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="w-60 fixed h-full z-20 shadow-lg">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col ml-60">
        <main className="flex-1 flex flex-col items-center justify-start py-10 px-8">
          <div className="w-full max-w-7xl">
            <h1 className="text-3xl font-extrabold mb-8 text-green-800 text-left">
              Thống kê doanh thu
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
              <div className="md:col-span-3 flex flex-col gap-6">
                <RevenueSummary
                  data={revenueData ?? undefined}
                  loading={loading}
                  error={error}
                />
                <div className="bg-white rounded-xl shadow-md p-6 mt-6">
                  <RevenueChart
                    data={(() => {
                      if (!revenueData) return { monthlyRevenue: [] };
                      // Nếu filter.year có giá trị, dùng yearlyRevenue
                      if (
                        filter.year &&
                        Array.isArray(revenueData.yearlyRevenue)
                      ) {
                        return {
                          monthlyRevenue: revenueData.yearlyRevenue.map(
                            (item) => ({
                              month: String(item.month || item.period || ""),
                              revenue: item.revenue,
                            })
                          ),
                        };
                      }
                      // Nếu filter.month có giá trị, dùng monthlyRevenue
                      if (
                        filter.month &&
                        Array.isArray(revenueData.monthlyRevenue)
                      ) {
                        return {
                          monthlyRevenue: revenueData.monthlyRevenue.map(
                            (item) => ({
                              month: item.month || item.period,
                              revenue: item.revenue,
                            })
                          ),
                        };
                      }
                      // Mặc định: dùng monthlyRevenue
                      if (Array.isArray(revenueData.monthlyRevenue)) {
                        return {
                          monthlyRevenue: revenueData.monthlyRevenue.map(
                            (item) => ({
                              month: item.month || item.period,
                              revenue: item.revenue,
                            })
                          ),
                        };
                      }
                      return { monthlyRevenue: [] };
                    })()}
                    loading={loading}
                    error={error}
                  />
                </div>
              </div>
              <div className="md:col-span-1 flex justify-center">
                <div className="w-full max-w-xs">
                  <RevenueFilter
                    filter={filter}
                    onChange={handleFilterChange}
                    facilities={facilities.map((f) => ({
                      facId: String(f.facId ?? ""),
                      name: f.name ?? "",
                      userId: String(f.userId ?? ""),
                      ...Object.fromEntries(
                        Object.entries(f).filter(
                          ([key]) => !["facId", "name", "userId"].includes(key)
                        )
                      ),
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FinanceManager;
