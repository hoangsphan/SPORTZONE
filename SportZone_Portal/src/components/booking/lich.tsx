/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  parse,
  startOfWeek,
} from "date-fns";
import { vi } from "date-fns/locale";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiEdit,
  FiMinus,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import Sidebar from "../../Sidebar";

const API_URL = "https://localhost:7057";

// === CÁC HÀM API VÀ INTERFACE (KHÔNG THAY ĐỔI) ===
const updateBookingSlot = async (data: {
  fieldId: number;
  startDate: string;
  endDate: string;
  dailyStartTime: string;
  dailyEndTime: string;
  notes?: string;
}) => {
  try {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(
      `${API_URL}/api/FieldBookingSchedule/update-generate`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lỗi cập nhật slot: ${response.status} - ${errorText}`);
    }
    const result = await response.json();
    return result;
  } catch (err) {
    console.error("Update slot error:", err);
    throw err;
  }
};

const deleteBookingSlot = async (data: {
  fieldId: number;
  startDate: string;
  endDate: string;
}) => {
  try {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(
      `${API_URL}/api/FieldBookingSchedule/delete-generate`,
      {
        method: "DELETE",
        headers,
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lỗi xóa slot: ${response.status} - ${errorText}`);
    }
    const result = await response.json();
    return result;
  } catch (err) {
    console.error("Delete slot error:", err);
    throw err;
  }
};

interface Booking {
  id: number;
  customerName: string;
  date: Date;
  duration: number;
  field: string;
  status: "confirmed" | "pending" | "cancelled";
  contact: string;
  basePrice: number;
  userId?: number | null;
  bookingId?: number | null;
  guestName?: string | null;
  guestPhone?: string | null;
}

interface Service {
  id: number;
  name: string;
  price: number;
  quantity: number;
  icon: string;
  unit: string;
}

interface BookingService extends Service {
  bookingId: number;
}

interface Schedule {
  scheduleId: number;
  fieldId: number;
  fieldName: string;
  bookingId: number;
  bookingTitle: string;
  startTime: string;
  endTime: string;
  date: string;
  notes: string;
  status: string;
  price: number;
}

interface CreateSlotData {
  fieldId: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  notes: string;
}

interface PricingSlot {
  id?: number;
  startTime: string;
  endTime: string;
  price: number;
}

interface Facility {
  id: number;
  name: string;
  openTime: string;
  closeTime: string;
}

interface UserInfo {
  uId: number;
  uEmail: string;
  admin?: { name: string; phone: string };
  customers?: Array<{ name: string; phone: string; email: string }>;
  fieldOwner?: { name: string; phone: string };
  staff?: { name: string; phone: string };
}

interface BookingDetail {
  bookingId: number;
  fieldId: number;
  fieldName?: string;
  facilityName?: string;
  facilityAddress?: string;
  uId?: number | null;
  guestName?: string | null;
  guestPhone?: string | null;
  title?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  statusPayment?: string;
  createAt?: string;
  notes?: string;
  field?: any;
  order?: {
    orderId?: number;
    guestName?: string;
    guestPhone?: string;
    customerName?: string;
    customerPhone?: string;
    totalAmount?: number;
    [key: string]: any;
  };
  bookedSlots?: any[];
  [key: string]: any;
}

const mapServiceToIconAndUnit = (
  serviceName: string
): { icon: string; unit: string } => {
  const lowerName = serviceName.toLowerCase();
  if (lowerName.includes("áo")) return { icon: "👕", unit: "bộ" };
  if (lowerName.includes("giày")) return { icon: "👟", unit: "đôi" };
  if (
    lowerName.includes("nước") ||
    lowerName.includes("suối") ||
    lowerName.includes("tăng lực")
  )
    return { icon: "🥤", unit: "chai" };
  if (lowerName.includes("bóng")) return { icon: "⚽", unit: "quả" };
  if (lowerName.includes("khăn")) return { icon: "🏃‍♂️", unit: "chiếc" };
  if (lowerName.includes("băng")) return { icon: "🩹", unit: "bộ" };
  if (lowerName.includes("tất")) return { icon: "🧦", unit: "đôi" };
  if (lowerName.includes("găng")) return { icon: "🧤", unit: "đôi" };
  return { icon: "🛠️", unit: "lần" };
};

const BookingCell: React.FC<{
  booking: Booking;
  onClick: (booking: Booking) => void;
}> = ({ booking, onClick }) => {
  const isEmpty =
    booking.customerName === "Không có tên" && booking.contact === "Unknown";

  const statusColors = {
    confirmed:
      "bg-gradient-to-br from-green-100 to-green-200 border-green-400 text-green-800 hover:from-green-200 hover:to-green-300 shadow-green-100",
    pending:
      "bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-400 text-yellow-800 hover:from-yellow-200 hover:to-yellow-300 shadow-yellow-100",
    cancelled:
      "bg-gradient-to-br from-red-100 to-red-200 border-red-400 text-red-800 hover:from-red-200 hover:to-red-300 shadow-red-100",
  };

  const emptySlotColor =
    "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300 text-gray-600 hover:from-gray-150 hover:to-gray-250 shadow-gray-100";

  const statusIcons = {
    confirmed: "✓",
    pending: "⏳",
    cancelled: "✕",
  };

  const statusText = {
    confirmed: "Đã xác nhận",
    pending: "Chờ xác nhận",
    cancelled: "Đã hủy",
  };

  if (!booking) return null;

  return (
    <div
      onClick={() => onClick(booking)}
      className={`relative p-3 rounded-lg border-2 ${
        isEmpty ? emptySlotColor : statusColors[booking.status]
      } ${
        isEmpty ? "cursor-default" : "cursor-pointer"
      } transition-all duration-200 ${
        isEmpty ? "" : "hover:shadow-lg transform hover:-translate-y-1"
      } group`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate group-hover:text-clip">
            {isEmpty ? "Slot trống" : booking.customerName}
          </p>
          <p className="text-xs opacity-75 truncate">
            {format(booking.date, "HH:mm", { locale: vi })}
          </p>
        </div>
        <div className="flex-shrink-0 ml-2">
          <span className="text-sm">
            {isEmpty ? "📅" : statusIcons[booking.status]}
          </span>
        </div>
      </div>
      <div className="space-y-1">
        {isEmpty ? (
          <>
            <p className="text-xs font-medium text-gray-500">🕐 Có thể đặt</p>
            <p className="text-xs opacity-60 font-medium text-gray-500">
              Chưa có người đặt
            </p>
            <div className="text-xs opacity-50 text-gray-500">
              {booking.duration}h - {booking.field}
            </div>
          </>
        ) : (
          <>
            <p className="text-xs font-medium text-gray-700">
              💰 {booking.basePrice.toLocaleString("vi-VN")}đ
            </p>
            <p className="text-xs opacity-60 font-medium">
              {statusText[booking.status]}
            </p>
            <div className="text-xs opacity-50">
              {booking.duration}h - {booking.field}
            </div>
          </>
        )}
      </div>
      {!isEmpty && (
        <div className="absolute inset-0 bg-white bg-opacity-20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
      )}
    </div>
  );
};

const BookingDetailsModal: React.FC<{
  booking: Booking | null;
  onClose: () => void;
  onConfirm: (
    booking: Booking,
    services: BookingService[],
    paymentMethod: string
  ) => void;
  availableServices: Service[];
}> = ({ booking, onClose, onConfirm, availableServices }) => {
  const [selectedServices, setSelectedServices] = useState<BookingService[]>(
    []
  );
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">(
    "cash"
  );
  const [showAddService, setShowAddService] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [bookingDetail, setBookingDetail] = useState<BookingDetail | null>(
    null
  );
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(false);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const token = localStorage.getItem("token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }, []);

  const fetchUserInfo = useCallback(
    async (userId: number) => {
      setIsLoadingUserInfo(true);
      try {
        const endpoint = `${API_URL}/get-all-account`;
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const user = result.data.find(
              (account: UserInfo) => account.uId === userId
            );
            if (user) {
              setUserInfo(user);
              return;
            } else {
              setUserInfo(null);
            }
          } else {
            setUserInfo(null);
          }
        } else if (response.status === 403 || response.status === 401) {
          setUserInfo({
            uId: userId,
            uEmail: "",
            error:
              "Bạn không có quyền xem thông tin khách hàng. Vui lòng đăng nhập bằng tài khoản admin!",
          } as any);
        } else {
          setUserInfo(null);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        setUserInfo(null);
      } finally {
        setIsLoadingUserInfo(false);
      }
    },
    [getAuthHeaders]
  );

  const fetchBookingDetail = useCallback(
    async (scheduleId: number) => {
      try {
        const response = await fetch(
          `${API_URL}/api/Order/schedule/${scheduleId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
          }
        );
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setBookingDetail(result.data);
            if (typeof result.data.uId === "number" && result.data.uId > 0) {
              await fetchUserInfo(result.data.uId);
            } else {
              setUserInfo(null);
            }
          } else {
            setBookingDetail(null);
          }
        } else {
          setBookingDetail(null);
        }
      } catch (error) {
        console.error("Error fetching order detail:", error);
        setBookingDetail(null);
      }
    },
    [fetchUserInfo, getAuthHeaders]
  );

  useEffect(() => {
    if (booking && booking.id) {
      setUserInfo(null);
      setBookingDetail(null);
      setIsLoadingUserInfo(false);
      if (booking.id > 0) {
        fetchBookingDetail(booking.id);
      } else {
        setBookingDetail(null);
      }
    } else {
      setUserInfo(null);
      setBookingDetail(null);
      setIsLoadingUserInfo(false);
    }
  }, [booking, fetchBookingDetail]);

  const getDisplayName = (): string => {
    if ((userInfo as any)?.error) return (userInfo as any).error;
    if (userInfo) {
      const name =
        userInfo.admin?.name ||
        userInfo.customers?.[0]?.name ||
        userInfo.fieldOwner?.name ||
        userInfo.staff?.name;
      if (name) return name;
    }
    if (bookingDetail?.order) {
      const order = bookingDetail.order as any;
      if (order.guestName) return order.guestName;
      if (order.customerName && order.customerName !== "Không có tên")
        return order.customerName;
    }
    if (bookingDetail?.guestName) return bookingDetail.guestName;
    let fallbackName = booking?.customerName || "Khách hàng";
    if (fallbackName.startsWith("Đặt sân "))
      fallbackName = fallbackName.replace("Đặt sân ", "").trim();
    if (fallbackName === booking?.field || fallbackName.includes("Sân "))
      fallbackName = "Khách hàng";
    return fallbackName;
  };

  const getDisplayPhone = (): string => {
    if ((userInfo as any)?.error) return "Không có quyền xem";
    if (userInfo) {
      const phone =
        userInfo.admin?.phone ||
        userInfo.customers?.[0]?.phone ||
        userInfo.fieldOwner?.phone ||
        userInfo.staff?.phone;
      if (phone) return phone;
    }
    if (bookingDetail?.order) {
      const order = bookingDetail.order as any;
      if (order.guestPhone) return order.guestPhone;
      if (order.customerPhone) return order.customerPhone;
    }
    if (bookingDetail?.guestPhone) {
      return bookingDetail.guestPhone;
    }
    let fallbackPhone = booking?.contact;
    if (!fallbackPhone || fallbackPhone === "Unknown") {
      fallbackPhone = "Chưa có thông tin";
    }
    return fallbackPhone;
  };

  const getDisplayEmail = (): string => {
    if ((userInfo as any)?.error) return "Không có quyền xem";
    if (userInfo) {
      const email = userInfo.uEmail || userInfo.customers?.[0]?.email || "";
      if (email) return email;
    }
    if (bookingDetail?.uId && (bookingDetail as any).customerInfo) {
      const email = (bookingDetail as any).customerInfo.email;
      if (email) {
        return email;
      }
    }
    return "Khách vãng lai";
  };

  const totalServicePrice = selectedServices.reduce(
    (sum, service) => sum + service.price * service.quantity,
    0
  );
  const totalPrice = (booking?.basePrice || 0) + totalServicePrice;

  const addService = (service: Service) => {
    const existingService = selectedServices.find((s) => s.id === service.id);
    if (existingService) {
      setSelectedServices(
        selectedServices.map((s) =>
          s.id === service.id ? { ...s, quantity: s.quantity + 1 } : s
        )
      );
    } else {
      setSelectedServices([
        ...selectedServices,
        { ...service, bookingId: booking?.id || 0 },
      ]);
    }
    setShowAddService(false);
  };

  const updateServiceQuantity = (serviceId: number, change: number) => {
    setSelectedServices(
      selectedServices.map((service) => {
        if (service.id === serviceId) {
          const newQuantity = Math.max(1, service.quantity + change);
          return { ...service, quantity: newQuantity };
        }
        return service;
      })
    );
  };

  const removeService = (serviceId: number) => {
    setSelectedServices(
      selectedServices.filter((service) => service.id !== serviceId)
    );
  };

  const handleConfirm = () => {
    if (booking) {
      onConfirm(booking, selectedServices, paymentMethod);
      onClose();
    }
  };

  if (!booking) return null;

  return (
    <div
      style={{ marginTop: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Chi tiết hóa đơn
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Đóng modal"
            >
              <FiX className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>
        <div className="p-6 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                Thông tin khách hàng
                {isLoadingUserInfo && (
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                )}
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Tên khách hàng:</span>
                  <span className={isLoadingUserInfo ? "text-gray-400" : ""}>
                    {getDisplayName()}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Số điện thoại:</span>
                  <span className={isLoadingUserInfo ? "text-gray-400" : ""}>
                    {getDisplayPhone()}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Email:</span>
                  <span className={isLoadingUserInfo ? "text-gray-400" : ""}>
                    {getDisplayEmail()}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Loại khách hàng:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      userInfo &&
                      typeof userInfo.uId === "number" &&
                      userInfo.uId > 0
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {userInfo &&
                    typeof userInfo.uId === "number" &&
                    userInfo.uId > 0
                      ? userInfo.admin
                        ? "Quản trị viên"
                        : userInfo.fieldOwner
                        ? "Chủ sân"
                        : userInfo.staff
                        ? "Nhân viên"
                        : userInfo.customers?.[0]
                        ? "Khách hàng thành viên"
                        : "Thành viên"
                      : "Khách vãng lai"}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Ngày đặt:</span>
                  {format(booking.date, "dd/MM/yyyy", { locale: vi })}
                </p>
                <p>
                  <span className="font-medium">Giờ đặt:</span>{" "}
                  {format(booking.date, "HH:mm", { locale: vi })}
                </p>
                <p>
                  <span className="font-medium">Sân:</span>
                  {booking.field}
                </p>
                <p>
                  <span className="font-medium">Thời gian:</span>
                  {booking.duration} giờ
                </p>
                <p>
                  <span className="font-medium">Trạng thái:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : booking.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {booking.status === "confirmed"
                      ? "Đã xác nhận"
                      : booking.status === "pending"
                      ? "Chờ xác nhận"
                      : "Đã hủy"}
                  </span>
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Tổng kết thanh toán
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tiền thuê sân:</span>
                    <span>{booking.basePrice.toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dịch vụ & cho thuê:</span>
                    <span>{totalServicePrice.toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                    <span>Tổng cộng:</span>
                    <span className="text-green-600">
                      {totalPrice.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Phương thức thanh toán
                </h3>
                <div className="flex space-x-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as "cash")
                      }
                      className="mr-2"
                    />
                    <span>Tiền mặt</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="transfer"
                      checked={paymentMethod === "transfer"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as "transfer")
                      }
                      className="mr-2"
                    />
                    <span>Chuyển khoản</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700">
                Dịch vụ & đồ cho thuê đã chọn
              </h3>
              <button
                onClick={() => setShowAddService(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                <span>Thêm dịch vụ</span>
              </button>
            </div>
            {selectedServices.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Chưa chọn dịch vụ nào
              </p>
            ) : (
              <div className="space-y-3">
                {selectedServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between bg-white rounded-lg p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{service.icon}</span>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-gray-500">
                          {service.price.toLocaleString("vi-VN")}đ/
                          {service.unit}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateServiceQuantity(service.id, -1)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Giảm số lượng"
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center">
                          {service.quantity}
                        </span>
                        <button
                          onClick={() => updateServiceQuantity(service.id, 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Tăng số lượng"
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="font-medium w-20 text-right">
                        {(service.price * service.quantity).toLocaleString(
                          "vi-VN"
                        )}
                        đ
                      </span>
                      <button
                        onClick={() => removeService(service.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        title="Xóa dịch vụ"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Xác nhận đặt sân
            </button>
          </div>
        </div>
      </div>
      {showAddService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Thêm dịch vụ vào đơn đặt sân
              </h3>
              <button
                onClick={() => setShowAddService(false)}
                className="p-1 hover:bg-gray-100 rounded"
                title="Đóng modal chọn dịch vụ"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {availableServices
                .filter(
                  (service) =>
                    !selectedServices.find((s) => s.id === service.id)
                )
                .map((service) => (
                  <div
                    key={service.id}
                    onClick={() => addService(service)}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{service.icon}</span>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-gray-500">
                          {service.price.toLocaleString("vi-VN")}đ/
                          {service.unit}
                        </p>
                      </div>
                    </div>
                    <FiPlus className="w-5 h-5 text-blue-500" />
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CreateSlotModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (slotData: CreateSlotData) => Promise<void>;
  onUpdate: (slotData: CreateSlotData) => Promise<void>;
  onDelete: (slotData: CreateSlotData) => Promise<void>;
  fieldId: number;
  fieldName: string;
  facility: Facility | null;
}> = ({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  onDelete,
  fieldId,
  fieldName,
  facility,
}) => {
  const [formData, setFormData] = useState<CreateSlotData>({
    fieldId: fieldId,
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    startTime: facility ? facility.openTime.substring(0, 5) : "06:00",
    endTime: facility
      ? `${(parseInt(facility.openTime.split(":")[0], 10) + 1)
          .toString()
          .padStart(2, "0")}:00`
      : "07:00",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (action: "create" | "update" | "delete") => {
    if (isSubmitting) return;

    if (action === "create" || action === "update") {
      if (
        !formData.startDate ||
        !formData.endDate ||
        !formData.startTime ||
        !formData.endTime
      ) {
        Swal.fire("Lỗi", "Vui lòng điền đầy đủ thông tin!", "error");
        return;
      }
      if (formData.startTime >= formData.endTime) {
        Swal.fire(
          "Lỗi",
          "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc!",
          "error"
        );
        return;
      }
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      Swal.fire(
        "Lỗi",
        "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc!",
        "error"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (action === "create") {
        await onSubmit(formData);
      } else if (action === "update") {
        await onUpdate(formData);
      } else if (action === "delete") {
        await onDelete(formData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateSlotData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateTimeOptions = () => {
    const times = [];
    const startHour = facility
      ? parseInt(facility.openTime.split(":")[0], 10)
      : 6;
    const endHour = facility
      ? parseInt(facility.closeTime.split(":")[0], 10)
      : 23;

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        times.push(timeString);
      }
    }
    return times;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Quản lý slot đặt sân
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Đóng modal"
            >
              <FiX className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Thông tin sân</h3>
            <p className="text-blue-800">
              <span className="font-medium">Sân:</span>
              {fieldName}
            </p>
            {facility && (
              <p className="text-blue-800 mt-1">
                <span className="font-medium">Giờ hoạt động:</span>
                {facility.openTime.substring(0, 5)} -
                {facility.closeTime.substring(0, 5)}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Ngày bắt đầu
                <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Chọn ngày bắt đầu"
                aria-label="Ngày bắt đầu"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Ngày kết thúc
                <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                min={formData.startDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Chọn ngày kết thúc"
                aria-label="Ngày kết thúc"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Thời gian bắt đầu
                <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Chọn thời gian bắt đầu"
                aria-label="Thời gian bắt đầu"
                required
              >
                {generateTimeOptions().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Thời gian kết thúc
                <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Chọn thời gian kết thúc"
                aria-label="Thời gian kết thúc"
                required
              >
                {generateTimeOptions().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Ghi chú
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Nhập ghi chú cho slot này..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
          <div className="bg-yellow-50 rounded-xl p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">📋 Hướng dẫn</h3>
            <div className="text-yellow-800 text-sm space-y-1">
              <p>
                • <strong>Tạo slot</strong>: Thêm các khung giờ trống mới vào
                lịch.
              </p>
              <p>
                • <strong>Cập nhật slot</strong>: Ghi đè thông tin (giờ, ghi
                chú) cho các slot hiện có.
              </p>
              <p>
                • <strong>Xóa slot</strong>: Loại bỏ các slot trống (chưa được
                đặt) khỏi lịch trong khoảng ngày đã chọn.
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("delete")}
              disabled={isSubmitting}
              className={`px-6 py-3 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600 hover:shadow-lg"
              }`}
            >
              Xóa slot
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("update")}
              disabled={isSubmitting}
              className={`px-6 py-3 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-600 hover:shadow-lg"
              }`}
            >
              Cập nhật slot
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("create")}
              disabled={isSubmitting}
              className={`px-6 py-3 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 hover:shadow-lg"
              }`}
            >
              {isSubmitting ? "Đang xử lý..." : "Tạo slot"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* eslint-disable @typescript-eslint/no-explicit-any */
// =================================================================
// === PHẦN CODE ĐÃ ĐƯỢC SỬA LỖI VÀ HOÀN THIỆN: PricingManagementModal
// =================================================================
const PricingManagementModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  fieldId: number;
  fieldName: string;
  showToast: (message: string, type: "success" | "error") => void;
  fetchSchedule: () => Promise<void>;
  onPricingUpdate?: () => Promise<void>;
}> = ({
  isOpen,
  onClose,
  fieldId,
  fieldName,
  showToast,
  fetchSchedule,
  onPricingUpdate,
}) => {
  const [pricingSlots, setPricingSlots] = useState<PricingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchPricingData = useCallback(async () => {
    if (!fieldId) return;
    setIsLoading(true);
    try {
      const headers = {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      };
      const response = await fetch(
        `${API_URL}/api/FieldPricing/byField/${fieldId}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        // Nếu API trả về 404 hoặc lỗi khác mà không phải lỗi server nghiêm trọng,
        // có thể sân này chưa có bảng giá. Coi đây là một mảng rỗng.
        setPricingSlots([]);
        return;
      }

      const result = await response.json();
      const dataArray =
        result.data && Array.isArray(result.data)
          ? result.data
          : Array.isArray(result)
          ? result
          : [];

      if (dataArray.length > 0) {
        const mappedPricing: PricingSlot[] = dataArray.map((p: any) => ({
          id: p.fieldPricingId || p.pricingId || p.id,
          startTime: p.startTime ? p.startTime.substring(0, 5) : "00:00",
          endTime: p.endTime ? p.endTime.substring(0, 5) : "00:00",
          price: p.price || 0,
        }));
        setPricingSlots(mappedPricing);
      } else {
        setPricingSlots([]);
      }
    } catch (err) {
      console.error("Fetch pricing error:", err);
      showToast("Không thể tải dữ liệu giá từ server.", "error");
      setPricingSlots([]);
    } finally {
      setIsLoading(false);
    }
  }, [fieldId, getAuthHeaders, showToast]);

  useEffect(() => {
    if (isOpen && fieldId) {
      fetchPricingData();
    }
  }, [isOpen, fieldId, fetchPricingData]);

  const handleSlotChange = (
    index: number,
    field: keyof PricingSlot,
    value: string | number
  ) => {
    const newSlots = [...pricingSlots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setPricingSlots(newSlots);
  };

  const validateSlot = (slot: PricingSlot): boolean => {
    if (!slot.startTime || !slot.endTime || !slot.price || slot.price <= 0) {
      showToast(
        "Vui lòng điền đầy đủ thông tin và giá phải lớn hơn 0.",
        "error"
      );
      return false;
    }
    if (slot.startTime >= slot.endTime) {
      showToast("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.", "error");
      return false;
    }
    return true;
  };

  const handleCreatePricing = async (index: number) => {
    const slotToCreate = pricingSlots[index];
    if (!validateSlot(slotToCreate)) return;

    setIsProcessing(true);
    try {
      const body = {
        fieldId: fieldId,
        startTime: `${slotToCreate.startTime}:00`,
        endTime: `${slotToCreate.endTime}:00`,
        price: slotToCreate.price,
      };
      const response = await fetch(`${API_URL}/api/FieldPricing`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Tạo khung giá thất bại: ${errorText || response.statusText}`
        );
      }

      showToast("Tạo khung giá thành công!", "success");
      await fetchPricingData();
      if (onPricingUpdate) await onPricingUpdate();
      await fetchSchedule();
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdatePricing = async (index: number) => {
    const slotToUpdate = pricingSlots[index];
    if (!slotToUpdate.id) {
      showToast(
        "Lỗi: Không tìm thấy ID của khung giá này để cập nhật.",
        "error"
      );
      return;
    }
    if (!validateSlot(slotToUpdate)) return;

    setIsProcessing(true);
    try {
      const body = {
        startTime: `${slotToUpdate.startTime}:00`,
        endTime: `${slotToUpdate.endTime}:00`,
        price: slotToUpdate.price,
      };
      const response = await fetch(
        `${API_URL}/api/FieldPricing/${slotToUpdate.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Cập nhật khung giá thất bại: ${errorText || response.statusText}`
        );
      }

      showToast("Cập nhật thành công!", "success");
      await fetchPricingData();
      if (onPricingUpdate) await onPricingUpdate();
      await fetchSchedule();
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePricing = async (index: number) => {
    const slotToDelete = pricingSlots[index];
    if (!slotToDelete.id) {
      removeNewPricingSlot(index);
      return;
    }

    const confirmation = await Swal.fire({
      title: "Bạn chắc chắn chứ?",
      text: `Bạn sắp xóa khung giờ ${slotToDelete.startTime} - ${slotToDelete.endTime}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Vâng, xóa nó!",
      cancelButtonText: "Hủy",
    });

    if (!confirmation.isConfirmed) return;

    setIsProcessing(true);
    try {
      const response = await fetch(
        `${API_URL}/api/FieldPricing/${slotToDelete.id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Xóa khung giá thất bại: ${errorText || response.statusText}`
        );
      }

      showToast("Đã xóa khung giá!", "success");
      setPricingSlots((prev) => prev.filter((p) => p.id !== slotToDelete.id));
      if (onPricingUpdate) await onPricingUpdate();
      await fetchSchedule(); // Cập nhật lại lịch
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const addPricingSlot = () => {
    setPricingSlots((prev) => [
      ...prev,
      { startTime: "06:00", endTime: "12:00", price: 100000 },
    ]);
  };

  const removeNewPricingSlot = (index: number) => {
    setPricingSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let h = 0; h <= 23; h++) {
      for (let m = 0; m < 60; m += 30) {
        times.push(
          `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
        );
      }
    }
    times.push("24:00");
    return times;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Quản lý giá đặt theo giờ
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
              title="Đóng modal"
            >
              <FiX className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Thông tin sân</h3>
            <p className="text-blue-800">
              <span className="font-medium">Sân:</span> {fieldName}
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Các khung giờ và giá
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={fetchPricingData}
                  disabled={isLoading || isProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300"
                >
                  <FiRefreshCw className="w-4 h-4" /> Làm mới
                </button>
                <button
                  type="button"
                  onClick={addPricingSlot}
                  disabled={isLoading || isProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300"
                >
                  <FiPlus className="w-4 h-4" /> Thêm khung giờ
                </button>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-10 gap-4 mb-4 text-sm font-medium text-gray-700 px-2">
                <div className="col-span-2">Giờ bắt đầu</div>
                <div className="col-span-2">Giờ kết thúc</div>
                <div className="col-span-3">Giá sân (VNĐ)/giờ</div>
                <div className="col-span-3 text-center">Thao tác</div>
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <FiRefreshCw className="animate-spin h-6 w-6 text-blue-500" />
                  <span className="ml-3 text-gray-600">
                    Đang tải dữ liệu...
                  </span>
                </div>
              ) : pricingSlots.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Chưa có cấu hình giá
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Vui lòng thêm ít nhất một khung giá cho sân này.
                  </p>
                  <button
                    type="button"
                    onClick={addPricingSlot}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
                  >
                    <FiPlus /> Thêm khung giá đầu tiên
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {pricingSlots.map((slot, index) => (
                    <div
                      key={slot.id || `new-${index}`}
                      className="grid grid-cols-10 gap-4 items-center bg-white p-2 rounded-lg shadow-sm"
                    >
                      <div className="col-span-2">
                        <select
                          value={slot.startTime}
                          onChange={(e) =>
                            handleSlotChange(index, "startTime", e.target.value)
                          }
                          disabled={isProcessing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                          {generateTimeOptions().map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <select
                          value={slot.endTime}
                          onChange={(e) =>
                            handleSlotChange(index, "endTime", e.target.value)
                          }
                          disabled={isProcessing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                          {generateTimeOptions().map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          value={slot.price}
                          onChange={(e) =>
                            handleSlotChange(
                              index,
                              "price",
                              parseInt(e.target.value) || 0
                            )
                          }
                          disabled={isProcessing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          min="0"
                          step="1000"
                        />
                      </div>
                      <div className="col-span-3 flex justify-center items-center gap-2">
                        {slot.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleUpdatePricing(index)}
                              disabled={isProcessing}
                              className="p-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                              title="Cập nhật"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePricing(index)}
                              disabled={isProcessing}
                              className="p-2 text-white bg-red-500 rounded-md hover:bg-red-600 disabled:bg-red-300"
                              title="Xóa"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleCreatePricing(index)}
                              disabled={isProcessing}
                              className="p-2 text-white bg-green-500 rounded-md hover:bg-green-600 disabled:bg-green-300"
                              title="Lưu khung giờ mới"
                            >
                              <FiSave className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePricing(index)}
                              disabled={isProcessing}
                              className="p-2 text-white bg-red-500 rounded-md hover:bg-red-600 disabled:bg-red-300"
                              title="Xóa"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const WeeklySchedule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateSlotModal, setShowCreateSlotModal] =
    useState<boolean>(false);
  const [showPricingModal, setShowPricingModal] = useState<boolean>(false);
  const [hasPricingConfiguration, setHasPricingConfiguration] =
    useState<boolean>(false);
  const [facility, setFacility] = useState<Facility | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const fieldId = Number(searchParams.get("fieldId")) || 1;
  const fieldName = searchParams.get("fieldName") || "Sân không xác định";
  const facId = Number(searchParams.get("facId")) || 0;

  const handleOpenDetailModal = () => {
    if (selectedBooking) {
      setShowQuickModal(false);
      setShowDetailModal(true);
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedBooking(null);
  };

  const [quickCustomerName, setQuickCustomerName] = useState<string>("");
  const [quickCustomerPhone, setQuickCustomerPhone] = useState<string>("");
  const [quickLoading, setQuickLoading] = useState<boolean>(false);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const token = localStorage.getItem("token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }, []);

  const handleSlotClick = async (booking: Booking) => {
    setSelectedBooking(booking);
    setShowQuickModal(true);
    setQuickLoading(true);
    setQuickCustomerName(booking.customerName);
    setQuickCustomerPhone(booking.contact);

    if (!booking || !booking.id) {
      setQuickCustomerName(booking.customerName || "Slot trống");
      setQuickCustomerPhone("Không có thông tin");
      setQuickLoading(false);
      return;
    }

    const scheduleId = booking.id;

    try {
      const detailResponse = await fetch(
        `${API_URL}/api/Order/schedule/${scheduleId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        }
      );

      let bookingDetail: BookingDetail | null = null;
      if (detailResponse.ok) {
        const detailResult = await detailResponse.json();
        if (detailResult.success && detailResult.data) {
          bookingDetail = detailResult.data;
        }
      } else {
        console.warn(
          `Quick details fetch failed for scheduleId: ${scheduleId}`
        );
      }

      let userInfo: UserInfo | null = null;
      if (
        bookingDetail &&
        typeof bookingDetail.uId === "number" &&
        bookingDetail.uId > 0
      ) {
        const userResponse = await fetch(`${API_URL}/get-all-account`, {
          method: "GET",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        });
        if (userResponse.ok) {
          const userResult = await userResponse.json();
          if (userResult.success && userResult.data) {
            userInfo =
              userResult.data.find(
                (account: UserInfo) => account.uId === bookingDetail?.uId
              ) || null;
          }
        }
      }

      let finalName = booking.customerName || "Khách hàng";
      if (userInfo) {
        const name =
          userInfo.admin?.name ||
          userInfo.customers?.[0]?.name ||
          userInfo.fieldOwner?.name ||
          userInfo.staff?.name;
        if (name) finalName = name;
      } else if (bookingDetail?.order) {
        const order = bookingDetail.order as any;
        if (order.guestName) {
          finalName = order.guestName;
        } else if (
          order.customerName &&
          order.customerName !== "Không có tên"
        ) {
          finalName = order.customerName;
        }
      } else if (bookingDetail?.guestName) {
        finalName = bookingDetail.guestName;
      }

      if (finalName.startsWith("Đặt sân "))
        finalName = finalName.replace("Đặt sân ", "").trim();
      if (finalName === booking.field || finalName.includes("Sân "))
        finalName = "Khách hàng";

      let finalPhone = booking.contact || "Chưa có thông tin";
      if (userInfo) {
        const phone =
          userInfo.admin?.phone ||
          userInfo.customers?.[0]?.phone ||
          userInfo.fieldOwner?.phone ||
          userInfo.staff?.phone;
        if (phone) finalPhone = phone;
      } else if (bookingDetail?.order) {
        const order = bookingDetail.order as any;
        if (order.guestPhone) {
          finalPhone = order.guestPhone;
        } else if (order.customerPhone) {
          finalPhone = order.customerPhone;
        }
      } else if (bookingDetail?.guestPhone) {
        finalPhone = bookingDetail.guestPhone;
      }

      if (!finalPhone || finalPhone === "Unknown") {
        finalPhone = "Chưa có thông tin";
      }

      setQuickCustomerName(finalName);
      setQuickCustomerPhone(finalPhone);
    } catch (error) {
      console.error("Error fetching full booking info for quick modal:", error);
    } finally {
      setQuickLoading(false);
    }
  };

  const handleCloseQuickModal = () => {
    setShowQuickModal(false);
    setSelectedBooking(null);
    setQuickCustomerName("");
    setQuickCustomerPhone("");
  };

  const showToast = (message: string, type: "success" | "error") => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: type,
      title: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });
  };

  const checkPricingConfiguration = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/FieldPricing/byField/${fieldId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        console.log("Pricing configuration data:", data);
        const hasConfig = data && Array.isArray(data) && data.length > 0;
        setHasPricingConfiguration(hasConfig);
      } else {
        setHasPricingConfiguration(false);
      }
    } catch (err) {
      console.error("Error checking pricing configuration:", err);
      setHasPricingConfiguration(false);
    }
  }, [fieldId, getAuthHeaders]);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/Field/${fieldId}/schedule`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Lỗi HTTP: ${response.status} - ${errorText || response.statusText}`
        );
      }

      const result = await response.json();

      if (result.success) {
        const mappedBookings: Booking[] = result.data.map(
          (schedule: Schedule) => {
            const startDateTime = parse(
              `${schedule.date} ${schedule.startTime}`,
              "yyyy-MM-dd HH:mm:ss",
              new Date()
            );
            const endDateTime = parse(
              `${schedule.date} ${schedule.endTime}`,
              "yyyy-MM-dd HH:mm:ss",
              new Date()
            );
            const duration =
              (endDateTime.getTime() - startDateTime.getTime()) /
              (1000 * 60 * 60);

            return {
              id: schedule.scheduleId || 0,
              customerName: schedule.bookingTitle || "Không có tên",
              date: startDateTime,
              duration: Math.max(0, duration),
              field: schedule.fieldName || fieldName || "Không xác định",
              status:
                schedule.status === "Booked"
                  ? "confirmed"
                  : schedule.status === "Scheduled"
                  ? "pending"
                  : "cancelled",
              contact: "Unknown",
              basePrice: schedule.price || 0,
              bookingId:
                schedule.bookingId && schedule.bookingId > 0
                  ? schedule.bookingId
                  : null,
              userId: null,
              guestName: null,
              guestPhone: null,
            };
          }
        );

        setBookings(mappedBookings);
      } else {
        showToast(result.message || "Không thể lấy lịch sân.", "error");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Lỗi không xác định khi lấy lịch sân";
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [fieldId, fieldName, getAuthHeaders]);

  const fetchServices = useCallback(async () => {
    if (!facId) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/Service/facility/${facId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Lỗi khi lấy danh sách dịch vụ: ${response.status} - ${
            errorText || response.statusText
          }`
        );
      }

      const result = await response.json();
      if (result.success) {
        const mappedServices: Service[] = result.data.map((service: any) => {
          const { icon, unit } = mapServiceToIconAndUnit(service.serviceName);
          return {
            id: service.serviceId,
            name: service.serviceName,
            price: service.price,
            quantity: 1,
            icon,
            unit,
          };
        });
        setServices(mappedServices);
      } else {
        showToast(
          result.message || "Không thể lấy danh sách dịch vụ.",
          "error"
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Lỗi không xác định khi lấy danh sách dịch vụ";
      showToast(errorMessage, "error");
    }
  }, [facId, getAuthHeaders]);

  const fetchFacility = useCallback(async () => {
    if (!facId) {
      setFacility({
        id: 0,
        name: "Cơ sở mặc định",
        openTime: "06:00:00",
        closeTime: "23:00:00",
      });
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/Facility/${facId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      if (!response.ok) throw new Error("Failed to fetch facility");
      const result = await response.json();
      const data = result.data || result;
      setFacility({
        id: data.facilityId || data.id || facId,
        name: data.facilityName || data.name || "Cơ sở không xác định",
        openTime: data.openTime || data.openingTime || "06:00:00",
        closeTime: data.closeTime || data.closingTime || "23:00:00",
      });
    } catch (err) {
      console.error("Fetch facility error, using defaults:", err);
      setFacility({
        id: facId,
        name: "Cơ sở thể thao",
        openTime: "06:00:00",
        closeTime: "23:00:00",
      });
    }
  }, [facId, getAuthHeaders]);

  useEffect(() => {
    if (fieldId) {
      setLoading(true);
      Promise.allSettled([
        fetchSchedule(),
        fetchServices(),
        fetchFacility(),
        checkPricingConfiguration(),
      ])
        .catch((err) => {
          console.error("Error during initial data fetch:", err);
          showToast("Lỗi khi tải dữ liệu ban đầu. Vui lòng thử lại.", "error");
        })
        .finally(() => setLoading(false));
    } else {
      showToast("Không tìm thấy ID sân. Đang điều hướng lại...", "error");
      navigate(-1);
    }
  }, [
    fieldId,
    navigate,
    fetchSchedule,
    fetchServices,
    fetchFacility,
    checkPricingConfiguration,
  ]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const timeSlots = useMemo(() => {
    if (!facility) {
      return Array.from({ length: 18 }, (_, i) => i + 6);
    }
    const openHour = parseInt(facility.openTime.split(":")[0], 10);
    const closeHour = parseInt(facility.closeTime.split(":")[0], 10);
    const slots = [];
    for (let hour = openHour; hour < closeHour; hour++) {
      slots.push(hour);
    }
    return slots;
  }, [facility]);

  const filteredBookings = useMemo(() => {
    if (!searchTerm) {
      return bookings;
    }
    return bookings.filter(
      (booking) =>
        booking.customerName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking.field?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [bookings, searchTerm]);

  const navigateWeek = (direction: number) => {
    setCurrentDate((prev) => addWeeks(prev, direction));
  };

  const handleBookingConfirm = (
    booking: Booking,
    services: BookingService[],
    paymentMethod: string
  ) => {
    const totalPrice =
      booking.basePrice +
      services.reduce((sum, s) => sum + s.price * s.quantity, 0);
    console.log("Đặt sân đã được xác nhận:", {
      booking,
      services,
      paymentMethod,
    });
    showToast(
      `Đặt sân thành công! Tổng tiền: ${totalPrice.toLocaleString("vi-VN")}đ`,
      "success"
    );
  };

  const handleCreateSlot = async (slotData: CreateSlotData) => {
    try {
      if (!hasPricingConfiguration) {
        Swal.fire({
          icon: "warning",
          title: "Chưa cấu hình giá",
          text: "Sân này chưa có cấu hình giá theo khung giờ. Vui lòng cấu hình giá trước khi tạo slot.",
          confirmButtonText: "Cấu hình giá ngay",
          showCancelButton: true,
          cancelButtonText: "Hủy bỏ",
        }).then((result) => {
          if (result.isConfirmed) {
            setShowCreateSlotModal(false);
            setShowPricingModal(true);
          }
        });
        return;
      }

      const requestBody = {
        fieldId: Number(slotData.fieldId),
        startDate: format(new Date(slotData.startDate), "yyyy-MM-dd"),
        endDate: format(new Date(slotData.endDate), "yyyy-MM-dd"),
        dailyStartTime: `${slotData.startTime}:00`,
        dailyEndTime: `${slotData.endTime}:00`,
        notes: slotData.notes || "",
      };

      const response = await fetch(
        `${API_URL}/api/FieldBookingSchedule/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Lỗi khi tạo slot: ${response.status} - ${
            errorText || response.statusText
          }`
        );
      }

      showToast("Tạo slot đặt sân thành công!", "success");
      setShowCreateSlotModal(false);
      await fetchSchedule();
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  };

  const handleUpdateSlot = async (slotData: CreateSlotData) => {
    try {
      const requestBody = {
        fieldId: Number(slotData.fieldId),
        startDate: format(new Date(slotData.startDate), "yyyy-MM-dd"),
        endDate: format(new Date(slotData.endDate), "yyyy-MM-dd"),
        dailyStartTime: `${slotData.startTime}:00`,
        dailyEndTime: `${slotData.endTime}:00`,
        notes: slotData.notes || "",
      };

      await updateBookingSlot(requestBody);
      showToast("Cập nhật slot thành công!", "success");
      setShowCreateSlotModal(false);
      await fetchSchedule();
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  };

  const handleDeleteSlot = async (slotData: CreateSlotData) => {
    try {
      const confirmation = await Swal.fire({
        title: "Bạn chắc chắn chứ?",
        html: `Bạn sắp xóa tất cả các slot <strong>trống</strong> từ ngày <strong>${format(
          new Date(slotData.startDate),
          "dd/MM/yyyy"
        )}</strong> đến <strong>${format(
          new Date(slotData.endDate),
          "dd/MM/yyyy"
        )}</strong>.<br/>Các slot đã được đặt sẽ không bị ảnh hưởng. Hành động này không thể hoàn tác!`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Vâng, xóa!",
        cancelButtonText: "Hủy",
      });

      if (!confirmation.isConfirmed) return;

      const requestBody = {
        fieldId: Number(slotData.fieldId),
        startDate: format(new Date(slotData.startDate), "yyyy-MM-dd"),
        endDate: format(new Date(slotData.endDate), "yyyy-MM-dd"),
      };

      await deleteBookingSlot(requestBody);
      showToast("Xóa các slot trống thành công!", "success");
      setShowCreateSlotModal(false);
      await fetchSchedule();
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  };

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="min-h-screen flex flex-col bg-gray-50 pl-4 pt-4 ml-[256px]">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FiRefreshCw className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">
                Đang tải lịch sân...
              </h2>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="min-h-screen flex flex-col bg-gray-50 pl-4 pt-4">
        <div className="flex-1 ml-[256px] p-4">
          <div className="max-w-7xl w-full mx-auto space-y-6">
            {!hasPricingConfiguration && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-yellow-700">
                      <strong>Cảnh báo:</strong> Sân này chưa có cấu hình giá.
                      Vui lòng cấu hình giá trước khi tạo slot.
                    </p>
                  </div>
                  <div className="ml-3">
                    <button
                      onClick={() => setShowPricingModal(true)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-600"
                    >
                      Cấu hình ngay
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  title="Quay lại trang trước"
                >
                  <FiChevronLeft className="h-4 w-4" />
                  Quay lại
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Lịch sân: {fieldName}
                  </h1>
                  {facility && (
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        🏢 {facility.name}
                      </span>
                      <span className="flex items-center gap-1">
                        🕐
                        {facility.openTime.substring(0, 5)} -
                        {facility.closeTime.substring(0, 5)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCreateSlotModal(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-500 text-white"
                  title="Tạo, cập nhật, hoặc xóa slot trống hàng loạt"
                >
                  <FiCalendar className="w-5 h-5" />
                  Quản lý slot
                </button>
                <button
                  onClick={() => setShowPricingModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg"
                  title="Quản lý giá đặt theo giờ"
                >
                  <FiDollarSign className="w-5 h-5" />
                  Quản lý giá
                </button>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateWeek(-1)}
                  className="p-3 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  title="Tuần trước"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-800">
                    {format(weekStart, "dd/MM", { locale: vi })} -
                    {format(weekEnd, "dd/MM/yyyy", { locale: vi })}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Tuần
                    {format(weekStart, "w", { locale: vi })} năm
                    {format(weekStart, "yyyy")}
                  </p>
                </div>
                <button
                  onClick={() => navigateWeek(1)}
                  className="p-3 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  title="Tuần sau"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md"
                  title="Về tuần hiện tại"
                >
                  <FiCalendar className="w-4 h-4" />
                  <span>Hôm nay</span>
                </button>
              </div>
              <div className="flex items-center space-x-4 w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-none">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên khách hàng hoặc sân..."
                    className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg w-full lg:w-80 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Lịch đặt sân theo tuần
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Click vào slot để xem chi tiết và quản lý đặt sân
                    </p>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-200 border border-green-400 rounded"></div>
                      <span className="text-gray-600">Đã xác nhận</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-200 border border-yellow-400 rounded"></div>
                      <span className="text-gray-600">Chờ xác nhận</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-200 border border-red-400 rounded"></div>
                      <span className="text-gray-600">Đã hủy</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded"></div>
                      <span className="text-gray-600">Chưa đặt</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[1200px] schedule-grid">
                  <div className="grid grid-cols-8 gap-1 bg-gray-100 p-2">
                    <div className="bg-white rounded-lg p-3 flex items-center justify-center sticky left-0 z-10">
                      <span className="text-sm font-medium text-gray-500">
                        Giờ
                      </span>
                    </div>
                    {daysInWeek.map((day) => {
                      const isToday = isSameDay(day, new Date());
                      return (
                        <div
                          key={day.toString()}
                          className={`bg-white rounded-lg text-center font-semibold py-4 ${
                            isToday ? "ring-2 ring-blue-500" : ""
                          }`}
                        >
                          <div
                            className={`text-sm ${
                              isToday ? "text-blue-600" : "text-gray-600"
                            }`}
                          >
                            {format(day, "EEEE", { locale: vi })}
                          </div>
                          <div
                            className={`text-lg font-bold ${
                              isToday ? "text-blue-700" : "text-gray-800"
                            }`}
                          >
                            {format(day, "dd/MM", { locale: vi })}
                          </div>
                        </div>
                      );
                    })}
                    {timeSlots.map((hour) => (
                      <React.Fragment key={hour}>
                        <div className="bg-white rounded-lg flex items-center justify-end pr-4 py-4 font-semibold text-gray-700 sticky left-0 z-10">
                          <div className="text-right">
                            <div className="text-lg">{hour}:00</div>
                          </div>
                        </div>
                        {daysInWeek.map((day) => {
                          const dayBookings = filteredBookings.filter(
                            (booking) =>
                              isSameDay(booking.date, day) &&
                              booking.date.getHours() === hour
                          );
                          const isEmpty = dayBookings.length === 0;
                          return (
                            <div
                              key={`${day}-${hour}`}
                              className={`bg-white rounded-lg min-h-[100px] p-2 border ${
                                isEmpty ? "border-dashed" : "border-solid"
                              }`}
                            >
                              {isEmpty ? (
                                <div className="w-full h-full flex items-center justify-center text-gray-400"></div>
                              ) : (
                                <div className="space-y-1">
                                  {dayBookings.map((booking) => (
                                    <BookingCell
                                      key={booking.id}
                                      booking={booking}
                                      onClick={handleSlotClick}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {showQuickModal && selectedBooking && (
            <div
              style={{ marginTop: 0 }}
              className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
            >
              <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg">
                <h3 className="text-lg font-bold mb-2">Thông tin đặt sân</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Tên khách hàng:</span>
                    {quickLoading ? "Đang tải..." : quickCustomerName}
                  </p>
                  <p>
                    <span className="font-medium">Số điện thoại:</span>
                    {quickLoading ? "Đang tải..." : quickCustomerPhone}
                  </p>
                  <p>
                    <span className="font-medium">Sân:</span>
                    {selectedBooking.field}
                  </p>
                  <p>
                    <span className="font-medium">Thời gian:</span>
                    {selectedBooking.duration} giờ
                  </p>
                  <p>
                    <span className="font-medium">Trạng thái:</span>
                    {selectedBooking.status === "confirmed"
                      ? "Đã xác nhận"
                      : selectedBooking.status === "pending"
                      ? "Chờ xác nhận"
                      : "Đã hủy"}
                  </p>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={handleCloseQuickModal}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={handleOpenDetailModal}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Hóa đơn tổng
                  </button>
                </div>
              </div>
            </div>
          )}
          {showDetailModal && selectedBooking && (
            <BookingDetailsModal
              booking={selectedBooking}
              onClose={handleCloseDetailModal}
              onConfirm={handleBookingConfirm}
              availableServices={services}
            />
          )}
          <CreateSlotModal
            isOpen={showCreateSlotModal}
            onClose={() => setShowCreateSlotModal(false)}
            onSubmit={handleCreateSlot}
            onUpdate={handleUpdateSlot}
            onDelete={handleDeleteSlot}
            fieldId={fieldId}
            fieldName={fieldName}
            facility={facility}
          />
          <PricingManagementModal
            isOpen={showPricingModal}
            onClose={() => setShowPricingModal(false)}
            fieldId={fieldId}
            fieldName={fieldName}
            showToast={showToast}
            fetchSchedule={fetchSchedule}
            onPricingUpdate={checkPricingConfiguration}
          />
        </div>
      </div>
    </>
  );
};

export default WeeklySchedule;
