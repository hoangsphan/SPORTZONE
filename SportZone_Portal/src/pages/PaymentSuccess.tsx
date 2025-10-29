import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PaymentSuccess: React.FC = () => {
  const query = useQuery();
  const bookingId = query.get("bookingId");
  const message = query.get("message") || "Thanh toán thành công!";
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 px-2 py-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-lg w-full text-center border border-green-100">
        <div className="flex justify-center mb-6">
          <div
            className="rounded-full border-4 border-green-400 bg-white p-2 shadow-md flex items-center justify-center"
            style={{ width: 90, height: 90 }}
          >
            <svg
              className="w-16 h-16 text-green-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M8 12l2 2l4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-green-700 mb-3 tracking-tight">
          Thanh toán thành công
        </h1>
        <p className="text-gray-700 text-lg mb-2 font-medium">{message}</p>
        {bookingId && (
          <p className="text-gray-500 text-base mb-4">
            Mã booking:{" "}
            <span className="font-bold text-green-700">{bookingId}</span>
          </p>
        )}
        <div className="flex flex-col md:flex-row gap-3 mt-6 justify-center">
          <button
            className="px-7 py-2 bg-green-600 text-white rounded-lg font-semibold text-base shadow hover:bg-green-700 transition focus:outline-none focus:ring-2 focus:ring-green-400"
            onClick={() => navigate("/booking-history")}
          >
            Xem lịch sử đặt sân
          </button>
          <button
            className="px-7 py-2 border-2 border-green-600 text-green-700 rounded-lg font-semibold text-base bg-white hover:bg-green-50 transition focus:outline-none focus:ring-2 focus:ring-green-200"
            onClick={() => navigate("/")}
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
