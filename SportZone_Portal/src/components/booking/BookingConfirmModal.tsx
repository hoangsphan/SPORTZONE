import React from "react";

// Local interfaces
interface DemoField {
  fieldId: number;
  fieldName: string;
  categoryName: string;
  facilityName?: string;
  facilityAddress?: string;
  image: string;
  openTime: string;
  closeTime: string;
  pricing: unknown[];
}

interface FieldScheduleSlot {
  scheduleId: number;
  fieldId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: "Available" | "Booked" | "Blocked";
  price: number;
}

interface DemoService {
  serviceId: number;
  serviceName: string;
  description?: string;
  price: number;
}

interface BookingConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  booking: {
    field: DemoField | null;
    slots: FieldScheduleSlot[];
    guestInfo: {
      name: string;
      phone: string;
      notes: string;
    };
    services: DemoService[];
    totalPrice: number;
    date: string;
  };
}

const BookingConfirmModal: React.FC<BookingConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm, // Không dùng nữa, xử lý payment trực tiếp ở đây
  booking,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTimeRange = () => {
    if (booking.slots.length === 0) return "";

    // Sort slots by start time
    const sortedSlots = booking.slots.sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

    // Group consecutive slots
    const slotGroups: FieldScheduleSlot[][] = [];
    let currentGroup: FieldScheduleSlot[] = [sortedSlots[0]];

    for (let i = 1; i < sortedSlots.length; i++) {
      const currentSlot = sortedSlots[i];
      const previousSlot = currentGroup[currentGroup.length - 1];

      // Check if current slot is consecutive to the previous one
      if (currentSlot.startTime === previousSlot.endTime) {
        currentGroup.push(currentSlot);
      } else {
        slotGroups.push(currentGroup);
        currentGroup = [currentSlot];
      }
    }
    slotGroups.push(currentGroup);

    // Format each group as time range
    return slotGroups
      .map(
        (group) => `${group[0].startTime} - ${group[group.length - 1].endTime}`
      )
      .join("; ");
  };

  const calculateTotalDuration = () => {
    if (booking.slots.length === 0) return 0;

    let totalMinutes = 0;
    booking.slots.forEach((slot) => {
      const [startHour, startMinute] = slot.startTime.split(":").map(Number);
      const [endHour, endMinute] = slot.endTime.split(":").map(Number);

      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;

      totalMinutes += endTotalMinutes - startTotalMinutes;
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (minutes === 0) {
      return `${hours} giờ`;
    } else {
      return `${hours} giờ ${minutes} phút`;
    }
  };

  const calculateSubtotal = () => {
    return booking.slots.reduce((sum, slot) => sum + slot.price, 0);
  };

  const calculateServicesTotal = () => {
    return booking.services.reduce((sum, service) => sum + service.price, 0);
  };

  const depositAmount = Math.round(booking.totalPrice * 0.5);

  const handlePayment = async () => {
    setLoading(true);
    setError("");
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");
      const slotIds = booking.slots.map((slot) => slot.scheduleId);
      const bookingData = {
        userId: user?.UId || null,
        title: `Đặt sân ${booking.field?.fieldName || "SportZone"}`,
        selectedSlotIds: slotIds,
        fieldId: booking.slots[0]?.fieldId || booking.field?.fieldId,
        facilityId: booking.field?.facId,
        guestName: booking.guestInfo?.name || "Khách hàng",
        guestPhone: booking.guestInfo?.phone || "",
        serviceIds: booking.services?.map((s) => s.serviceId) || [],
        discountId: null,
        notes: booking.guestInfo?.notes || "Đặt sân qua hệ thống online",
        depositAmount,
      };
      let apiUrl = "https://localhost:7057/api/Payment/calculate-and-pay";
      let response;
      try {
        response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(bookingData),
        });
      } catch (httpsError) {
        apiUrl = "http://localhost:7057/api/Payment/calculate-and-pay";
        response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(bookingData),
        });
      }
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Lỗi API: ${response.status}`);
      }
      const result = await response.json();
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        throw new Error(result.message || "Không nhận được paymentUrl từ API");
      }
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi tạo thanh toán");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-green-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Chi tiết đặt lịch</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Đóng modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Facility and Field Info */}
          {booking.field && (
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Thông tin sân
              </h3>
              <div className="flex items-start space-x-4">
                <img
                  src={booking.field.image}
                  alt={booking.field.fieldName}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-lg">
                    {booking.field.fieldName}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {booking.field.facilityName}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {booking.field.facilityAddress}
                  </p>
                  <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {booking.field.categoryName}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Booking Details */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Chi tiết đặt lịch
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Ngày đặt
                </label>
                <p className="text-gray-900">{formatDate(booking.date)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Khung giờ đặt
                </label>
                <p className="text-gray-900">{getTimeRange()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Số slot đã chọn
                </label>
                <p className="text-gray-900">{booking.slots.length} slot</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Tổng thời lượng
                </label>
                <p className="text-gray-900">{calculateTotalDuration()}</p>
              </div>
            </div>

            {/* Chi tiết từng slot */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Chi tiết các slot đã chọn
              </label>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {booking.slots
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((slot) => (
                      <div
                        key={slot.scheduleId}
                        className="bg-white border border-gray-200 rounded px-3 py-2 text-center"
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {slot.startTime} - {slot.endTime}
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          {slot.price.toLocaleString()}đ
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Thông tin khách hàng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Họ tên
                </label>
                <p className="text-gray-900">{booking.guestInfo.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Số điện thoại
                </label>
                <p className="text-gray-900">{booking.guestInfo.phone}</p>
              </div>
              {booking.guestInfo.notes && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Ghi chú
                  </label>
                  <p className="text-gray-900">{booking.guestInfo.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Services */}
          {booking.services.length > 0 && (
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Dịch vụ thêm
              </h3>
              <div className="space-y-2">
                {booking.services.map((service) => (
                  <div
                    key={service.serviceId}
                    className="flex justify-between items-center py-2"
                  >
                    <div>
                      <p className="font-medium">{service.serviceName}</p>
                      <p className="text-sm text-gray-600">
                        {service.description}
                      </p>
                    </div>
                    <span className="font-medium text-green-600">
                      {service.price.toLocaleString()}đ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Chi tiết thanh toán
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>
                  Tổng tiền sân ({booking.slots.length} slot × 30 phút)
                </span>
                <span>{calculateSubtotal().toLocaleString()}đ</span>
              </div>

              <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                <p className="font-bold">Ghi chú:</p>
                <p>• Chưa tính phí dịch vụ mà khách hàng sử dụng tại sân</p>
                <p>• Khách hàng cọc trước 50% tổng tiền sân</p>
              </div>

              {booking.services.length > 0 && (
                <div className="flex justify-between">
                  <span>Dịch vụ thêm</span>
                  <span>{calculateServicesTotal().toLocaleString()}đ</span>
                </div>
              )}

              <hr className="my-2" />
              <div className="flex justify-between text-lg font-bold text-green-600">
                <span>Tiền cọc</span>
                <span>{depositAmount.toLocaleString()}đ</span>
              </div>

              <div className="text-xs text-gray-500 mt-2">
                * Mỗi slot = 30 phút. Tổng thời gian:{" "}
                {(booking.slots.length * 0.5).toFixed(1)} giờ
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Quay lại
          </button>
          <button
            onClick={handlePayment}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Đang chuyển hướng..." : "Thanh toán"}
          </button>
          {error && (
            <div className="w-full text-center text-red-600 mt-2 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmModal;
