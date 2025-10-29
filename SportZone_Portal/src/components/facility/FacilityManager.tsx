/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useEffect,
  useState,
  useRef,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Sidebar from "../../Sidebar";

type Field = {
  field_id: number;
  fac_id: number;
  category_id: number;
  field_name: string;
  description: string;
  is_booking_enable: boolean;
  price: number;
};

type Service = {
  service_id: number;
  fac_id: number;
  service_name: string;
  price: number;
  status: string;
  image: string;
  description: string;
};

type Facility = {
  fac_id: number;
  userId: number;
  name: string;
  open_time: string;
  close_time: string;
  address: string;
  description: string;
  subdescription?: string;
  imageUrls: string[];
  fields: Field[];
  services: Service[];
};

type ApiFacility = {
  facId: number;
  userId: number;
  name: string;
  openTime: string;
  closeTime: string;
  address: string;
  description: string;
  subdescription: string;
  imageUrls: string[];
  categoryFields: {
    categoryFieldId: number;
    categoryFieldName: string;
  }[];
};

const FacilityManager: React.FC = () => {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [facilityToDelete, setFacilityToDelete] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<
    Omit<Facility, "fac_id" | "fields" | "services"> & { imageUrls: string[] }
  >({
    userId: 0,
    name: "",
    open_time: "08:00",
    close_time: "17:00",
    address: "",
    description: "",
    subdescription: "",
    imageUrls: [],
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: type,
      title: message,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
  };

  // Function to get full image URL
  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) {
      return "https://co-nhan-tao.com/wp-content/uploads/2020/03/san-co-nhan-tao-1-1024x768.jpg";
    }

    // If it's already a full URL, return as is
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    // If it's a relative path, prepend the server URL
    const baseUrl = "https://localhost:7057";
    const cleanPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
    const fullUrl = `${baseUrl}${cleanPath}`;

    console.log("Image URL conversion:", imageUrl, "->", fullUrl);
    return fullUrl;
  };

  const fetchFacilities = async (searchText: string = "") => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Không tìm thấy token xác thực. Vui lòng đăng nhập.", "error");
      setError("Yêu cầu xác thực");
      setIsLoading(false);
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.UId) {
      showToast(
        "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.",
        "error"
      );
      setError("Thông tin người dùng không hợp lệ");
      setIsLoading(false);
      return;
    }

    // Kiểm tra role = 2 (Field Owner)
    if (user.RoleId !== 2) {
      showToast(
        "Bạn không có quyền truy cập trang quản lý cơ sở. Chỉ Field Owner mới có thể sử dụng tính năng này.",
        "error"
      );
      setError("Không có quyền truy cập");
      setIsLoading(false);
      return;
    }

    // Use the new API endpoint that returns complete data with facId
    const baseUrl = `https://localhost:7057/api/Facility/with-details`;
    const url = searchText
      ? `${baseUrl}?searchText=${encodeURIComponent(searchText)}`
      : baseUrl;

    console.log("API URL:", url);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || `Lỗi HTTP ${response.status}`);
      }

      const apiData: ApiFacility[] = await response.json();
      console.log("API Response:", apiData);

      // Filter facilities by current user
      const userFacilities = apiData.filter((fac) => fac.userId === user.UId);
      console.log("User facilities:", userFacilities);

      const mappedData: Facility[] = userFacilities.map((fac) => ({
        fac_id: fac.facId,
        userId: fac.userId,
        name: fac.name,
        open_time: fac.openTime.slice(0, 5),
        close_time: fac.closeTime.slice(0, 5),
        address: fac.address,
        description: fac.description,
        subdescription: fac.subdescription,
        imageUrls: fac.imageUrls || [],
        fields: [],
        services: [],
      }));

      console.log("Mapped facilities:", mappedData);

      setFacilities(mappedData);
      setFilteredFacilities(mappedData);
    } catch (err) {
      showToast("Không thể lấy danh sách cơ sở. Vui lòng thử lại.", "error");
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Kiểm tra quyền truy cập ngay khi component mount
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.RoleId !== 2) {
      showToast(
        "Bạn không có quyền truy cập trang quản lý cơ sở. Chỉ Field Owner mới có thể sử dụng tính năng này.",
        "error"
      );
      setError(
        "Không có quyền truy cập - Chỉ Field Owner (role = 2) mới có thể truy cập trang này"
      );
      setIsLoading(false);
      return;
    }

    fetchFacilities();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log("handleImageChange called");
    const files = Array.from(e.target.files || []);
    console.log("Selected files:", files);

    if (files.length > 0) {
      setSelectedImages((prev) => {
        console.log("Previous selected images:", prev);
        return [...prev, ...files];
      });

      // Create preview URLs for new files
      const newPreviews = files.map((file) => {
        const previewUrl = URL.createObjectURL(file);
        console.log("Created preview URL:", previewUrl, "for file:", file.name);
        return previewUrl;
      });

      setImagePreviews((prev) => {
        console.log("Previous image previews:", prev);
        return [...prev, ...newPreviews];
      });
      console.log("Added new previews:", newPreviews);
    } else {
      console.log("No files selected");
    }
  };

  const removeImage = (index: number) => {
    const newSelectedImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    // Revoke the URL to free memory only if it's a blob URL (newly selected image)
    if (imagePreviews[index] && imagePreviews[index].startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviews[index]);
    }

    setSelectedImages(newSelectedImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Không tìm thấy token xác thực. Vui lòng đăng nhập.", "error");
      setError("Yêu cầu xác thực");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // Kiểm tra role = 2 (Field Owner)
    if (user.RoleId !== 2) {
      showToast(
        "Bạn không có quyền thực hiện hành động này. Chỉ Field Owner mới có thể tạo/chỉnh sửa cơ sở.",
        "error"
      );
      return;
    }

    // Convert time format if needed (from 12-hour to 24-hour format)
    const convertTo24Hour = (time12h: string) => {
      if (!time12h.includes("AM") && !time12h.includes("PM")) {
        return time12h; // Already in 24-hour format
      }

      const [time, modifier] = time12h.split(" ");
      let [hours] = time.split(":");
      const [, minutes] = time.split(":");

      if (hours === "12") {
        hours = "00";
      }

      if (modifier === "PM" && hours !== "00") {
        hours = (parseInt(hours, 10) + 12).toString();
      }

      return `${hours.padStart(2, "0")}:${minutes}`;
    };

    // Create FormData instead of JSON payload
    const formDataPayload = new FormData();
    formDataPayload.append("UserId", (user?.UId || 0).toString());
    formDataPayload.append("Name", formData.name.trim());
    formDataPayload.append("OpenTime", convertTo24Hour(formData.open_time));
    formDataPayload.append("CloseTime", convertTo24Hour(formData.close_time));
    formDataPayload.append("Address", formData.address.trim());
    formDataPayload.append("Description", formData.description.trim());
    formDataPayload.append(
      "Subdescription",
      formData.subdescription?.trim() || ""
    );

    // Add selected image files with correct parameter name for backend
    selectedImages.forEach((file) => {
      if (editId !== null) {
        // For UPDATE: use NewImages parameter
        formDataPayload.append(`NewImages`, file);
      } else {
        // For CREATE: use Images parameter
        formDataPayload.append(`Images`, file);
      }
    });

    // For update, handle image data very carefully to avoid Entity tracking conflicts
    let hasImageChanges = false;
    if (editId !== null) {
      const existingUrls = imagePreviews.filter(
        (url) => !url.startsWith("blob:")
      );

      console.log("Original existing URLs from imagePreviews:", existingUrls);

      // Check if there are new images being added
      const hasNewImages = selectedImages.length > 0;

      // Find the original facility to compare image URLs
      const originalFacility = facilities.find((f) => f.fac_id === editId);
      const originalImageUrls = originalFacility?.imageUrls || [];

      // Check if existing images have been removed
      const hasRemovedImages =
        originalImageUrls.length !== existingUrls.length ||
        !originalImageUrls.every((url) => existingUrls.includes(url));

      console.log("Has new images:", hasNewImages);
      console.log("Has removed images:", hasRemovedImages);
      console.log("Original image URLs:", originalImageUrls);
      console.log("Current existing URLs:", existingUrls);

      hasImageChanges = hasNewImages || hasRemovedImages;

      console.log("Image changes detected:", hasImageChanges);
    }

    // Use different request approach when no image changes to avoid Entity tracking
    // Always use FormData as backend only accepts multipart/form-data
    console.log(
      "Using FormData payload - backend only accepts multipart/form-data"
    );

    // Create a fresh FormData for the request
    const finalFormData = new FormData();
    finalFormData.append("UserId", (user?.UId || 0).toString());
    finalFormData.append("Name", formData.name.trim());
    finalFormData.append("OpenTime", convertTo24Hour(formData.open_time));
    finalFormData.append("CloseTime", convertTo24Hour(formData.close_time));
    finalFormData.append("Address", formData.address.trim());
    finalFormData.append("Description", formData.description.trim());
    finalFormData.append(
      "Subdescription",
      formData.subdescription?.trim() || ""
    );

    // Handle image data based on operation type
    if (editId !== null) {
      // For updates - always send image data to maintain consistency
      console.log("Adding image data to FormData for update");

      // Add new images if any
      if (selectedImages.length > 0) {
        selectedImages.forEach((file) => {
          finalFormData.append(`NewImages`, file);
        });
      }

      // Always add existing URLs for updates
      const existingUrls = imagePreviews.filter(
        (url) => !url.startsWith("blob:")
      );
      existingUrls.forEach((url, index) => {
        if (url && url.trim() !== "") {
          finalFormData.append(`ExistingImageUrls[${index}]`, url.trim());
        }
      });
    } else {
      // For creates, add new images
      selectedImages.forEach((file) => {
        finalFormData.append(`Images`, file);
      });
    }

    const requestPayload = finalFormData;
    const requestHeaders = {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type for FormData, let browser set it with boundary
    };

    console.log("Request payload type: FormData (required by backend)");
    console.log("FormData being sent:");
    for (const [key, value] of finalFormData.entries()) {
      console.log(key, value);
    }

    try {
      // Use the standard endpoint - backend only has one endpoint for updates
      const baseUrl =
        editId !== null
          ? `https://localhost:7057/api/Facility/${editId}`
          : "https://localhost:7057/api/Facility";

      const response = await fetch(baseUrl, {
        method: editId !== null ? "PUT" : "POST",
        headers: requestHeaders,
        body: requestPayload,
      });

      console.log("Mã trạng thái HTTP:", response.status);

      if (response.status === 204) {
        // Xử lý trường hợp 204 No Content (không có body)
        const mappedFacility: Facility = {
          fac_id: editId || facilities.length + 1,
          userId: user?.UId || 0,
          name: formData.name,
          open_time: convertTo24Hour(formData.open_time).slice(0, 5),
          close_time: convertTo24Hour(formData.close_time).slice(0, 5),
          address: formData.address,
          description: formData.description,
          subdescription: formData.subdescription,
          imageUrls: formData.imageUrls || [],
          fields: [],
          services: [],
        };

        if (editId !== null) {
          setFacilities((prev) =>
            prev.map((f) => (f.fac_id === editId ? mappedFacility : f))
          );
          setFilteredFacilities((prev) =>
            prev.map((f) => (f.fac_id === editId ? mappedFacility : f))
          );
          showToast("Cập nhật cơ sở thành công!");
        } else {
          setFacilities((prev) => [...prev, mappedFacility]);
          setFilteredFacilities((prev) => [...prev, mappedFacility]);
          showToast("Thêm cơ sở thành công!");
        }
        resetForm();

        // Refresh facilities to get updated image URLs from server
        setTimeout(() => {
          fetchFacilities();
        }, 500);
        return;
      }

      const responseData = await response.json();
      console.log("Phản hồi từ server:", responseData); // Ghi log để kiểm tra cấu trúc

      // Log validation errors if they exist
      if (responseData.errors) {
        console.log("Validation errors:", responseData.errors);
        const errorMessages = Object.entries(responseData.errors)
          .map(
            ([field, messages]) =>
              `${field}: ${
                Array.isArray(messages) ? messages.join(", ") : messages
              }`
          )
          .join("\n");
        showToast(`Lỗi xác thực:\n${errorMessages}`, "error");
        return;
      }

      if (response.ok) {
        // Lấy đối tượng facility từ responseData.data (hoặc responseData.Data)
        const updatedFacility: ApiFacility =
          responseData.data || responseData.Data || responseData;

        // Kiểm tra dữ liệu hợp lệ
        if (!updatedFacility || !updatedFacility.name) {
          showToast("Dữ liệu từ server không hợp lệ.", "error");
          return;
        }

        console.log("Cơ sở đã cập nhật:", updatedFacility); // Ghi log để kiểm tra dữ liệu đã cập nhật

        const mappedFacility: Facility = {
          fac_id: editId || facilities.length + 1,
          userId: updatedFacility.userId,
          name: updatedFacility.name,
          open_time: updatedFacility.openTime.slice(0, 5),
          close_time: updatedFacility.closeTime.slice(0, 5),
          address: updatedFacility.address,
          description: updatedFacility.description,
          subdescription: updatedFacility.subdescription,
          imageUrls: updatedFacility.imageUrls || [],
          fields: [],
          services: [],
        };

        if (editId !== null) {
          setFacilities((prev) =>
            prev.map((f) => (f.fac_id === editId ? mappedFacility : f))
          );
          setFilteredFacilities((prev) =>
            prev.map((f) => (f.fac_id === editId ? mappedFacility : f))
          );
          showToast("Cập nhật cơ sở thành công!");
        } else {
          setFacilities((prev) => [...prev, mappedFacility]);
          setFilteredFacilities((prev) => [...prev, mappedFacility]);
          showToast("Thêm cơ sở thành công!");
        }
        resetForm();

        // Refresh facilities to get updated image URLs from server
        setTimeout(() => {
          fetchFacilities();
        }, 500);
      } else {
        const errorMessage =
          responseData.message ||
          responseData.Message ||
          `Lỗi HTTP ${response.status}`;
        showToast(`Lỗi: ${errorMessage}`, "error");
      }
    } catch (err) {
      console.error("Lỗi trong handleSubmit:", err); // Ghi log lỗi chi tiết
      showToast("Không thể xử lý yêu cầu. Vui lòng thử lại.", "error");
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    }
  };
  const handleEdit = (id: number) => {
    const target = facilities.find((f) => f.fac_id === id);
    if (target) {
      const { fac_id: _, fields: __, services: ___, ...rest } = target;
      setFormData(rest);

      // Set existing images as previews for edit mode
      // Store the original URLs exactly as received from API
      setSelectedImages([]);
      setImagePreviews(target.imageUrls || []);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setEditId(id);
      setShowModal(true);
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Không tìm thấy token xác thực. Vui lòng đăng nhập.", "error");
      setError("Yêu cầu xác thực");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // Kiểm tra role = 2 (Field Owner)
    if (user.RoleId !== 2) {
      showToast(
        "Bạn không có quyền thực hiện hành động này. Chỉ Field Owner mới có thể xóa cơ sở.",
        "error"
      );
      return;
    }

    try {
      const response = await fetch(
        `https://localhost:7057/api/Facility/${facilityToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Delete facility error:", response.status, errorText);

        if (response.status === 401) {
          showToast(
            "Không được phép truy cập. Vui lòng đăng nhập lại.",
            "error"
          );
          setError("Không được phép truy cập");
          return;
        } else if (response.status === 403) {
          showToast("Bạn không có quyền thực hiện hành động này.", "error");
          setError("Bị cấm");
          return;
        } else if (response.status === 400) {
          // Parse error message from backend
          let errorMessage = "Không thể xóa cơ sở";
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.title || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
          showToast(errorMessage, "error");
          setError(errorMessage);
          return;
        }
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }

      // ✅ Cập nhật state của facility
      setFacilities((prev) =>
        prev.filter((f) => f.fac_id !== facilityToDelete)
      );
      setFilteredFacilities((prev) =>
        prev.filter((f) => f.fac_id !== facilityToDelete)
      );
      showToast("Xóa cơ sở thành công!", "success");

      // ✅ Cập nhật localStorage["user"]
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);

        // Xóa facility khỏi user.FieldOwner.facilities
        if (user.FieldOwner && Array.isArray(user.FieldOwner.facilities)) {
          user.FieldOwner.facilities = user.FieldOwner.facilities.filter(
            (fac: any) => fac.facId !== facilityToDelete
          );
        }

        // Ghi lại vào localStorage
        localStorage.setItem("user", JSON.stringify(user));
      }

      // ✅ Cập nhật pagination nếu cần
      const totalPages = Math.ceil(filteredFacilities.length / pageSize);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }

      // ✅ Đóng modal và reset ID
      setShowDeleteModal(false);
      setFacilityToDelete(null);
    } catch (err) {
      showToast("Không thể xóa cơ sở. Vui lòng thử lại.", "error");
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    }
  };

  const handleViewDetails = async (facility: Facility) => {
    console.log("handleViewDetails called with facility:", facility);
    console.log("facility.fac_id:", facility.fac_id);

    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Không tìm thấy token xác thực. Vui lòng đăng nhập.", "error");
      setError("Yêu cầu xác thực");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // Kiểm tra role = 2 (Field Owner)
    if (user.RoleId !== 2) {
      showToast(
        "Bạn không có quyền xem chi tiết cơ sở. Chỉ Field Owner mới có thể sử dụng tính năng này.",
        "error"
      );
      return;
    }

    try {
      const response = await fetch(
        `https://localhost:7057/api/Facility/${facility.fac_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        // const errorText = await response.text(); // Consume response but don't use
        if (response.status === 401) {
          showToast(
            "Không được phép truy cập. Vui lòng đăng nhập lại.",
            "error"
          );
          setError("Không được phép truy cập");
          return;
        } else if (response.status === 403) {
          showToast("Bạn không có quyền truy cập cơ sở này.", "error");
          setError("Bị cấm");
          return;
        }
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }

      const apiFacility: ApiFacility = await response.json();
      const mappedFacility: Facility = {
        fac_id: facility.fac_id,
        userId: apiFacility.userId,
        name: apiFacility.name,
        open_time: apiFacility.openTime.slice(0, 5),
        close_time: apiFacility.closeTime.slice(0, 5),
        address: apiFacility.address,
        description: apiFacility.description,
        subdescription: apiFacility.subdescription,
        imageUrls: apiFacility.imageUrls || [],
        fields: [],
        services: [],
      };

      navigate(`/facility/${facility.fac_id}`, {
        state: { facility: mappedFacility },
      });
      console.log("Navigating to:", `/facility/${facility.fac_id}`);
    } catch (err) {
      showToast("Không thể lấy chi tiết cơ sở. Vui lòng thử lại.", "error");
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    }
  };

  const resetForm = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setFormData({
      userId: user?.UId || 0,
      name: "",
      open_time: "08:00",
      close_time: "17:00",
      address: "",
      description: "",
      subdescription: "",
      imageUrls: [],
    });

    // Clean up image previews - only revoke blob URLs
    imagePreviews.forEach((preview) => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    });
    setSelectedImages([]);
    setImagePreviews([]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setEditId(null);
    setShowModal(false);
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setSearchKeyword(searchTerm);
    setCurrentPage(1);
    fetchFacilities(searchTerm);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToNextPage = () => {
    const totalPages = Math.ceil(filteredFacilities.length / pageSize);
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const changePageSize = (e: ChangeEvent<HTMLSelectElement>) => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleCloseModal = () => {
    console.log("handleCloseModal called");
    setShowModal(false);
    setShowDeleteModal(false);
    setSelectedService(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "Escape" &&
        (showModal || showDeleteModal || selectedService)
      ) {
        handleCloseModal();
      }
    };
    document.addEventListener(
      "keydown",
      handleKeyDown as unknown as EventListener
    );
    return () =>
      document.removeEventListener(
        "keydown",
        handleKeyDown as unknown as EventListener
      );
  }, [showModal, showDeleteModal, selectedService]);

  // Cleanup image previews on component unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  const totalPages = Math.ceil(filteredFacilities.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredFacilities.length);
  const currentFacilities = filteredFacilities.slice(startIndex, endIndex);

  useEffect(() => {
    console.log("Danh sách cơ sở hiện tại:", currentFacilities);
  }, [currentFacilities]);

  const renderPaginationNumbers = () => {
    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    if (startPage > 1) {
      pageNumbers.push(
        <button
          key={1}
          className="relative inline-flex items-center px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-all duration-200"
          onClick={() => goToPage(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pageNumbers.push(
          <span
            key="ellipsis-start"
            className="relative inline-flex items-center px-4 py-2 bg-white text-sm font-medium text-gray-400"
          >
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 ${
            i === currentPage
              ? "z-10 bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-green-50 hover:text-green-600"
          }`}
          onClick={() => goToPage(i)}
          disabled={i === currentPage}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <span
            key="ellipsis-end"
            className="relative inline-flex items-center px-4 py-2 bg-white text-sm font-medium text-gray-400"
          >
            ...
          </span>
        );
      }
      pageNumbers.push(
        <button
          key={totalPages}
          className="relative inline-flex items-center px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-all duration-200"
          onClick={() => goToPage(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <>
      <Sidebar />
      <div className="min-h-screen flex flex-col pl-64">
        <header className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-xl shadow-lg">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    Quản lý Cơ sở
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Quản lý và theo dõi các cơ sở thể thao của bạn
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="search-input"
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 block w-80 shadow-sm transition-all duration-200 hover:shadow-md"
                    placeholder="Tìm kiếm cơ sở theo tên, địa chỉ..."
                    value={searchKeyword}
                    onChange={handleSearch}
                  />
                </div>
                <button
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-0.5"
                  onClick={() => {
                    const user = JSON.parse(
                      localStorage.getItem("user") || "{}"
                    );

                    // Kiểm tra role = 2 (Field Owner)
                    if (user.RoleId !== 2) {
                      showToast(
                        "Bạn không có quyền tạo cơ sở mới. Chỉ Field Owner mới có thể sử dụng tính năng này.",
                        "error"
                      );
                      return;
                    }

                    setEditId(null);
                    setFormData({
                      userId: user?.UId || 0,
                      name: "",
                      open_time: "08:00",
                      close_time: "17:00",
                      address: "",
                      description: "",
                      subdescription: "",
                      imageUrls: [],
                    });

                    // Reset image selection
                    setSelectedImages([]);
                    setImagePreviews([]);

                    // Reset file input
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }

                    setShowModal(true);
                  }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="font-medium">Thêm cơ sở mới</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 sm:px-8 lg:px-10 py-8">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <span className="text-lg text-gray-600 font-medium">
                    Đang tải dữ liệu...
                  </span>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
                  <svg
                    className="w-12 h-12 text-red-500 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    Có lỗi xảy ra
                  </h3>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-green-200 to-green-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <span className="whitespace-nowrap">STT</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                              </svg>
                              <span className="whitespace-nowrap">
                                Tên cơ sở
                              </span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="whitespace-nowrap">
                                Hình ảnh
                              </span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="whitespace-nowrap">
                                Giờ hoạt động
                              </span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              <span className="whitespace-nowrap">Địa chỉ</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <span className="whitespace-nowrap">Mô tả</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                                />
                              </svg>
                              <span className="whitespace-nowrap">
                                Thao tác
                              </span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {currentFacilities.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-16 text-center">
                              <div className="flex flex-col items-center justify-center space-y-4">
                                <svg
                                  className="w-16 h-16 text-gray-300"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                  />
                                </svg>
                                <div className="text-center">
                                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Chưa có cơ sở nào
                                  </h3>
                                  <p className="text-gray-500 mb-4">
                                    Bắt đầu bằng cách tạo cơ sở đầu tiên của bạn
                                  </p>
                                  <button
                                    onClick={() => {
                                      const user = JSON.parse(
                                        localStorage.getItem("user") || "{}"
                                      );
                                      if (user.RoleId !== 2) {
                                        showToast(
                                          "Bạn không có quyền tạo cơ sở mới.",
                                          "error"
                                        );
                                        return;
                                      }
                                      setEditId(null);
                                      setFormData({
                                        userId: user?.UId || 0,
                                        name: "",
                                        open_time: "08:00",
                                        close_time: "17:00",
                                        address: "",
                                        description: "",
                                        subdescription: "",
                                        imageUrls: [],
                                      });

                                      // Reset image selection
                                      setSelectedImages([]);
                                      setImagePreviews([]);

                                      // Reset file input
                                      if (fileInputRef.current) {
                                        fileInputRef.current.value = "";
                                      }

                                      setShowModal(true);
                                    }}
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
                                  >
                                    Tạo cơ sở đầu tiên
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          currentFacilities.map((fac, index) => (
                            <tr
                              key={fac.fac_id}
                              onDoubleClick={() => handleViewDetails(fac)}
                              className="cursor-pointer hover:bg-green-50 transition-colors duration-150 group"
                            >
                              <td className="px-6 py-6 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                    {startIndex + index + 1}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-6 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div>
                                    <div className="text-sm font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                                      {fac.name || "-"}
                                    </div>
                                    {/* <div className="text-xs text-gray-500 mt-1">
                                      ID: {fac.fac_id}
                                    </div> */}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-6 whitespace-nowrap">
                                <div className="flex items-center">
                                  <img
                                    src={getImageUrl(fac.imageUrls?.[0])}
                                    alt="Cơ sở"
                                    className="h-16 w-16 object-cover rounded-xl shadow-md border-2 border-gray-200 group-hover:border-green-300 transition-all duration-200"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.src =
                                        "https://co-nhan-tao.com/wp-content/uploads/2020/03/san-co-nhan-tao-1-1024x768.jpg";
                                    }}
                                  />
                                </div>
                              </td>
                              <td className="px-6 py-6 ">
                                <div className="flex items-center space-x-2">
                                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                                    {fac.open_time || "-"}
                                  </div>
                                  <span className="text-gray-400">-</span>
                                  <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                                    {fac.close_time || "-"}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-6">
                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                  {fac.address || "-"}
                                </div>
                              </td>
                              <td className="px-6 py-6">
                                <div className="text-sm text-gray-600 max-w-xs">
                                  <div className="truncate">
                                    {fac.description || "-"}
                                  </div>
                                  {fac.subdescription && (
                                    <div className="text-xs text-gray-400 truncate mt-1">
                                      {fac.subdescription}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-6 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <button
                                    className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:shadow-md"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEdit(fac.fac_id);
                                    }}
                                    title="Chỉnh sửa cơ sở"
                                    aria-label="Chỉnh sửa cơ sở"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:shadow-md"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFacilityToDelete(fac.fac_id);
                                      setShowDeleteModal(true);
                                    }}
                                    title="Xóa cơ sở"
                                    aria-label="Xóa cơ sở"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:shadow-md"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewDetails(fac);
                                    }}
                                    title="Xem cơ sở"
                                    aria-label="Xem cơ sở"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200 rounded-b-2xl shadow-lg">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap transition-all duration-200 ${
                        currentPage === 1
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:shadow-md"
                      }`}
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Trước
                    </button>
                    <div className="text-sm text-gray-700 py-2 flex items-center">
                      <span className="font-medium">{currentPage}</span>
                      <span className="mx-2 text-gray-400">/</span>
                      <span className="font-medium">{totalPages}</span>
                    </div>
                    <button
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap transition-all duration-200 ${
                        currentPage === totalPages || totalPages === 0
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:shadow-md"
                      }`}
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      Sau
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl border border-green-200">
                        <p className="text-sm font-medium">
                          Hiển thị{" "}
                          <span className="font-bold">
                            {filteredFacilities.length > 0 ? startIndex + 1 : 0}
                          </span>{" "}
                          đến <span className="font-bold">{endIndex}</span> của{" "}
                          <span className="font-bold">
                            {filteredFacilities.length}
                          </span>{" "}
                          kết quả
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <label
                          htmlFor="page-size"
                          className="text-sm text-gray-700 font-medium"
                        >
                          Hiển thị:
                        </label>
                        <select
                          id="page-size"
                          className="border border-gray-300 rounded-xl text-sm px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
                          value={pageSize}
                          onChange={changePageSize}
                        >
                          <option value="10">10</option>
                          <option value="20">20</option>
                          <option value="50">50</option>
                        </select>
                      </div>
                      <nav
                        className="relative z-0 inline-flex rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                        aria-label="Phân trang"
                      >
                        <button
                          className={`relative inline-flex items-center px-3 py-2 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all duration-200 ${
                            currentPage === 1
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:text-gray-700"
                          }`}
                          onClick={goToPrevPage}
                          disabled={currentPage === 1}
                        >
                          <span className="sr-only">Trang trước</span>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>
                        <div className="flex border-l border-r border-gray-200">
                          {renderPaginationNumbers()}
                        </div>
                        <button
                          className={`relative inline-flex items-center px-3 py-2 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all duration-200 ${
                            currentPage === totalPages || totalPages === 0
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:text-gray-700"
                          }`}
                          onClick={goToNextPage}
                          disabled={
                            currentPage === totalPages || totalPages === 0
                          }
                        >
                          <span className="sr-only">Trang sau</span>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>

        {showModal && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <div className="flex items-center justify-center min-h-screen px-4 py-8">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
              </div>
              <div
                className="relative bg-white rounded-2xl shadow-2xl transform transition-all w-full max-w-2xl border border-gray-200 max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white bg-opacity-20 p-2 rounded-xl">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        {editId !== null ? "Chỉnh sửa cơ sở" : "Thêm cơ sở mới"}
                      </h3>
                    </div>
                    <button
                      onClick={handleCloseModal}
                      className="text-white hover:text-gray-200 transition-colors"
                      title="Close"
                      aria-label="Close"
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

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <form
                    id="facility-form"
                    className="space-y-6"
                    onSubmit={handleSubmit}
                  >
                    <input
                      type="hidden"
                      id="facility-id"
                      value={editId || ""}
                    />
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-bold text-gray-700 mb-2"
                      >
                        <span className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <span>Tên cơ sở</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-all duration-200"
                        placeholder="Nhập tên cơ sở thể thao..."
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="open_time"
                          className="block text-sm font-bold text-gray-700 mb-2"
                        >
                          <span className="flex items-center space-x-2">
                            <svg
                              className="w-4 h-4 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>Giờ mở cửa</span>
                          </span>
                        </label>
                        <input
                          type="time"
                          id="open_time"
                          className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
                          value={formData.open_time}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="close_time"
                          className="block text-sm font-bold text-gray-700 mb-2"
                        >
                          <span className="flex items-center space-x-2">
                            <svg
                              className="w-4 h-4 text-red-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>Giờ đóng cửa</span>
                          </span>
                        </label>
                        <input
                          type="time"
                          id="close_time"
                          className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
                          value={formData.close_time}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-bold text-gray-700 mb-2"
                      >
                        <span className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span>Địa chỉ</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        id="address"
                        className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
                        placeholder="Nhập địa chỉ cơ sở..."
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-bold text-gray-700 mb-2"
                      >
                        <span className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span>Mô tả</span>
                        </span>
                      </label>
                      <textarea
                        id="description"
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 resize-none"
                        placeholder="Mô tả về cơ sở thể thao..."
                        value={formData.description}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="subdescription"
                        className="block text-sm font-bold text-gray-700 mb-2"
                      >
                        <span className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                            />
                          </svg>
                          <span>Mô tả phụ (tùy chọn)</span>
                        </span>
                      </label>
                      <textarea
                        id="subdescription"
                        rows={2}
                        className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 resize-none"
                        placeholder="Thông tin bổ sung..."
                        value={formData.subdescription || ""}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="images"
                        className="block text-sm font-bold text-gray-700 mb-2"
                      >
                        <span className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>Hình ảnh cơ sở</span>
                        </span>
                      </label>

                      {/* File Input */}
                      <div className="mt-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          id="images"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                        <label
                          htmlFor="images"
                          className="cursor-pointer inline-flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 text-sm font-medium text-gray-600 hover:text-purple-600"
                        >
                          <svg
                            className="w-6 h-6 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          Chọn hình ảnh (có thể chọn nhiều)
                        </label>
                      </div>

                      {/* Image Previews */}
                      {imagePreviews.length > 0 && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Ảnh đã chọn ({imagePreviews.length})
                              </p>
                              {editId !== null && (
                                <p className="text-xs text-gray-500 mt-1">
                                  <span className="inline-block w-3 h-3 bg-blue-500 rounded mr-1"></span>
                                  Có sẵn: ảnh hiện tại sẽ được giữ lại
                                  <br />
                                  <span className="inline-block w-3 h-3 bg-green-500 rounded mr-1"></span>
                                  Mới: ảnh mới sẽ được thêm vào
                                  <br />
                                  <span className="text-red-500">×</span> Nhấn
                                  để xóa ảnh khỏi danh sách
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                // Clear only blob URLs (newly selected images)
                                imagePreviews.forEach((preview) => {
                                  if (preview.startsWith("blob:")) {
                                    URL.revokeObjectURL(preview);
                                  }
                                });
                                setSelectedImages([]);
                                setImagePreviews([]);
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = "";
                                }
                                // If editing, reset formData.imageUrls as well
                                if (editId !== null) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    imageUrls: [],
                                  }));
                                }
                              }}
                              className="text-xs text-red-600 hover:text-red-800 underline"
                            >
                              Xóa tất cả
                            </button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {imagePreviews.map((preview, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-purple-300 transition-all duration-200">
                                  <img
                                    src={
                                      preview.startsWith("blob:")
                                        ? preview
                                        : getImageUrl(preview)
                                    }
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.src = getImageUrl(undefined);
                                    }}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors duration-200 shadow-lg"
                                  title="Xóa ảnh"
                                >
                                  ×
                                </button>
                                <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                  {index + 1}
                                </div>
                                {/* Show indicator for existing vs new images */}
                                {!preview.startsWith("blob:") ? (
                                  <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                    Có sẵn
                                  </div>
                                ) : (
                                  <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                    Mới
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </form>
                </div>

                {/* Fixed Footer */}
                <div className="flex-shrink-0 bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-2xl border-t border-gray-200">
                  <button
                    type="button"
                    className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md"
                    onClick={handleCloseModal}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    form="facility-form"
                    className="px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-lg"
                  >
                    {editId !== null ? "Cập nhật" : "Tạo mới"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
              </div>
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div
                className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white px-6 py-6">
                  <div className="flex items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-red-100 sm:mx-0">
                      <svg
                        className="w-8 h-8 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                    <div className="mt-0 ml-4 text-left">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Xác nhận xóa cơ sở
                      </h3>
                      <div className="mt-2">
                        <p className="text-gray-600 leading-relaxed">
                          Bạn có chắc chắn muốn xóa cơ sở này không?
                          <span className="block mt-2 text-sm text-red-600 font-medium">
                            ⚠️ Hành động này không thể hoàn tác và sẽ xóa tất cả
                            dữ liệu liên quan.
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-2xl">
                  <button
                    type="button"
                    className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md"
                    onClick={handleCloseModal}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 hover:shadow-lg"
                    onClick={handleDelete}
                  >
                    Xóa cơ sở
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedService && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
              </div>
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div
                className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white bg-opacity-20 p-2 rounded-xl">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        Chi tiết dịch vụ
                      </h3>
                    </div>
                    <button
                      onClick={handleCloseModal}
                      className="text-white hover:text-gray-200 transition-colors"
                      title="Close modal"
                      aria-label="Close modal"
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
                <div className="bg-white px-6 py-6">
                  <div className="space-y-6">
                    <div className="text-center">
                      <img
                        src={
                          selectedService.image ||
                          "https://co-nhan-tao.com/wp-content/uploads/2020/03/san-co-nhan-tao-1-1024x768.jpg"
                        }
                        alt="Dịch vụ"
                        className="h-32 w-32 object-cover rounded-2xl mx-auto shadow-lg border-4 border-gray-200"
                      />
                      <h4 className="text-xl font-bold text-gray-900 mt-4">
                        {selectedService.service_name}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                          </svg>
                          <span className="text-sm font-bold text-blue-800">
                            ID Dịch vụ
                          </span>
                        </div>
                        <p className="text-blue-900 font-medium">
                          #{selectedService.service_id}
                        </p>
                      </div>

                      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                          </svg>
                          <span className="text-sm font-bold text-green-800">
                            Giá dịch vụ
                          </span>
                        </div>
                        <p className="text-green-900 font-bold text-lg">
                          {selectedService.price.toLocaleString()} VND
                        </p>
                      </div>

                      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg
                            className="w-5 h-5 text-yellow-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-sm font-bold text-yellow-800">
                            Trạng thái
                          </span>
                        </div>
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                            selectedService.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {selectedService.status}
                        </span>
                      </div>

                      <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg
                            className="w-5 h-5 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span className="text-sm font-bold text-purple-800">
                            Mô tả
                          </span>
                        </div>
                        <p className="text-purple-900 leading-relaxed">
                          {selectedService.description || "Không có mô tả"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-b-2xl">
                  <button
                    type="button"
                    className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md"
                    onClick={handleCloseModal}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FacilityManager;
