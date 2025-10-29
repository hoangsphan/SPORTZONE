/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
  FiCheckCircle,
  FiEdit,
  FiPlus,
  FiSlash,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import Swal from "sweetalert2";
import Sidebar from "../../Sidebar";

type Staff = {
  id: number; // uId
  name: string;
  phone: string;
  dob: string; // yyyy-MM-dd
  image: string;
  startTime: string; // ISO string or date string
  endTime?: string; // Optional
  email: string;
  status: "Active" | "Inactive";
  facIds: number[]; // Array of facility IDs
  roleName: string;
  facilityNames: string[]; // Array of facility names
};

type EditStaff = {
  name: string;
  phone: string;
  dob: string;
  image: string;
  imageFile: File | null;
  startTime: string;
  endTime: string;
  email: string;
  password: string;
  status: "Active" | "Inactive";
  facilityId: number | null;
};

const StaffManager: React.FC = () => {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [filteredStaffs, setFilteredStaffs] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<EditStaff>({
    name: "",
    phone: "",
    dob: "",
    image: "",
    imageFile: null,
    startTime: "",
    endTime: "",
    email: "",
    password: "",
    status: "Active",
    facilityId: null,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<{ id: number; name: string }[]>(
    []
  );
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const totalRows = filteredStaffs.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const paginatedStaffs = filteredStaffs.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Format date for date input
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Fetch staff data from API
  const fetchStaffs = async () => {
    setLoading(true);
    setError(null);
    try {
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;
      const roleId = user?.roleId;

      // Get authentication token
      const token = localStorage.getItem("token");
      const authHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        authHeaders.Authorization = `Bearer ${token}`;
      }

      const facilityList =
        user?.FieldOwner?.facilities?.map((f: any) => ({
          id: f.facId,
          name: f.name || `Facility ${f.facId}`,
        })) || [];
      setFacilities(facilityList);

      let allStaffs: any[] = [];

      if (roleId === 3) {
        // Admin lấy toàn bộ staff
        const response = await fetch(
          `https://localhost:7057/api/Staff/GetAll`,
          {
            method: "GET",
            headers: authHeaders,
          }
        );
        console.log("[DEBUG] API /api/Staff/GetAll status:", response.status);
        const responseText = await response.text();
        let apiResponse: any = {};
        try {
          apiResponse = JSON.parse(responseText);
        } catch {
          apiResponse = { error: responseText };
        }
        console.log("[DEBUG] API /api/Staff/GetAll response:", apiResponse);
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            );
          }
          throw new Error(`Lỗi tải tất cả nhân viên (HTTP ${response.status})`);
        }
        if (apiResponse.success) allStaffs = apiResponse.data || [];
        else throw new Error(apiResponse.message || "Không thể lấy nhân viên.");
      } else {
        // FieldOwner lấy theo từng facility
        for (const facility of facilityList) {
          try {
            const response = await fetch(
              `https://localhost:7057/api/Staff/by-facility/${facility.id}`,
              {
                method: "GET",
                headers: authHeaders,
              }
            );
            console.log(
              `[DEBUG] API /api/Staff/by-facility/${facility.id} status:`,
              response.status
            );
            const responseText = await response.text();
            let apiResponse: any = {};
            try {
              apiResponse = JSON.parse(responseText);
            } catch {
              apiResponse = { error: responseText };
            }
            console.log(
              `[DEBUG] API /api/Staff/by-facility/${facility.id} response:`,
              apiResponse
            );
            if (response.ok) {
              if (apiResponse.success && apiResponse.data) {
                allStaffs = allStaffs.concat(apiResponse.data);
              }
            }
          } catch (err) {
            console.warn(
              `Không thể tải nhân viên cho facility ${facility.id}:`,
              err
            );
          }
        }
      }

      // Gộp danh sách staff không trùng uId
      const staffMap = new Map<number, Staff>();

      allStaffs.forEach((item: any) => {
        const uId = item.uId;
        const facId = item.fac?.facId || item.facId;
        // Ưu tiên lấy tên cơ sở từ API, nếu không có thì lấy từ facilities state
        const facName =
          item.facilityName ||
          facilities.find((f) => f.id === facId)?.name ||
          "Unknown";
        if (staffMap.has(uId)) {
          const existing = staffMap.get(uId);
          if (existing && !existing.facIds.includes(facId)) {
            existing.facIds.push(facId);
            existing.facilityNames.push(facName);
          }
        } else {
          // Normalize image URL
          let image = item.image || "/default-avatar.jpg";
          if (image && !image.startsWith("http")) {
            image = `https://localhost:7057${image}`;
          }
          staffMap.set(uId, {
            id: uId,
            name: item.name || "",
            phone: item.phone || "",
            dob: item.dob || "",
            image,
            startTime: item.startTime || "",
            endTime: item.endTime || "",
            email: item.email || "",
            status: item.status || "Inactive",
            facIds: [facId],
            roleName: "Nhân viên",
            facilityNames: [facName],
          });
        }
      });

      const mappedStaffs = Array.from(staffMap.values());
      setStaffs(mappedStaffs);
      setFilteredStaffs(mappedStaffs);
    } catch (err: any) {
      const errorMessage =
        err.message || "Lỗi khi tải danh sách nhân viên. Vui lòng thử lại.";
      setError(errorMessage);
      Swal.fire(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredStaffs(
      staffs.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.phone.includes(term) ||
          s.email.toLowerCase().includes(term) ||
          s.facIds.some((facId) => facId.toString().includes(term)) ||
          s.facilityNames.some((name) => name.toLowerCase().includes(term))
      )
    );
    setCurrentPage(1); // Reset về trang đầu khi search
  }, [searchTerm, staffs]);

  // Delete staff via API
  const deleteStaff = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: `Bạn có chắc muốn xóa nhân viên "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const authHeaders: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          authHeaders.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`https://localhost:7057/api/Staff/${id}`, {
          method: "DELETE",
          headers: authHeaders,
        });
        if (!response.ok) {
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center text-gray-500 py-6">
                  Đang tải...
                </td>
              </tr>
            ) : paginatedStaffs.length > 0 ? (
              paginatedStaffs.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <img
                      src={staff.image}
                      alt={staff.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </td>
                  <td className="p-3 font-medium">{staff.name}</td>
                  <td className="p-3">{staff.phone}</td>
                  <td className="p-3">{staff.email}</td>
                  <td className="p-3">
                    {staff.startTime
                      ? new Date(staff.startTime).toLocaleString("vi-VN")
                      : ""}
                  </td>
                  <td className="p-3">{staff.facilityNames.join(", ")}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-white ${
                        staff.status === "Active"
                          ? "bg-green-600"
                          : staff.status === "Inactive"
                          ? "bg-red-600"
                          : "bg-gray-500"
                      }`}
                    >
                      {staff.status === "Active"
                        ? "Hoạt động"
                        : staff.status === "Inactive"
                        ? "Không hoạt động"
                        : staff.status}
                    </span>
                  </td>
                  <td className="p-3 space-x-2 flex items-center">
                    <button
                      onClick={() => handleEdit(staff)}
                      className="text-green-600 hover:text-green-800"
                      title="Chỉnh sửa"
                    >
                      <FiEdit size={18} />
                    </button>
                    {/* <button
                          onClick={() => toggleStatus(staff.id)}
                          className={`$${
                            staff.status === "Active"
                              ? "text-red-600 hover:text-red-800"
                              : "text-blue-600 hover:text-blue-800"
                          }`}
                          title={
                            staff.status === "Active"
                              ? "Chuyển thành Không hoạt động"
                              : "Kích hoạt lại nhân viên"
                          }
                        >
                          {staff.status === "Active" ? (
                            <FiSlash size={18} />
                          ) : (
                            <FiCheckCircle size={18} />
                          )}
                        </button> */}
                    <button
                      onClick={() => deleteStaff(staff.id, staff.name)}
                      className="text-red-600 hover:text-red-800"
                      title="Xóa nhân viên"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center text-gray-500 py-6">
                  Không có nhân viên nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>;
          {
            /* Pagination controls */
          }
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4">
            <div className="flex items-center gap-2">
              <span>Hiển thị</span>
              <select
                className="border rounded px-2 py-1"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {[5, 10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span>nhân viên/trang</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 border rounded disabled:opacity-50"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                Đầu
              </button>
              <button
                className="px-2 py-1 border rounded disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </button>
              <span>
                Trang <b>{currentPage}</b> / {totalPages}
              </span>
              <button
                className="px-2 py-1 border rounded disabled:opacity-50"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Sau
              </button>
              <button
                className="px-2 py-1 border rounded disabled:opacity-50"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Cuối
              </button>
            </div>
            <div className="text-sm text-gray-500">
              Tổng: <b>{totalRows}</b> nhân viên
            </div>
          </div>;
          throw new Error(apiResponse.error || "Lỗi khi cập nhật trạng thái.");
        }
      } catch (err: any) {
        const errorMessage = err.message || "Lỗi khi cập nhật trạng thái.";
        setError(errorMessage);
        Swal.fire(errorMessage, "error");
      }
    }
  };

  const handleEdit = (staff: Staff) => {
    setSelectedStaff(staff);
    setFormData({
      name: staff.name,
      phone: staff.phone,
      dob: formatDate(staff.dob),
      image: staff.image,
      imageFile: null,
      startTime: staff.startTime ? formatDate(staff.startTime) : "",
      endTime: staff.endTime ? formatDate(staff.endTime) : "",
      email: staff.email,
      password: "", // Do not prefill password on edit
      status: staff.status,
      facilityId: staff.facIds[0] || null,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone || !formData.email) {
      Swal.fire("Vui lòng điền đầy đủ tên, email, SĐT", "", "error");
      return;
    }
    if (!formData.facilityId) {
      Swal.fire("Vui lòng chọn cơ sở làm việc", "error");
      return;
    }

    // Helper để tạo thông báo lỗi chi tiết từ API
    const buildErrorMsg = (apiResponse: any, defaultMsg: string) => {
      let errorMsg = apiResponse?.message || apiResponse?.error || defaultMsg;
      if (apiResponse?.errors) {
        if (typeof apiResponse.errors === "string")
          errorMsg += `\n${apiResponse.errors}`;
        else if (typeof apiResponse.errors === "object") {
          errorMsg +=
            "\n" +
            Object.entries(apiResponse.errors)
              .map(
                ([field, msgs]) =>
                  `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`
              )
              .join("\n");
        }
      }
      return errorMsg;
    };

    const isEdit = !!selectedStaff;
    if (isEdit) {
      // Update: giữ nguyên logic cũ (FormData)
      const form = new FormData();
      form.append("Email", formData.email);
      form.append("Status", formData.status);
      form.append("Name", formData.name);
      form.append("Phone", formData.phone);
      form.append("Dob", formData.dob || "");
      form.append("FacId", String(formData.facilityId));
      form.append("StartTime", formData.startTime || "");
      form.append("EndTime", formData.endTime || "");
      if (formData.imageFile) {
        form.append("ImageFile", formData.imageFile);
        form.append("RemoveImage", "false");
      } else {
        form.append("RemoveImage", formData.image ? "false" : "true");
      }
      try {
        const token = localStorage.getItem("token");
        const authHeaders: Record<string, string> = {};
        if (token) {
          authHeaders["Authorization"] = `Bearer ${token}`;
        }
        const url = `https://localhost:7057/api/Staff/${selectedStaff.id}`;
        const response = await fetch(url, {
          method: "PUT",
          headers: authHeaders,
          body: form,
        });
        const responseText = await response.text();
        let apiResponse: any = {};
        try {
          apiResponse = JSON.parse(responseText);
        } catch {
          apiResponse = { error: responseText };
        }
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            );
          }
          const errorMsg = buildErrorMsg(
            apiResponse,
            `Lỗi khi cập nhật nhân viên (HTTP ${response.status}).`
          );
          Swal.fire("Lỗi khi cập nhật nhân viên", errorMsg, "error");
          throw new Error(errorMsg);
        }
        if (apiResponse.success) {
          setError(null);
          Swal.fire({
            title: "Thành công",
            text: "Đã cập nhật nhân viên",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            fetchStaffs();
            closeModal();
          });
        } else {
          const errorMsg = buildErrorMsg(
            apiResponse,
            `Lỗi khi cập nhật nhân viên.`
          );
          Swal.fire("Lỗi khi cập nhật nhân viên", errorMsg, "error");
          throw new Error(errorMsg);
        }
      } catch (err: any) {
        const errorMessage = err.message || `Lỗi khi lưu thông tin nhân viên.`;
        setError(errorMessage);
        Swal.fire("Lỗi khi cập nhật nhân viên", errorMessage, "error");
        closeModal();
      }
    } else {
      // Thêm mới: gửi multipart/form-data lên /api/Register
      if (!formData.password) {
        Swal.fire("Vui lòng nhập mật khẩu", "", "error");
        return;
      }
      const form = new FormData();
      form.append("RoleName", "Staff");
      form.append("Name", formData.name);
      form.append("Phone", formData.phone);
      form.append("Email", formData.email);
      form.append("Password", formData.password);
      form.append("ConfirmPassword", formData.password); // FE không có confirm riêng nên dùng lại password
      if (formData.dob) form.append("Dob", formData.dob);
      if (formData.imageFile) form.append("ImageFile", formData.imageFile);
      if (formData.facilityId)
        form.append("FacId", String(formData.facilityId));
      if (formData.startTime) form.append("StartTime", formData.startTime);
      if (formData.endTime) form.append("EndTime", formData.endTime);
      try {
        const token = localStorage.getItem("token");
        const authHeaders: Record<string, string> = {};
        if (token) {
          authHeaders["Authorization"] = `Bearer ${token}`;
        }
        const url = "https://localhost:7057/api/Register";
        const response = await fetch(url, {
          method: "POST",
          headers: authHeaders,
          body: form,
        });
        const responseText = await response.text();
        let apiResponse = {};
        try {
          apiResponse = JSON.parse(responseText);
        } catch {
          apiResponse = { error: responseText };
        }
        console.log("[DEBUG] API /api/Register status:", response.status);
        console.log("[DEBUG] API /api/Register response:", apiResponse);
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            );
          }
          const errorMsg = buildErrorMsg(
            apiResponse,
            `Lỗi khi thêm nhân viên (HTTP ${response.status}).`
          );
          Swal.fire("Lỗi khi thêm nhân viên", errorMsg, "error");
          return; // Không đóng modal, chỉ báo lỗi
        }
        // Nếu response.ok (status 200), luôn coi là thành công
        setError(null); // Ẩn thông báo lỗi nếu có
        Swal.fire({
          title: "Thành công",
          text: "Đã thêm nhân viên mới",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          fetchStaffs();
          closeModal();
        });
      } catch (err: any) {
        const errorMessage = err.message || `Lỗi khi lưu thông tin nhân viên.`;
        setError(errorMessage);
        Swal.fire("Lỗi khi thêm nhân viên", errorMessage, "error");
        closeModal();
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "facilityId" ? Number(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      imageFile: file,
      image: file ? URL.createObjectURL(file) : prev.image,
    }));
  };

  // Handle multiple facility selection
  const handleFacilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, facilityId: Number(e.target.value) }));
  };

  const closeModal = () => {
    setSelectedStaff(null);
    setFormData({
      name: "",
      phone: "",
      dob: "",
      image: "",
      imageFile: null,
      startTime: "",
      endTime: "",
      email: "",
      password: "",
      status: "Active",
      facilityId: null,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="flex min-h-[calc(100vh-64px)]">
        <div className="fixed top-16 left-0 w-64 h-[calc(100vh-64px)] bg-white shadow-md z-20">
          <Sidebar />
        </div>

        <main className="flex-1 ml-64 max-w-8xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Quản lý nhân viên</h2>
            <button
              onClick={() => {
                setSelectedStaff(null);
                setFormData({
                  name: "",
                  phone: "",
                  dob: "",
                  image: "",
                  imageFile: null,
                  startTime: "",
                  endTime: "",
                  email: "",
                  password: "",
                  status: "Active",
                  facilityId: null,
                });
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <FiPlus /> Thêm nhân viên
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={fetchStaffs}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Thử lại
              </button>
            </div>
          )}
          <div className="flex items-center mb-6 bg-white border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-400 transition-all duration-200 h-12">
            <span className="flex items-center justify-center h-full pl-4 pr-2">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ display: "block" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, SĐT, ID cơ sở hoặc tên cơ sở..."
              className="flex-1 bg-transparent border-none outline-none h-full px-2 text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ minHeight: "2.5rem" }}
            />
          </div>

          <div className="overflow-x-auto border rounded-md">
            <table className="min-w-full bg-white divide-y divide-gray-200 text-sm">
              <thead className="bg-green-200 text-black-700 text-left">
                <tr>
                  <th className="p-3">Ảnh</th>
                  <th className="p-3">Tên</th>
                  <th className="p-3">SĐT</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Giờ bắt đầu</th>
                  <th className="p-3">Cơ sở</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center text-gray-500 py-6">
                      Đang tải...
                    </td>
                  </tr>
                ) : paginatedStaffs.length > 0 ? (
                  paginatedStaffs.map((staff) => (
                    <tr key={staff.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        <img
                          src={staff.image}
                          alt={staff.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </td>
                      <td className="p-3 font-medium">{staff.name}</td>
                      <td className="p-3">{staff.phone}</td>
                      <td className="p-3">{staff.email}</td>
                      <td className="p-3">
                        {staff.startTime
                          ? new Date(staff.startTime).toLocaleString("vi-VN")
                          : ""}
                      </td>
                      <td className="p-3">{staff.facilityNames.join(", ")}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-white ${
                            staff.status === "Active"
                              ? "bg-green-600"
                              : staff.status === "Inactive"
                              ? "bg-red-600"
                              : "bg-gray-500"
                          }`}
                        >
                          {staff.status === "Active"
                            ? "Hoạt động"
                            : staff.status === "Inactive"
                            ? "Không hoạt động"
                            : staff.status}
                        </span>
                      </td>
                      <td className="p-3 space-x-2 flex items-center">
                        <button
                          onClick={() => handleEdit(staff)}
                          className="text-green-600 hover:text-green-800"
                          title="Chỉnh sửa"
                        >
                          <FiEdit size={18} />
                        </button>
                        {/* <button
                          onClick={() => toggleStatus(staff.id)}
                          className={`${
                            staff.status === "Active"
                              ? "text-red-600 hover:text-red-800"
                              : "text-blue-600 hover:text-blue-800"
                          }`}
                          title={
                            staff.status === "Active"
                              ? "Chuyển thành Không hoạt động"
                              : "Kích hoạt lại nhân viên"
                          }
                        >
                          {staff.status === "Active" ? (
                            <FiSlash size={18} />
                          ) : (
                            <FiCheckCircle size={18} />
                          )}
                        </button> */}
                        <button
                          onClick={() => deleteStaff(staff.id, staff.name)}
                          className="text-red-600 hover:text-red-800"
                          title="Xóa nhân viên"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center text-gray-500 py-6">
                      Không có nhân viên nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* Pagination controls - beautiful modern UI */}
            <div className="mt-4 rounded-xl border bg-white shadow flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium">Hiển thị</span>
                <select
                  className="border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition outline-none"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  {[5, 10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span className="text-gray-700">nhân viên/trang</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="px-3 py-1 rounded-lg border border-gray-300 bg-gray-100 hover:bg-blue-100 text-gray-700 font-semibold transition disabled:opacity-50"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  Đầu
                </button>
                <button
                  className="px-3 py-1 rounded-lg border border-gray-300 bg-gray-100 hover:bg-blue-100 text-gray-700 font-semibold transition disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </button>
                <span className="mx-2 text-gray-700">
                  Trang <b className="text-blue-700">{currentPage}</b> /{" "}
                  <b>{totalPages}</b>
                </span>
                <button
                  className="px-3 py-1 rounded-lg border border-gray-300 bg-gray-100 hover:bg-blue-100 text-gray-700 font-semibold transition disabled:opacity-50"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Sau
                </button>
                <button
                  className="px-3 py-1 rounded-lg border border-gray-300 bg-gray-100 hover:bg-blue-100 text-gray-700 font-semibold transition disabled:opacity-50"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Cuối
                </button>
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Tổng: <b className="text-blue-700">{totalRows}</b> nhân viên
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-all">
          <div className="relative w-full max-w-lg mx-2 animate-fadeInUp">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100">
                <h3 className="text-xl font-bold text-blue-800">
                  {selectedStaff ? "Cập nhật nhân viên" : "Thêm nhân viên"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-blue-700 transition-colors"
                  title="Đóng"
                >
                  <FiX size={22} />
                </button>
              </div>
              {/* Body */}
              <div className="px-6 py-6 bg-white overflow-y-auto flex-1">
                <form className="grid grid-cols-2 gap-5 text-sm">
                  <div className="flex flex-col col-span-2 sm:col-span-1">
                    <label className="mb-1 font-semibold text-gray-700">
                      Tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Nhập tên nhân viên"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                      maxLength={100}
                      required
                    />
                  </div>
                  <div className="flex flex-col col-span-2 sm:col-span-1">
                    <label className="mb-1 font-semibold text-gray-700">
                      SĐT <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="phone"
                      placeholder="Nhập số điện thoại"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                      maxLength={20}
                      minLength={10}
                      required
                    />
                  </div>
                  <div className="flex flex-col col-span-2 sm:col-span-1">
                    <label className="mb-1 font-semibold text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Nhập email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                      required
                    />
                  </div>
                  {/* Only show password field when adding new staff */}
                  {!selectedStaff && (
                    <div className="flex flex-col col-span-2 sm:col-span-1">
                      <label className="mb-1 font-semibold text-gray-700">
                        Mật khẩu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        placeholder="Nhập mật khẩu"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                        required
                      />
                    </div>
                  )}
                  <div className="flex flex-col col-span-2 sm:col-span-1">
                    <label className="mb-1 font-semibold text-gray-700">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      name="dob"
                      placeholder="Ngày sinh"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col col-span-2 sm:col-span-1">
                    <label className="mb-1 font-semibold text-gray-700">
                      Ngày bắt đầu làm việc
                    </label>
                    <input
                      type="date"
                      name="startTime"
                      placeholder="Ngày bắt đầu làm việc"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col col-span-2 sm:col-span-1">
                    <label className="mb-1 font-semibold text-gray-700">
                      Ngày kết thúc làm việc
                    </label>
                    <input
                      type="date"
                      name="endTime"
                      placeholder="Ngày kết thúc làm việc"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                    />
                  </div>
                  {/* Image upload: file input cho cả thêm và sửa */}
                  <div className="flex flex-col col-span-2">
                    <label className="mb-1 font-semibold text-gray-700">
                      Ảnh đại diện
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Chọn file ảnh (không bắt buộc)
                    </p>
                    {(formData.imageFile || formData.image) && (
                      <img
                        src={
                          formData.imageFile
                            ? URL.createObjectURL(formData.imageFile)
                            : formData.image
                        }
                        alt="Preview"
                        className="mt-3 w-24 h-24 object-cover rounded-lg shadow border border-gray-200"
                      />
                    )}
                  </div>
                  <div className="flex flex-col col-span-2">
                    <label className="mb-1 font-semibold text-gray-700">
                      Cơ sở <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="facilityId"
                      value={formData.facilityId ?? ""}
                      onChange={handleFacilityChange}
                      className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                      title="Chọn cơ sở làm việc"
                      required
                    >
                      <option value="" disabled>
                        Chọn cơ sở
                      </option>
                      {facilities.map((facility) => (
                        <option key={facility.id} value={facility.id}>
                          {facility.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <label className="mb-1 font-semibold text-gray-700">
                      Trạng thái
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                      title="Chọn trạng thái hoạt động"
                    >
                      <option value="Active">Hoạt động</option>
                      <option value="Inactive">Không hoạt động</option>
                    </select>
                  </div>
                </form>
              </div>
              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-100 transition-colors font-medium shadow-sm"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManager;
