import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../Header";
import BookingConfirmModal from "./BookingConfirmModal";
import {
  MapPin,
  Clock,
  User,
  Phone,
  Calendar,
  FileText,
  DollarSign,
  CheckCircle,
  XCircle,
  Star,
} from "lucide-react";

// #region API Interfaces and Helper Functions (Moved outside component)

// API Interfaces
interface ApiFieldResponse {
  fieldId: number;
  facId: number;
  facilityAddress: string;
  categoryId: number;
  categoryName: string;
  fieldName: string;
  description: string;
  isBookingEnable: boolean;
}

interface ApiFacilityWithDetails {
  facilityId: number;
  facilityName: string;
  description: string;
  facilityAddress: string;
  facilityPhone: string;
  openTime: string;
  closeTime: string;
  images: string[];
}

interface ApiFacilityResponse {
  facId: number;
  userId: number;
  name: string;
  openTime: string;
  closeTime: string;
  address: string;
  description: string;
  subdescription: string;
  phone?: string;
  imageUrls: string[];
  categoryFields: { categoryFieldId: number; categoryFieldName: string }[];
}

interface ApiFieldBookingSchedule {
  scheduleId: number;
  fieldId: number;
  startTime: string;
  endTime: string;
  notes: string;
  date: string;
  status: "Available" | "Booked" | "Blocked";
  price: number;
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

interface ApiFieldPricing {
  fieldId: number;
  startTime: string;
  endTime: string;
  price: number;
}

interface BookingFormData {
  fieldId: number;
  date: string;
  startTime: string;
  endTime: string;
  guestName: string;
  guestPhone: string;
  notes: string;
  selectedServices: number[];
}

// API Functions (Stable - defined outside the component)
const fetchFields = async (facilityId: number): Promise<ApiFieldResponse[]> => {
  const response = await fetch(
    `https://localhost:7057/api/Field/facility/${facilityId}`
  );
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const result = await response.json();
  if (result.success && result.data) return result.data;
  throw new Error(result.message || "Failed to fetch fields");
};

const fetchFacilityDetails = async (
  facilityId: number
): Promise<ApiFacilityWithDetails> => {
  const response = await fetch(
    `https://localhost:7057/api/Facility/with-details`
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorText}`
    );
  }
  const result: ApiFacilityResponse[] = await response.json();
  const facility = result.find((fac) => fac.facId === facilityId);
  if (facility) {
    return {
      facilityId: facility.facId,
      facilityName: facility.name,
      description: facility.description,
      facilityAddress: facility.address,
      facilityPhone: facility.phone || "",
      openTime: facility.openTime,
      closeTime: facility.closeTime,
      images:
        facility.imageUrls?.map((url) =>
          url.startsWith("http") ? url : `https://localhost:7057${url}`
        ) || [],
    };
  }
  throw new Error(`Facility with ID ${facilityId} not found`);
};

const fetchFieldBookingSchedules = async (
  date: string
): Promise<ApiFieldBookingSchedule[]> => {
  const response = await fetch(
    "https://localhost:7057/api/FieldBookingSchedule"
  );
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const schedules: ApiFieldBookingSchedule[] = await response.json();
  return schedules.filter((schedule) => schedule.date === date);
};

const fetchFieldPricing = async (
  facilityFieldIds?: number[]
): Promise<ApiFieldPricing[]> => {
  if (Array.isArray(facilityFieldIds) && facilityFieldIds.length > 0) {
    const allPricing: ApiFieldPricing[] = [];
    for (const fieldId of facilityFieldIds) {
      try {
        const response = await fetch(
          `https://localhost:7057/api/FieldPricing/byField/${fieldId}`
        );
        if (!response.ok) {
          console.warn(
            `[DEBUG] Không lấy được giá cho fieldId`,
            fieldId,
            response.status
          );
          continue;
        }
        const result = await response.json();
        console.log(`[DEBUG] Giá trả về cho fieldId`, fieldId, result);
        // Nếu API trả về { success, data }, lấy data, nếu trả về array thì lấy luôn
        if (Array.isArray(result)) {
          allPricing.push(...result);
        } else if (result && Array.isArray(result.data)) {
          allPricing.push(...result.data);
        }
      } catch (err) {
        console.error(`[DEBUG] Lỗi lấy giá cho fieldId`, fieldId, err);
        continue;
      }
    }
    return allPricing;
  } else {
    const response = await fetch("https://localhost:7057/api/FieldPricing");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const result = await response.json();
    if (Array.isArray(result)) return result;
    if (result && Array.isArray(result.data)) return result.data;
    return [];
  }
};

interface UserProfile {
  name?: string;
  userName?: string;
  fullName?: string;
  phone?: string;
  phoneNumber?: string;
  email?: string;
}

// Validation Function (Pure - defined outside the component)
const validatePhoneNumber = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[\s\-().]/g, "");
  const phonePattern = /^0[0-9]{9}$/;
  return phonePattern.test(cleanPhone);
};

// #endregion

// #region Memoized Child Components

const PricingModal = React.memo(
  ({
    show,
    onClose,
    fields,
    pricingData,
  }: {
    show: boolean;
    onClose: () => void;
    fields: ApiFieldResponse[];
    pricingData: ApiFieldPricing[];
  }) => {
    const groupedPricing = useMemo(() => {
      const facilityFieldIds = new Set(fields.map((field) => field.fieldId));
      const safePricingData = Array.isArray(pricingData) ? pricingData : [];
      return safePricingData
        .filter((pricing) => facilityFieldIds.has(pricing.fieldId))
        .reduce((acc, pricing) => {
          if (!acc[pricing.fieldId]) {
            acc[pricing.fieldId] = [];
          }
          acc[pricing.fieldId].push(pricing);
          return acc;
        }, {} as Record<number, ApiFieldPricing[]>);
    }, [fields, pricingData]);

    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              Bảng giá chi tiết theo sân
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Đóng modal"
              aria-label="Đóng modal bảng giá"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {Object.keys(groupedPricing).length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">
                Chưa có thông tin giá cho các sân này
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedPricing).map(
                ([fieldIdStr, pricingList]) => {
                  const fieldId = parseInt(fieldIdStr);
                  const field = fields.find((f) => f.fieldId === fieldId);

                  return (
                    <div
                      key={fieldId}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-800">
                        <Star className="w-5 h-5 text-green-600" />
                        {field?.fieldName || `Sân ${fieldId}`}
                        <span className="text-sm text-gray-500 font-normal">
                          ({field?.categoryName})
                        </span>
                      </h3>

                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-200 rounded-lg">
                          <thead>
                            <tr className="bg-green-50">
                              <th className="border border-gray-200 px-4 py-3 text-left font-medium text-green-800">
                                Khung giờ
                              </th>
                              <th className="border border-gray-200 px-4 py-3 text-left font-medium text-green-800">
                                Giá (VNĐ/giờ)
                              </th>
                              <th className="border border-gray-200 px-4 py-3 text-left font-medium text-green-800">
                                Phân loại
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {pricingList
                              .sort((a, b) =>
                                a.startTime.localeCompare(b.startTime)
                              )
                              .map((pricing, index) => {
                                const startHour = parseInt(
                                  pricing.startTime.split(":")[0]
                                );
                                const isEarlyMorning = startHour < 8;
                                const isPeakHour = startHour >= 16;

                                return (
                                  <tr
                                    key={index}
                                    className={
                                      index % 2 === 0
                                        ? "bg-white"
                                        : "bg-gray-50"
                                    }
                                  >
                                    <td className="border border-gray-200 px-4 py-3 font-medium">
                                      {pricing.startTime.slice(0, 5)} -{" "}
                                      {pricing.endTime.slice(0, 5)}
                                    </td>
                                    <td className="border border-gray-200 px-4 py-3">
                                      <span className="text-green-600 font-semibold text-lg">
                                        {pricing.price.toLocaleString()}đ
                                      </span>
                                    </td>
                                    <td className="border border-gray-200 px-4 py-3">
                                      {isEarlyMorning && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                                          <Clock className="w-3 h-3" />
                                          Giờ sáng sớm
                                        </span>
                                      )}
                                      {isPeakHour && !isEarlyMorning && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
                                          <Star className="w-3 h-3" />
                                          Giờ cao điểm
                                        </span>
                                      )}
                                      {!isEarlyMorning && !isPeakHour && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                                          <CheckCircle className="w-3 h-3" />
                                          Giờ thường
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }
);

const TimeSlotsGrid = React.memo(
  ({
    fields,
    availableSlots,
    selectedSlots,
    onSlotClick,
    selectedDate,
    onDateChange,
    totalPrice,
    facilityDetails,
  }: {
    fields: ApiFieldResponse[];
    availableSlots: FieldScheduleSlot[];
    selectedSlots: FieldScheduleSlot[];
    onSlotClick: (slot: FieldScheduleSlot) => void;
    selectedDate: string;
    onDateChange: (date: string) => void;
    totalPrice: number;
    facilityDetails: ApiFacilityWithDetails | null;
  }) => {
    const timeSlots = React.useMemo(() => {
      // Lấy giờ mở cửa và đóng cửa từ facility
      let openHour = 6;
      let openMinute = 0;
      let closeHour = 23;
      let closeMinute = 0;
      if (facilityDetails?.openTime && facilityDetails?.closeTime) {
        const [oh, om] = facilityDetails.openTime.split(":").map(Number);
        const [ch, cm] = facilityDetails.closeTime.split(":").map(Number);
        openHour = oh;
        openMinute = om;
        closeHour = ch;
        closeMinute = cm;
      }
      const slots = [];
      let hour = openHour;
      let minute = openMinute;
      while (hour < closeHour || (hour === closeHour && minute < closeMinute)) {
        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push({ time, hour, minute });
        minute += 30;
        if (minute >= 60) {
          hour += 1;
          minute = 0;
        }
      }
      return slots;
    }, [facilityDetails]);

    return (
      <div className="bg-white rounded-lg p-4 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Lịch sân chi tiết</h3>
          <div className="flex space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-400 rounded"></div>
              <span>Còn trống</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-purple-700 rounded"></div>
              <span>Đang chọn</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Đã đặt</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-400 rounded"></div>
              <span>Bị khóa</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-300 rounded opacity-50"></div>
              <span>Đã qua giờ</span>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center">
          <span className="text-sm font-medium mr-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-600" />
            Ngày:
          </span>
          <input
            type="date"
            value={selectedDate || ""}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => onDateChange(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
            title="Chọn ngày (không thể chọn ngày trong quá khứ)"
            aria-label="Chọn ngày"
          />
        </div>

        {fields.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="min-w-[1400px]">
              <div
                className="grid gap-px bg-gray-200 mb-px"
                style={{
                  gridTemplateColumns: `180px repeat(${timeSlots.length}, minmax(40px, 1fr))`,
                }}
              >
                <div className="bg-green-700 text-white text-xs font-medium p-2 flex items-center">
                  Tên sân
                </div>
                {timeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="bg-green-700 text-white text-xs font-medium p-1 text-center"
                  >
                    {slot.time}
                  </div>
                ))}
              </div>

              {fields.map((field) => (
                <div
                  key={field.fieldId}
                  className="grid gap-px bg-gray-200 mb-px"
                  style={{
                    gridTemplateColumns: `180px repeat(${timeSlots.length}, minmax(40px, 1fr))`,
                  }}
                >
                  <div className="bg-gray-100 text-xs font-medium p-2 flex items-center break-words">
                    {field.fieldName}
                  </div>
                  {timeSlots.map((timeSlot, slotIndex) => {
                    const slot = availableSlots.find(
                      (s) =>
                        s.fieldId === field.fieldId &&
                        s.startTime === timeSlot.time
                    );
                    const isSelected = selectedSlots.some(
                      (s) => s.scheduleId === slot?.scheduleId
                    );

                    // Check if the slot is in the past
                    let isPastSlot = false;
                    if (slot) {
                      const now = new Date();
                      const slotDate = new Date(slot.date);
                      const [slotHour, slotMinute] = slot.startTime
                        .split(":")
                        .map(Number);
                      const slotDateTime = new Date(slotDate);
                      slotDateTime.setHours(slotHour, slotMinute, 0, 0);
                      isPastSlot = slotDateTime < now;
                    }

                    let bgColor = "bg-gray-100";
                    let textColor = "text-gray-500";
                    let isClickable = false;
                    let title = `${field.fieldName} - ${timeSlot.time} - Không có lịch`;

                    if (slot) {
                      title = `${field.fieldName} - ${timeSlot.time} - ${
                        slot.status
                      } - ${slot.price.toLocaleString()}đ`;

                      if (isPastSlot) {
                        bgColor = "bg-gray-300";
                        textColor = "text-gray-400";
                        title += " - Đã qua thời gian";
                      } else if (isSelected) {
                        bgColor = "bg-purple-700";
                        textColor = "text-white";
                        isClickable = true;
                      } else if (slot.status === "Available") {
                        bgColor = "bg-green-400";
                        textColor = "text-white";
                        isClickable = true;
                      } else if (slot.status === "Booked") {
                        bgColor = "bg-red-500";
                        textColor = "text-white";
                      } else if (slot.status === "Blocked") {
                        bgColor = "bg-gray-400";
                        textColor = "text-white";
                      }
                    }

                    return (
                      <button
                        key={slotIndex}
                        onClick={() => slot && isClickable && onSlotClick(slot)}
                        disabled={!isClickable}
                        className={`
                          ${bgColor} ${textColor} h-8 text-xs font-medium transition-colors
                          ${
                            isClickable
                              ? "hover:opacity-80 cursor-pointer"
                              : "cursor-not-allowed"
                          }
                          ${isPastSlot ? "opacity-50" : ""}
                        `}
                        title={title}
                        aria-label={`Khung giờ ${timeSlot.time} cho ${field.fieldName}`}
                      >
                        {slot && (
                          <div className="text-xs">
                            {(slot.price / 1000).toFixed(0)}k
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Không tìm thấy sân nào cho cơ sở này.</p>
          </div>
        )}
        {selectedSlots.length > 0 && (
          <div className="mt-4 flex justify-end">
            <div className="bg-green-600 text-white px-4 py-2 rounded font-medium">
              Tổng tiền: {totalPrice.toLocaleString()} VND
            </div>
          </div>
        )}
      </div>
    );
  }
);

// #endregion

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { facId } = useParams<{ facId: string }>();

  // State management
  const [fields, setFields] = useState<ApiFieldResponse[]>([]);
  const [selectedField, setSelectedField] = useState<ApiFieldResponse | null>(
    null
  );
  const [facilityDetails, setFacilityDetails] =
    useState<ApiFacilityWithDetails | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [availableSlots, setAvailableSlots] = useState<FieldScheduleSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<FieldScheduleSlot[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showPricingModal, setShowPricingModal] = useState<boolean>(false);
  const [fieldPricingData, setFieldPricingData] = useState<ApiFieldPricing[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string>("");
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState<boolean>(false);
  const [formData, setFormData] = useState<BookingFormData>({
    fieldId: 0,
    date: "",
    startTime: "",
    endTime: "",
    guestName: "",
    guestPhone: "",
    notes: "",
    selectedServices: [],
  });

  const getUserInfoFromStorage = useCallback((): UserProfile | null => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return null;

      const user = JSON.parse(userStr);

      console.log("User info from localStorage:", user);
      // Lấy trực tiếp name và phone từ user object
      return {
        fullName: user.name || "",
        phoneNumber: user.phone || "",
        email: user.UEmail || user.uEmail || "",
        name: user.name || "",
        phone: user.phone || "",
      };
    } catch {
      return null;
    }
  }, []);

  const getUserInfoFromToken = useCallback((): UserProfile | null => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const userInfo = JSON.parse(jsonPayload);
      return userInfo;
    } catch (error) {
      console.error("Error decoding user token:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    const loadUserInfo = async () => {
      setIsLoadingUserInfo(true);
      try {
        // Try to get user info from localStorage first, then fallback to JWT token
        let userInfo = getUserInfoFromStorage();
        if (!userInfo) {
          userInfo = getUserInfoFromToken();
        }

        if (userInfo) {
          setFormData((prev) => ({
            ...prev,
            guestName: userInfo.name || userInfo.fullName || "",
            guestPhone: userInfo.phone || userInfo.phoneNumber || "",
          }));
        }
      } catch (error) {
        console.warn("Could not load user info:", error);
      } finally {
        setIsLoadingUserInfo(false);
      }
    };

    loadUserInfo();
  }, [getUserInfoFromStorage, getUserInfoFromToken]);

  // Initial data loading effect
  useEffect(() => {
    const facilityIdNum = parseInt(facId || "", 10);
    if (isNaN(facilityIdNum)) {
      navigate("/field_list");
      return;
    }

    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fieldsData = await fetchFields(facilityIdNum);
        if (!isMounted) return;

        setFields(fieldsData);

        if (fieldsData.length > 0) {
          const firstField = fieldsData[0];
          setSelectedField(firstField);
          setFormData((prev) => ({ ...prev, fieldId: firstField.fieldId }));

          // Fetch facility details in parallel
          fetchFacilityDetails(firstField.facId)
            .then((details) => isMounted && setFacilityDetails(details))
            .catch((err) =>
              console.warn("Could not load facility details:", err)
            );
        }
      } catch (err) {
        if (isMounted)
          setError("Failed to load booking data. Please try again.");
        console.error("Error loading initial data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [facId, navigate]);

  // Schedules loading effect
  useEffect(() => {
    if (!selectedDate) return;

    let isMounted = true;
    const loadSchedules = async () => {
      try {
        const apiSchedules = await fetchFieldBookingSchedules(selectedDate);
        if (!isMounted) return;

        const slots: FieldScheduleSlot[] = apiSchedules.map((schedule) => ({
          scheduleId: schedule.scheduleId,
          fieldId: schedule.fieldId,
          date: schedule.date,
          startTime: schedule.startTime.slice(0, 5),
          endTime: schedule.endTime.slice(0, 5),
          status: schedule.status,
          price: schedule.price,
        }));
        setAvailableSlots(slots);
      } catch (error) {
        console.error("Error loading schedules:", error);
        if (isMounted) setAvailableSlots([]);
      }
    };

    loadSchedules();

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  // Update form data when selected slots change
  useEffect(() => {
    if (selectedSlots.length > 0) {
      const sortedSlots = [...selectedSlots].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );
      setFormData((prev) => ({
        ...prev,
        startTime: sortedSlots[0].startTime,
        endTime: sortedSlots[sortedSlots.length - 1].endTime,
        date: sortedSlots[0].date,
        fieldId: sortedSlots[0].fieldId,
      }));
      setSelectedField(
        fields.find((f) => f.fieldId === sortedSlots[0].fieldId) || null
      );
    } else {
      setFormData((prev) => ({ ...prev, startTime: "", endTime: "" }));
    }
  }, [selectedSlots, fields]);

  // Helper function to calculate duration
  const calculateDuration = useCallback((slots: FieldScheduleSlot[]) => {
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
  }, []);

  // Helper function to format time range
  const getTimeRange = useCallback((slots: FieldScheduleSlot[]) => {
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
        (group) => `${group[0].startTime}-${group[group.length - 1].endTime}`
      )
      .join("; ");
  }, []);

  // Memoized calculated values
  const totalPrice = useMemo(() => {
    return selectedSlots.reduce((sum, slot) => sum + slot.price, 0);
  }, [selectedSlots]);

  // Memoized Event Handlers
  const handleDateChange = useCallback((date: string) => {
    const today = new Date().toISOString().split("T")[0];
    if (date < today) {
      alert("Không thể chọn ngày trong quá khứ.");
      return;
    }
    setSelectedDate(date);
    setSelectedSlots([]); // Clear selected slots when date changes
  }, []);

  const handleSlotClick = useCallback(
    (slot: FieldScheduleSlot) => {
      if (slot.status !== "Available") return;

      // Check if the slot is in the past
      const now = new Date();
      const slotDate = new Date(slot.date);
      const [slotHour, slotMinute] = slot.startTime.split(":").map(Number);
      const slotDateTime = new Date(slotDate);
      slotDateTime.setHours(slotHour, slotMinute, 0, 0);

      if (slotDateTime < now) {
        alert("Không thể đặt lịch cho thời gian đã qua.");
        return;
      }

      // Prevent selecting slots from different fields
      if (
        selectedSlots.length > 0 &&
        selectedSlots[0].fieldId !== slot.fieldId
      ) {
        alert(
          "Bạn chỉ có thể đặt lịch cho một sân tại một thời điểm. Vui lòng bỏ chọn các khung giờ ở sân khác trước."
        );
        return;
      }

      setSelectedSlots((prevSlots) => {
        const isSelected = prevSlots.some(
          (s) => s.scheduleId === slot.scheduleId
        );
        if (isSelected) {
          return prevSlots.filter((s) => s.scheduleId !== slot.scheduleId);
        } else {
          return [...prevSlots, slot];
        }
      });
    },
    [selectedSlots]
  );

  const handlePhoneChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, guestPhone: value }));
    if (value.trim() === "") {
      setPhoneError("");
    } else if (!validatePhoneNumber(value)) {
      setPhoneError("Số điện thoại phải có đúng 10 số và bắt đầu bằng số 0.");
    } else {
      setPhoneError("");
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (selectedSlots.length === 0) {
      alert("Vui lòng chọn ít nhất một khung giờ.");
      return;
    }
    if (!formData.guestName || !formData.guestPhone) {
      alert("Vui lòng nhập đầy đủ thông tin liên hệ.");
      return;
    }
    if (phoneError) {
      alert(phoneError);
      return;
    }
    setShowConfirmModal(true);
  }, [
    selectedSlots.length,
    formData.guestName,
    formData.guestPhone,
    phoneError,
  ]);

  const handleOpenPricingModal = useCallback(async () => {
    try {
      // Lấy danh sách fieldId của cơ sở hiện tại
      const fieldIds = fields.map((f) => f.fieldId);
      const pricingData = await fetchFieldPricing(fieldIds);
      setFieldPricingData(pricingData);
      setShowPricingModal(true);
    } catch (error) {
      console.error("Error loading pricing data:", error);
      alert("Không thể tải thông tin giá. Vui lòng thử lại.");
    }
  }, []);

  const handleConfirmBooking = useCallback(() => {
    navigate("/payment", {
      state: {
        booking: {
          field: selectedField
            ? {
                ...selectedField,
                facilityName:
                  facilityDetails?.facilityName || "SportZone Facility",
                image:
                  facilityDetails?.images?.[0] || "/api/placeholder/400/300",
                openTime: facilityDetails?.openTime || "05:30:00",
                closeTime: facilityDetails?.closeTime || "22:30:00",
                pricing: [],
              }
            : null,
          slots: selectedSlots,
          guestInfo: {
            name: formData.guestName,
            phone: formData.guestPhone,
            notes: formData.notes,
          },
          services: [],
          totalPrice: (totalPrice * 0.5).toFixed(0),
          date: selectedDate,
        },
      },
    });
  }, [
    navigate,
    selectedField,
    facilityDetails,
    selectedSlots,
    formData,
    totalPrice,
    selectedDate,
  ]);

  const fieldsForGrid = useMemo(() => {
    if (selectedSlots.length > 0) {
      // If slots are selected, only show the field for those slots
      const selectedFieldId = selectedSlots[0].fieldId;
      return fields.filter((f) => f.fieldId === selectedFieldId);
    }
    // Otherwise, show all fields for the facility
    return fields;
  }, [fields, selectedSlots]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Đang tải dữ liệu...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-red-600 text-lg">{error}</div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Đặt lịch sân
              </h1>
              <p className="text-gray-600">
                Chọn sân, thời gian và hoàn tất đặt sân chỉ trong vài bước
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main content area */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="flex justify-between items-center pb-5">
                    <h3 className="text-lg font-semibold">Thông tin cơ sở</h3>
                    <button
                      onClick={handleOpenPricingModal}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Xem bảng giá
                    </button>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        {facilityDetails?.images &&
                        facilityDetails.images.length > 0 ? (
                          <img
                            src={facilityDetails.images[0]}
                            alt={facilityDetails.facilityName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-green-200 flex items-center justify-center">
                            <span className="text-green-700 font-bold text-lg">
                              🏟️
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-green-800 mb-2">
                          {facilityDetails?.facilityName || "Đang tải..."}
                        </h4>
                        <p className="text-green-700 mb-1 flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-green-600" />
                          {facilityDetails?.facilityAddress || "Đang tải..."}
                        </p>
                        <p className="text-green-600 text-sm mb-1 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-600" />
                          {facilityDetails?.openTime?.slice(0, 5) ||
                            "00:00"} -{" "}
                          {facilityDetails?.closeTime?.slice(0, 5) || "00:00"}
                        </p>
                        <p className="text-green-600 text-sm">
                          {facilityDetails?.description ||
                            "Đang tải thông tin..."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <TimeSlotsGrid
                  fields={fieldsForGrid}
                  availableSlots={availableSlots}
                  selectedSlots={selectedSlots}
                  onSlotClick={handleSlotClick}
                  selectedDate={selectedDate}
                  onDateChange={handleDateChange}
                  totalPrice={totalPrice}
                  facilityDetails={facilityDetails}
                />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-green-600" />
                    Thông tin liên hệ
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        Họ tên *
                      </label>
                      <input
                        type="text"
                        value={formData.guestName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            guestName: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder={
                          isLoadingUserInfo
                            ? "Đang tải thông tin..."
                            : "Nhập họ tên"
                        }
                        disabled={isLoadingUserInfo}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        value={formData.guestPhone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                          phoneError ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder={
                          isLoadingUserInfo
                            ? "Đang tải thông tin..."
                            : "Nhập 10 số (VD: 0901234567)"
                        }
                        disabled={isLoadingUserInfo}
                      />
                      {phoneError && (
                        <p className="mt-1 text-sm text-red-600">
                          {phoneError}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        Ghi chú
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        rows={3}
                        placeholder="Ghi chú thêm (tùy chọn)"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Tóm tắt đặt sân
                  </h3>
                  {selectedSlots.length > 0 && selectedField ? (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Sân:</span>
                        <span className="font-medium">
                          {selectedField.fieldName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Ngày:</span>
                        <span className="font-medium">
                          {new Date(selectedDate).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Thời gian:</span>
                        <span className="font-medium">
                          {getTimeRange(selectedSlots)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Thời lượng:</span>
                        <span className="font-medium">
                          {calculateDuration(selectedSlots)}
                        </span>
                      </div>
                      <hr className="my-3" />
                      <div className="flex justify-between items-center text-lg font-bold text-green-600">
                        <span>Tổng tiền:</span>
                        <span>{totalPrice.toLocaleString()}đ</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Vui lòng chọn khung giờ để xem tóm tắt.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={
                      selectedSlots.length === 0 ||
                      !formData.guestName ||
                      !formData.guestPhone ||
                      !!phoneError
                    }
                    className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Tiếp theo
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <BookingConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmBooking}
        booking={{
          field: selectedField
            ? {
                ...selectedField,
                facilityName:
                  facilityDetails?.facilityName || "SportZone Facility",
                image:
                  facilityDetails?.images?.[0] || "/api/placeholder/400/300",
                openTime: facilityDetails?.openTime || "05:30:00",
                closeTime: facilityDetails?.closeTime || "22:30:00",
                pricing: [],
              }
            : null,
          slots: selectedSlots,
          guestInfo: {
            name: formData.guestName,
            phone: formData.guestPhone,
            notes: formData.notes,
          },
          services: [],
          totalPrice: totalPrice,
          date: selectedDate,
        }}
      />

      <PricingModal
        show={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        fields={fields}
        pricingData={fieldPricingData}
      />
    </div>
  );
};

export default BookingPage;
