/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Calendar,
  Clock,
  CreditCard,
  MapPin,
  User,
  CheckCircle,
} from "lucide-react";
import QRCode from "react-qr-code";
import Header from "../Header";

// Interfaces for updated booking flow
interface FieldScheduleSlot {
  scheduleId: number;
  fieldId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: "Available" | "Booked" | "Blocked";
  price: number;
}

interface BookingDetails {
  fieldName: string;
  date: string;
  time: string;
  duration: number | string;
  price: number;
  location: string;
}

interface PaymentFormData {
  customerName: string;
  email: string;
  phone: string;
  paymentMethod: "credit" | "momo" | "banking";
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
}

const PaymentPage: React.FC = () => {
  const location = useLocation();

  // Helper functions for new booking format
  const getTimeRange = (slots: FieldScheduleSlot[]) => {
    if (slots.length === 0) return "";

    const sortedSlots = slots.sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

    // Group consecutive slots
    const slotGroups: FieldScheduleSlot[][] = [];
    let currentGroup: FieldScheduleSlot[] = [sortedSlots[0]];

    for (let i = 1; i < sortedSlots.length; i++) {
      const currentSlot = sortedSlots[i];
      const previousSlot = currentGroup[currentGroup.length - 1];

      if (currentSlot.startTime === previousSlot.endTime) {
        currentGroup.push(currentSlot);
      } else {
        slotGroups.push(currentGroup);
        currentGroup = [currentSlot];
      }
    }
    slotGroups.push(currentGroup);

    return slotGroups
      .map(
        (group) => `${group[0].startTime} - ${group[group.length - 1].endTime}`
      )
      .join("; ");
  };

  const calculateTotalDuration = (slots: FieldScheduleSlot[]) => {
    if (slots.length === 0) return "0 phút";

    let totalMinutes = 0;
    slots.forEach((slot) => {
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
    } else if (hours === 0) {
      return `${minutes} phút`;
    } else {
      return `${hours} giờ ${minutes} phút`;
    }
  };

  // Check if we have new booking format or old format
  const bookingState = location.state as any;
  const isNewFormat = bookingState?.booking?.slots;

  let bookingDetails: BookingDetails;

  if (isNewFormat) {
    // New format from BookingPage
    const { booking } = bookingState;
    bookingDetails = {
      fieldName:
        booking.field?.fieldName || booking.field?.name || "Sân thể thao",
      date: booking.date,
      time: getTimeRange(booking.slots),
      duration: calculateTotalDuration(booking.slots),
      price:
        booking.totalPrice ||
        booking.slots.reduce(
          (sum: number, slot: FieldScheduleSlot) => sum + slot.price,
          0
        ),
      location:
        booking.field?.facilityAddress ||
        booking.field?.location ||
        "Chưa có địa chỉ",
    };
  } else {
    // Old format (fallback)
    const { field, date, time, duration } = bookingState || {};
    bookingDetails = field
      ? {
          fieldName: field.name,
          date: date || new Date().toISOString().split("T")[0],
          time: time || "19:00",
          duration: duration || 60,
          price: field.price,
          location: field.location,
        }
      : {
          fieldName: "Sân bóng đá mini số 1",
          date: new Date().toISOString().split("T")[0],
          time: "19:00",
          duration: 60,
          price: 300000,
          location: "Quận 1, TP.HCM",
        };
  }

  const [formData, setFormData] = useState<PaymentFormData>({
    customerName: "",
    email: "",
    phone: "",
    paymentMethod: "credit",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    // Ưu tiên lấy thông tin từ BookingPage trước, sau đó mới từ localStorage
    if (isNewFormat && bookingState?.booking?.guestInfo) {
      const guestInfo = bookingState.booking.guestInfo;
      setFormData((prev) => ({
        ...prev,
        customerName: guestInfo.name || "",
        phone: guestInfo.phone || "",
        email: "", // Guest không có email từ booking form
      }));
    } else {
      // Fallback: Tự động lấy thông tin người dùng từ localStorage (sau khi login)
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user && Object.keys(user).length > 0) {
        setFormData((prev) => ({
          ...prev,
          customerName:
            user.Admin?.name ||
            user.Customers?.[0]?.name ||
            user.FieldOwner?.name ||
            user.Staff?.name ||
            "",
          email: user.UEmail || "",
          phone:
            user.Admin?.phone ||
            user.Customers?.[0]?.phone ||
            user.FieldOwner?.phone ||
            user.Staff?.phone ||
            "",
        }));
      }
    }
  }, [isNewFormat, bookingState]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentMethodChange = (method: "credit" | "momo" | "banking") => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: method,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Validate form data first
      if (!formData.customerName.trim()) {
        throw new Error("Vui lòng nhập họ và tên");
      }

      if (!formData.phone.trim()) {
        throw new Error("Vui lòng nhập số điện thoại");
      }

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create booking after successful payment
      if (isNewFormat && bookingState?.booking) {
        const { booking } = bookingState;

        // Get user info for booking
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const token = localStorage.getItem("token");

        // Debug: Log form data to check values
        console.log("Form data:", formData);
        console.log("Booking guest info:", booking.guestInfo);
        console.log("Booking slots:", booking.slots);
        console.log("User from localStorage:", user);

        // Extract and validate slot IDs
        const slotIds = booking.slots.map(
          (slot: FieldScheduleSlot) => slot.scheduleId
        );
        console.log("Slot IDs:", slotIds);

        // Ensure we get the guest info from form
        const finalGuestName =
          formData.customerName.trim() ||
          booking.guestInfo?.name ||
          "Khách hàng";
        const finalGuestPhone =
          formData.phone.trim() || booking.guestInfo?.phone || "";

        console.log("Final guest name:", finalGuestName);
        console.log("Final guest phone:", finalGuestPhone);

        // Prepare booking data according to API schema
        const bookingData = {
          userId: user?.UId || null,
          title: `Đặt sân ${booking.field?.fieldName || "SportZone"}`,
          selectedSlotIds: slotIds,
          fieldId: booking.slots[0]?.fieldId || booking.field?.fieldId,
          facilityId: booking.field?.facId,
          guestName: finalGuestName,
          guestPhone: finalGuestPhone,
          serviceIds:
            booking.services?.map((service: any) => service.serviceId) || [],
          discountId: null,
          notes: booking.guestInfo?.notes || "Đặt sân qua hệ thống online",
        };

        console.log("Creating booking with data:", bookingData);
        console.log("JSON payload:", JSON.stringify(bookingData, null, 2));

        // Validate required fields
        if (!bookingData.guestName || !bookingData.guestPhone) {
          throw new Error("Vui lòng nhập đầy đủ họ tên và số điện thoại");
        }

        if (bookingData.selectedSlotIds.length === 0) {
          throw new Error("Không có slot thời gian nào được chọn");
        }

        // Test API connectivity first
        console.log("Testing API connectivity...");
        try {
          const testResponse = await fetch(
            "https://localhost:7057/api/Booking/user/1",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
            }
          );
          console.log("API test response status:", testResponse.status);
        } catch (testError) {
          console.error("API connectivity test failed:", testError);
          // Try without HTTPS
          try {
            const httpTestResponse = await fetch(
              "http://localhost:7057/api/Booking/user/1",
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
              }
            );
            console.log(
              "HTTP API test response status:",
              httpTestResponse.status
            );
          } catch (httpError) {
            console.error("HTTP API test also failed:", httpError);
          }
        }

        console.log("Making actual booking request...");

        // Try HTTPS first, then HTTP if it fails
        let apiUrl = "https://localhost:7057/api/Booking/CreateBooking";
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
          console.log("HTTPS failed, trying HTTP:", httpsError);
          apiUrl = "http://localhost:7057/api/Booking/CreateBooking";

          response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(bookingData),
          });
        }

        console.log("Used API URL:", apiUrl);

        console.log("Response status:", response.status);
        console.log(
          "Response headers:",
          Object.fromEntries(response.headers.entries())
        );

        // Read response text first
        const responseText = await response.text();
        console.log("Raw response text:", responseText);

        if (!response.ok) {
          let errorData;
          try {
            errorData = JSON.parse(responseText);
          } catch {
            errorData = {
              message: responseText || `HTTP error! status: ${response.status}`,
            };
          }

          console.log("Error data:", errorData);
          throw new Error(
            errorData.message ||
              errorData.errors?.[0] ||
              `HTTP error! status: ${response.status}`
          );
        }

        // Parse successful response
        let result;
        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error("Invalid JSON response from server");
        }

        console.log("Full API Response:", result);

        // Check if guest info was saved correctly
        if (result.data) {
          console.log("Booking created with ID:", result.data.bookingId);
          console.log(
            "Guest name in response:",
            result.data.guestName || "NOT FOUND"
          );
          console.log(
            "Guest phone in response:",
            result.data.guestPhone || "NOT FOUND"
          );
          console.log(
            "User ID in response:",
            result.data.userId || "NOT FOUND"
          );
          console.log("Title in response:", result.data.title || "NOT FOUND");

          // If guest info is missing, let's check what we sent
          if (!result.data.guestName || !result.data.guestPhone) {
            console.warn("⚠️ Guest info missing in response!");
            console.log("What we sent - guestName:", bookingData.guestName);
            console.log("What we sent - guestPhone:", bookingData.guestPhone);
          }
        }

        // Set success state
        setPaymentSuccess(true);
        setBookingId(result.data?.bookingId?.toString() || "N/A");

        // Remove auto redirect - let user choose when to go home
      } else {
        // Fallback for old format
        setPaymentSuccess(true);
        setBookingId("LEGACY");

        // Remove auto redirect - let user choose when to go home
      }
    } catch (error) {
      console.error("Error processing payment or creating booking:", error);
      alert(
        `Lỗi: ${
          error instanceof Error ? error.message : "Không thể xử lý thanh toán"
        }`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const fieldPrice = Number(bookingDetails.price) || 0;
  const serviceFee = 15000;
  const totalPrice = fieldPrice + serviceFee;

  const momoQRData = `momo://pay?phone=0123456789&amount=${totalPrice}&note=Dat san ${bookingDetails.fieldName}`;
  const vnpayQRData = `https://img.vietqr.io/image/VCB-1234567890-print.png?amount=${totalPrice}&addInfo=Dat san ${bookingDetails.fieldName} ${formData.phone}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl pt-8 mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Thanh toán đặt sân
          </h1>
          <p className="text-gray-600">
            Hoàn tất thông tin để xác nhận đặt sân
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                Chi tiết đặt sân
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {bookingDetails.fieldName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {bookingDetails.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(bookingDetails.date).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                    <p className="text-sm text-gray-600">Ngày đặt sân</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {bookingDetails.time}
                    </p>
                    <p className="text-sm text-gray-600">
                      Thời lượng:{" "}
                      {typeof bookingDetails.duration === "string"
                        ? bookingDetails.duration
                        : `${bookingDetails.duration} phút`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Giá sân:</span>
                  <span className="font-medium">
                    {formatCurrency(bookingDetails.price)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Phí dịch vụ:</span>
                  <span className="font-medium">{formatCurrency(15000)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      Tổng cộng:
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Thông tin khách hàng
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Họ và tên"
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Số điện thoại"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md col-span-2"
                    placeholder="Email (tùy chọn)"
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Phương thức thanh toán
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {["credit", "momo", "banking"].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => handlePaymentMethodChange(method as any)}
                      className={`p-4 border-2 rounded-lg text-center transition-colors ${
                        formData.paymentMethod === method
                          ? method === "momo"
                            ? "border-pink-500 bg-pink-50 text-pink-700"
                            : method === "banking"
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {method === "momo" ? (
                        <>
                          <div className="w-8 h-8 mx-auto mb-2 bg-pink-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              M
                            </span>
                          </div>
                          <p className="font-medium">MoMo</p>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 mx-auto mb-2 bg-green-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              ₫
                            </span>
                          </div>
                          <p className="font-medium">VNPay</p>
                        </>
                      )}
                    </button>
                  ))}
                </div>

                {formData.paymentMethod === "credit" && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Tên trên thẻ"
                    />
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Số thẻ"
                      maxLength={19}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="MM/YY"
                      />
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="CVV"
                        maxLength={4}
                      />
                    </div>
                  </div>
                )}

                {formData.paymentMethod === "momo" && (
                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                    <h3 className="font-medium text-pink-800 mb-2">
                      Thanh toán bằng MoMo
                    </h3>
                    <p className="text-sm text-pink-700 mb-3">
                      Quét mã QR dưới đây để thanh toán{" "}
                      {formatCurrency(totalPrice)}
                    </p>
                    <div className="flex justify-center">
                      <QRCode value={momoQRData} size={200} />
                    </div>
                  </div>
                )}

                {formData.paymentMethod === "banking" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-medium text-green-800 mb-2">
                      Thanh toán qua VNPay
                    </h3>
                    <p className="text-sm text-green-700 mb-3">
                      Quét mã QR dưới đây để thanh toán{" "}
                      {formatCurrency(totalPrice)}
                    </p>
                    <div className="flex justify-center">
                      <img
                        src={vnpayQRData}
                        alt="VNPay QR"
                        className="h-52 w-auto"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                    isProcessing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Đang xử lý...
                    </div>
                  ) : (
                    `Thanh toán ${formatCurrency(totalPrice)}`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {paymentSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Thanh toán thành công!
              </h2>
              <p className="text-gray-600 mb-4">
                Đặt sân của bạn đã được xác nhận. Bạn có thể tiếp tục sử dụng hệ
                thống hoặc về trang chủ.
              </p>
              {bookingId && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600">Mã booking:</p>
                  <p className="text-lg font-semibold text-gray-900">
                    #{bookingId}
                  </p>
                </div>
              )}
              <div className="space-y-3">
                <button
                  onClick={() => (window.location.href = "/")}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Về trang chủ
                </button>
                <button
                  onClick={() => setPaymentSuccess(false)}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
