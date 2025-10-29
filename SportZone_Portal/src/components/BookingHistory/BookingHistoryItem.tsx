import React from "react";

interface BookingHistoryItemProps {
  booking: {
    id: number;
    fieldName: string;
    date: string;
    time: string;
    status: string;
    price: number;
  };
}

const statusColor: Record<string, string> = {
  "Đã xác nhận": "text-green-600",
  "Đã hủy": "text-red-500",
  "Chờ xác nhận": "text-yellow-500",
};

const BookingHistoryItem: React.FC<BookingHistoryItemProps> = ({ booking }) => {
  return (
    <div className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between bg-gray-50">
      <div>
        <div className="font-semibold text-lg">{booking.fieldName}</div>
        <div className="text-sm text-gray-600">Ngày: {booking.date}</div>
        <div className="text-sm text-gray-600">Khung giờ: {booking.time}</div>
      </div>
      <div className="flex flex-col md:items-end mt-2 md:mt-0">
        <span
          className={`font-medium ${
            statusColor[booking.status] || "text-gray-700"
          }`}
        >
          {booking.status}
        </span>
        <span className="text-base font-bold text-[#1ebd6f]">
          {booking.price.toLocaleString()} đ
        </span>
      </div>
    </div>
  );
};

export default BookingHistoryItem;
