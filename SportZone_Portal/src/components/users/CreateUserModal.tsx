import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { CreateUserRequest } from "./types";

interface Facility {
  facId: number;
  name: string;
  address?: string;
}

interface CreateUserModalProps {
  onClose: () => void;
  onUserCreated: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  onClose,
  onUserCreated,
}) => {
  const [formData, setFormData] = useState<CreateUserRequest>({
    Email: "",
    Password: "",
    RoleId: 1, // Đảm bảo là number
    Name: "",
    Phone: "",
    Status: "Active",
    FacilityId: undefined,
    StartTime: undefined,
    EndTime: undefined,
    Image: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setFacilitiesLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch(
        "https://localhost:7057/api/Facility/with-details",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("API Response:", result);
        if (result.success && result.data) {
          console.log("Facilities data:", result.data);
          setFacilities(result.data);
        } else {
          console.log("Direct response (no wrapper):", result);
          // Nếu API trả về trực tiếp array mà không có wrapper
          if (Array.isArray(result)) {
            setFacilities(result);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching facilities:", err);
    } finally {
      setFacilitiesLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]:
          name === "RoleId" || name === "FacilityId" ? parseInt(value) : value,
      };

      if (name === "RoleId") {
        console.log(
          "RoleId changed to:",
          newData.RoleId,
          "Should show staff fields:",
          newData.RoleId === 4
        );
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token xác thực");
      }
      const response = await fetch("https://localhost:7057/create-account", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.Email,
          password: formData.Password,
          roleId: formData.RoleId,
          name: formData.Name,
          phone: formData.Phone,
          status: formData.Status,
          image: formData.Image,
          facilityId:
            formData.RoleId === 4 ? formData.FacilityId ?? 0 : undefined,
          startTime: formData.RoleId === 4 ? formData.StartTime : undefined,
          endTime: formData.RoleId === 4 ? formData.EndTime : undefined,
        }),
      });
      const result = await response.json();
      // Nếu status 200 và có message thành công thì vẫn coi là thành công
      if (response.ok && (result.success === true || (result.message && result.message.toLowerCase().includes("thành công")))) {
        setError(null);
        // Hiển thị alert thành công rõ ràng
        window.alert(result.message || "Tạo tài khoản thành công!");
        onUserCreated();
      } else if (!response.ok) {
        setError(result.message || `HTTP error! status: ${response.status}`);
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      } else {
        setError(result.message || "Lỗi khi tạo tài khoản");
        throw new Error(result.message || "Lỗi khi tạo tài khoản");
      }
    } catch (err) {
      console.error("Error creating user:", err);
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-green-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Thêm tài khoản người dùng mới
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Điền thông tin để tạo tài khoản mới cho hệ thống
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Đóng"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Lỗi:</strong> {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label
                htmlFor="Name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="Name"
                name="Name"
                value={formData.Name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Nhập họ và tên"
              />
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="Email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="Email"
                name="Email"
                value={formData.Email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="user@example.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="Password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="Password"
                name="Password"
                value={formData.Password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>

            {/* Phone Field */}
            <div>
              <label
                htmlFor="Phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Số điện thoại
              </label>
              <input
                type="tel"
                id="Phone"
                name="Phone"
                value={formData.Phone || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0123456789"
              />
            </div>

            {/* Role Field */}
            <div>
              <label
                htmlFor="RoleId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Loại tài khoản <span className="text-red-500">*</span>
              </label>
              <select
                id="RoleId"
                name="RoleId"
                value={formData.RoleId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value={1}>Khách hàng</option>
                <option value={2}>Chủ sân</option>
                <option value={3}>Admin</option>
                {/* <option value={4}>Nhân viên</option> */}
              </select>
            </div>

            {/* Status Field */}
            <div>
              <label
                htmlFor="Status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Trạng thái
              </label>
              <select
                id="Status"
                name="Status"
                value={formData.Status || "Active"}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="Active">Hoạt động</option>
                <option value="Inactive">Không hoạt động</option>
              </select>
            </div>

            {/* Additional fields for Staff (RoleId = 4) */}
            {(() => {
              console.log(
                "Current RoleId:",
                formData.RoleId,
                "Type:",
                typeof formData.RoleId,
                "Is 4?:",
                formData.RoleId === 4
              );
              return formData.RoleId === 4;
            })() && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-4 border border-blue-200">
                  <h4 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    Thông tin nhân viên
                  </h4>
                  <p className="text-sm text-blue-700">
                    Vui lòng điền đầy đủ thông tin cơ sở làm việc và thời gian
                    làm việc
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Facility Field - Made more prominent */}
                  <label
                    htmlFor="FacilityId"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Cơ sở làm việc <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="FacilityId"
                    name="FacilityId"
                    value={formData.FacilityId || 0}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 bg-white font-medium"
                    disabled={facilitiesLoading}
                  >
                    <option value={0}>Chưa phân cơ sở</option>
                    {facilitiesLoading ? (
                      <option disabled>Đang tải danh sách cơ sở...</option>
                    ) : (
                      facilities.map((facility) => (
                        <option key={facility.facId} value={facility.facId}>
                          {facility.name}{" "}
                          {facility.address ? `- ${facility.address}` : ""}
                        </option>
                      ))
                    )}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {facilitiesLoading
                      ? "Đang tải danh sách cơ sở từ hệ thống..."
                      : 'Chọn "Chưa phân cơ sở" nếu nhân viên chưa được phân công cơ sở cụ thể'}
                  </p>

                  {/* Work Period */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="StartTime"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Ngày bắt đầu làm việc
                      </label>
                      <input
                        type="date"
                        id="StartTime"
                        name="StartTime"
                        value={
                          formData.StartTime
                            ? formData.StartTime.split("T")[0]
                            : ""
                        }
                        onChange={(e) => {
                          const { name, value } = e.target;
                          setFormData((prev) => ({
                            ...prev,
                            [name]: value ? `${value}T08:00:00` : "",
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="EndTime"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Ngày kết thúc làm việc
                      </label>
                      <input
                        type="date"
                        id="EndTime"
                        name="EndTime"
                        value={
                          formData.EndTime ? formData.EndTime.split("T")[0] : ""
                        }
                        onChange={(e) => {
                          const { name, value } = e.target;
                          setFormData((prev) => ({
                            ...prev,
                            [name]: value ? `${value}T18:00:00` : "",
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-8 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang tạo...
                </>
              ) : (
                <>+ Thêm tài khoản</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
