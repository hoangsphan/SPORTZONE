import React, { useEffect, useState } from "react";
import BookingHistoryItem from "./BookingHistoryItem";
import Header from "../Header";

interface Booking {
  bookingId: number;
  fieldId: number;
  fieldName: string;
  facilityName: string;
  facilityAddress: string;
  userId: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  statusPayment: string;
  createAt: string;
  notes: string;
}

const statusMap: Record<string, { label: string; color: string }> = {
  Confirmed: { label: "Đã xác nhận", color: "bg-green-100 text-green-700" },
  Cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-700" },
  Pending: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700" },
};

const BookingHistoryList: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    let userId = null;
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        userId = parsedUser.uId || parsedUser.UId;
      } catch {
        setError("Không thể lấy thông tin người dùng.");
        setLoading(false);
        return;
      }
    }
    if (!userId) {
      setError("Bạn cần đăng nhập để xem lịch sử đặt sân.");
      setLoading(false);
      return;
    }
    const apiUrl =
      (window as any).REACT_APP_API_URL || "https://localhost:7057";
    const token = localStorage.getItem("token");
    fetch(`${apiUrl}/api/Booking/user/${userId}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => {
        if (res.status === 404) {
          return { success: true, data: [] };
        }
        if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu lịch sử đặt sân");
        return res.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setBookings(data.data);
          setCurrentPage(1); // reset page if data changes
          setError("");
        } else {
          setBookings([]);
          setError("");
        }
      })
      .catch((err) => {
        setBookings([]);
        setError("");
      })
      .finally(() => setLoading(false));
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(bookings.length / pageSize);
  const paginatedBookings = bookings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <>
      <Header />
      <div className="bg-white rounded-xl shadow-lg p-0 md:p-6 border border-[#e6f0ea] mt-4 ml-8 mr-8">
        <div className="bg-gradient-to-r from-[#1ebd6f] to-[#1a3c34] rounded-t-xl px-6 py-5 flex items-center gap-3 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Lịch sử đặt sân
            </h2>
            <div className="text-sm text-[#e6f6ef]">
              Xem lại các đơn đặt sân bạn đã thực hiện
            </div>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : bookings.length === 0 ? (
          <p className="text-center py-8 text-gray-500">
            Bạn chưa có lịch sử đặt sân nào.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-[#f6fefb] sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#1a3c34] uppercase tracking-wider">
                      Sân
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#1a3c34] uppercase tracking-wider">
                      Cơ sở
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#1a3c34] uppercase tracking-wider">
                      Địa chỉ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#1a3c34] uppercase tracking-wider">
                      Ngày
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#1a3c34] uppercase tracking-wider">
                      Giờ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#1a3c34] uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#1a3c34] uppercase tracking-wider">
                      Ghi chú
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {paginatedBookings.map((booking) => (
                    <tr
                      key={booking.bookingId}
                      className="hover:bg-[#e6f6ef] transition"
                    >
                      <td className="px-4 py-3 font-semibold text-[#1a3c34]">
                        {booking.fieldName}
                      </td>
                      <td className="px-4 py-3">{booking.facilityName}</td>
                      <td className="px-4 py-3">{booking.facilityAddress}</td>
                      <td className="px-4 py-3">{booking.date}</td>
                      <td className="px-4 py-3">
                        {booking.startTime.slice(0, 5)} -{" "}
                        {booking.endTime.slice(0, 5)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            statusMap[booking.status]?.color ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {statusMap[booking.status]?.label || booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {booking.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      className={`px-3 py-1 rounded border border-gray-300 font-semibold ${
                        page === currentPage
                          ? "bg-[#1ebd6f] text-white border-[#1ebd6f]"
                          : "bg-white hover:bg-gray-100 text-[#1a3c34]"
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default BookingHistoryList;
