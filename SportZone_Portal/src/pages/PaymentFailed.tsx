import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PaymentFailed: React.FC = () => {
  const query = useQuery();
  const error =
    query.get("error") ||
    "Thanh toán thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ.";
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100 px-2 py-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-lg w-full text-center border border-red-100">
        <div className="flex justify-center mb-6">
          <div
            className="rounded-full border-4 border-red-400 bg-white p-2 shadow-md flex items-center justify-center"
            style={{ width: 90, height: 90 }}
          >
            <svg
              className="w-16 h-16 text-red-500"
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
                d="M15 9l-6 6M9 9l6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-red-700 mb-3 tracking-tight">
          Thanh toán thất bại
        </h1>
        <p className="text-gray-700 text-lg mb-2 font-medium">{error}</p>
        <div className="flex flex-col md:flex-row gap-3 mt-6 justify-center">
          <button
            className="px-7 py-2 bg-red-600 text-white rounded-lg font-semibold text-base shadow hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-400"
            onClick={() => navigate("/booking-history")}
          >
            Xem lịch sử đặt sân
          </button>
          <button
            className="px-7 py-2 border-2 border-red-600 text-red-700 rounded-lg font-semibold text-base bg-white hover:bg-red-50 transition focus:outline-none focus:ring-2 focus:ring-red-200"
            onClick={() => navigate("/")}
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
