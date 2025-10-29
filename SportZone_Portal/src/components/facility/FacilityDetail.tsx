/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiClock,
  FiEdit,
  FiEye,
  FiMapPin,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../Sidebar";
import Swal from "sweetalert2";

type Field = {
  fieldId: number;
  facId: number;
  facilityAddress: string;
  categoryId: number;
  categoryName: string;
  fieldName: string;
  description: string;
  isBookingEnable: boolean;
};

type Service = {
  serviceId: number;
  facId: number;
  serviceName: string;
  price: number;
  status: string;
  image?: string;
  description: string;
  facilityAddress: string;
};

type Discount = {
  discountId: number;
  facId: number;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  description: string;
  isActive: boolean;
  quantity: number;
};
type Image = {
  imgId: number;
  facId: number;
  imageUrl: string;
};

type Facility = {
  name: string;
  facId: number;
  openTime: string;
  closeTime: string;
  address: string;
  description: string;
  subdescription?: string;
  picture?: string;
  fields: Field[];
  services: Service[];
  discounts: Discount[];
  images: Image[];
};

type EditField = {
  fieldName?: string;
  categoryId?: number;
  description?: string;
  isBookingEnable?: boolean;
};

type EditService = {
  serviceName: string;
  price: number;
  status: string;
  imageFile: File | null;
  description: string;
  facilityAddress: string;
  removeImage?: boolean;
};

type EditDiscount = {
  discountPercentage: number;
  startDate: string;
  endDate: string;
  description: string;
  isActive: boolean;
  quantity: number;
  fac: {
    name: string;
    address: string;
  };
};

type Category = {
  categoryId: number;
  categoryName: string;
};

const API_URL = "https://localhost:7057";

const FacilityDetail: React.FC = () => {
  const { facId } = useParams<{ facId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [activeTab, setActiveTab] = useState<string>("fields");
  const [fields, setFields] = useState<Field[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [filteredDiscounts, setFilteredDiscounts] = useState<Discount[]>([]);
  const [fieldFilter, setFieldFilter] = useState<string>("");
  const [serviceFilter, setServiceFilter] = useState<string>("");
  const [discountFilter, setDiscountFilter] = useState<string>("");
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(
    null
  );
  const [editField, setEditField] = useState<Field | null>(null);
  const [editService, setEditService] = useState<Service | null>(null);
  const [editDiscount, setEditDiscount] = useState<Discount | null>(null);
  const [fieldFormData, setFieldFormData] = useState<EditField | null>(null);
  const [serviceFormData, setServiceFormData] = useState<EditService | null>(
    null
  );
  const [discountFormData, setDiscountFormData] = useState<EditDiscount | null>(
    null
  );
  const [isAddFieldModalOpen, setIsAddFieldModalOpen] =
    useState<boolean>(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] =
    useState<boolean>(false);
  const [isAddDiscountModalOpen, setIsAddDiscountModalOpen] =
    useState<boolean>(false);
  const [newFieldFormData, setNewFieldFormData] = useState<EditField>({
    categoryId: 1,
    fieldName: "",
    description: "",
    isBookingEnable: true,
  });
  const [newServiceFormData, setNewServiceFormData] = useState<EditService>({
    serviceName: "",
    price: 0,
    status: "Active",
    imageFile: null,
    description: "",
    facilityAddress: "",
  });
  const [newDiscountFormData, setNewDiscountFormData] = useState<EditDiscount>({
    discountPercentage: 0,
    startDate: "",
    endDate: "",
    description: "",
    isActive: true,
    quantity: 1,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState<boolean>(false);

  const showToast = (message: string, type: "success" | "error") => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: type,
      title: message,
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", () => Swal.stopTimer());
        toast.addEventListener("mouseleave", () => Swal.resumeTimer());
      },
    });
  };

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  };

  // Function to validate and decode JWT token
  const validateToken = (): boolean => {
    const token = localStorage.getItem("token");
    if (!token) {
      return false;
    }

    try {
      // Decode JWT payload (base64 decode the middle part)
      const payload = JSON.parse(atob(token.split(".")[1]));

      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  // Function to get full image URL
  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) {
      const defaultUrl =
        "https://w7.pngwing.com/pngs/395/283/png-transparent-empty-set-null-set-null-sign-mathematics-mathematics-angle-logo-number.png";
      return defaultUrl;
    }

    // If it's already a full URL, return as is
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    // If it's a relative path, prepend the server URL
    const baseUrl = "https://localhost:7057";
    const fullUrl = `${baseUrl}${
      imageUrl.startsWith("/") ? "" : "/"
    }${imageUrl}`;
    return fullUrl;
  };

  const fetchFacility = useCallback(async () => {
    try {
      // Use the new API endpoint that returns complete data with imageUrls
      const response = await fetch(`${API_URL}/api/Facility/with-details`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Lỗi HTTP: ${response.status} - ${errorText || response.statusText}`
        );
      }

      const allFacilities = await response.json();

      // Find the specific facility by facId
      const apiFacility = allFacilities.find(
        (fac: any) => fac.facId === Number(facId)
      );

      if (!apiFacility) {
        throw new Error("Không tìm thấy cơ sở với ID này");
      }

      const mappedFacility: Facility = {
        name: apiFacility.name || "Unknown",
        facId: Number(facId),
        openTime: apiFacility.openTime?.slice(0, 5) || "00:00",
        closeTime: apiFacility.closeTime?.slice(0, 5) || "00:00",
        address: apiFacility.address || "Unknown",
        description: apiFacility.description || "No description",
        subdescription: apiFacility.subdescription,
        picture: getImageUrl(apiFacility.imageUrls?.[0]),
        fields: [],
        services: [],
        discounts: [],
        images:
          apiFacility.imageUrls?.map((url: string, index: number) => ({
            imgId: index + 1,
            facId: Number(facId),
            imageUrl: getImageUrl(url),
          })) || [],
      };

      setFacility(mappedFacility);
      // Don't reset fields and services here - let them be loaded separately
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Lỗi không xác định khi lấy chi tiết cơ sở";
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [facId]);

  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/Service/facility/${facId}`, {
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

      if (result.success && Array.isArray(result.data)) {
        const mappedServices: Service[] = result.data.map((service: any) => ({
          serviceId: service.serviceId,
          facId: service.facId,
          serviceName: service.serviceName || "Unknown",
          price: service.price || 0,
          status: service.status || "Inactive",
          image: getImageUrl(service.image) || getImageUrl(undefined),
          description: service.description || "",
          facilityAddress:
            service.facilityAddress || facility?.address || "Unknown",
        }));
        setServices(mappedServices);
        setFilteredServices(mappedServices);
      } else {
        setServices([]);
        setFilteredServices([]);
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
      setServices([]);
      setFilteredServices([]);
      showToast(errorMessage, "error");
    }
  }, [facId, facility?.address]);

  const fetchDiscounts = useCallback(async () => {
    try {
      console.log("=== FETCH DISCOUNTS DEBUG ===");
      console.log("API URL:", `${API_URL}/api/Discount/facility/${facId}`);
      console.log("facId:", facId);
      console.log("Headers:", getAuthHeaders());

      const response = await fetch(
        `${API_URL}/api/Discount/facility/${facId}`,
        {
          headers: getAuthHeaders(),
        }
      );

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response text:", errorText);
        throw new Error(
          `Lỗi khi lấy danh sách mã giảm giá: ${response.status} - ${
            errorText || response.statusText
          }`
        );
      }

      const result = await response.json();
      console.log("Fetch discounts response:", result);
      console.log("Response type:", typeof result);
      console.log("Is array:", Array.isArray(result));

      // Handle different response formats
      let discountData = [];

      if (Array.isArray(result)) {
        // If response is directly an array
        discountData = result;
        console.log("Direct array response");
      } else if (result.success && Array.isArray(result.data)) {
        // If response has success wrapper
        discountData = result.data;
        console.log("Wrapped success response");
      } else if (result.data && Array.isArray(result.data)) {
        // If response has data wrapper without success field
        discountData = result.data;
        console.log("Data wrapper response");
      } else {
        console.log("Unknown response format:", result);
        discountData = [];
      }

      console.log("Extracted discount data:", discountData);

      if (discountData.length > 0) {
        const mappedDiscounts: Discount[] = discountData.map(
          (discount: any) => ({
            discountId: discount.discountId,
            facId: discount.facId,
            discountPercentage: discount.discountPercentage || 0,
            startDate: discount.startDate || "",
            endDate: discount.endDate || "",
            description: discount.description || "",
            isActive: discount.isActive || false,
            quantity: discount.quantity || 0,
          })
        );
        console.log("Mapped discounts:", mappedDiscounts);
        setDiscounts(mappedDiscounts);
        setFilteredDiscounts(mappedDiscounts);
      } else {
        console.log("No discounts found or empty response");
        setDiscounts([]);
        setFilteredDiscounts([]);
        // Don't show error toast if it's just empty data
        if (!Array.isArray(result) && result.message) {
          showToast(result.message, "error");
        }
      }
    } catch (err) {
      console.error("Fetch discounts error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Lỗi không xác định khi lấy danh sách mã giảm giá";
      setDiscounts([]);
      setFilteredDiscounts([]);
      showToast(errorMessage, "error");
    }
  }, [facId]);

  /*
  // Get discount by ID (commented out as not currently used)
  const fetchDiscountById = useCallback(async (discountId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/Discount/${discountId}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Lỗi khi lấy chi tiết mã giảm giá: ${response.status}`);
      }

      const result = await response.json();
      return result.success ? result.data : null;
    } catch (err) {
      console.error("Error fetching discount by ID:", err);
      return null;
    }
  }, []);
  */

  // Get all active discounts for facility (commented out as not currently used)
  /*
  const fetchActiveDiscounts = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/Discount/active/facility/${facId}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Lỗi khi lấy mã giảm giá đang hoạt động: ${response.status}`);
      }

      const result = await response.json();
      return result.success && Array.isArray(result.data) ? result.data : [];
    } catch (err) {
      console.error("Error fetching active discounts:", err);
      return [];
    }
  }, [facId]);
  */

  // Get discounts by status (active/inactive)
  const fetchDiscountsByStatus = useCallback(
    async (isActive: boolean): Promise<Discount[]> => {
      try {
        const response = await fetch(
          `${API_URL}/api/Discount/status/${isActive}`,
          {
            method: "GET",
            headers: getAuthHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch discounts by status: ${response.status}`
          );
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(
            result.message || "Failed to fetch discounts by status"
          );
        }

        return result.data.map((discount: any) => ({
          discountId: discount.discountId,
          facId: discount.facId,
          discountPercentage: discount.discountPercentage || 0,
          startDate: discount.startDate || "",
          endDate: discount.endDate || "",
          description: discount.description || "",
          isActive: discount.isActive || false,
          quantity: discount.quantity || 0,
        }));
      } catch (error) {
        console.error("Error fetching discounts by status:", error);
        throw error;
      }
    },
    []
  );

  // Search discounts by text
  const searchDiscounts = useCallback(async (searchText: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/Discount/search/${encodeURIComponent(searchText)}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Lỗi khi tìm kiếm mã giảm giá: ${response.status}`);
      }

      const result = await response.json();
      return result.success && Array.isArray(result.data) ? result.data : [];
    } catch (err) {
      console.error("Error searching discounts:", err);
      return [];
    }
  }, []);

  const fetchFields = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/Field/facility/${facId}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Lỗi khi lấy danh sách sân: ${response.status} - ${
            errorText || response.statusText
          }`
        );
      }

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setFields(result.data);
        setFilteredFields(result.data);
      } else {
        setFields([]);
        setFilteredFields([]);
        showToast(result.message || "Không thể lấy danh sách sân.", "error");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Lỗi không xác định khi lấy danh sách sân";
      setFields([]);
      setFilteredFields([]);
      showToast(errorMessage, "error");
    }
  }, [facId]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/CategoryField`, {
        method: "GET",
        headers: {
          accept: "*/*",
          ...getAuthHeaders(),
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Lỗi khi lấy danh sách danh mục: ${response.status} - ${
            errorText || response.statusText
          }`
        );
      }

      const result = await response.json();

      // The API returns an array directly, not wrapped in a result object
      if (Array.isArray(result)) {
        const mappedCategories: Category[] = result.map((item: any) => ({
          categoryId: item.categoryFieldId,
          categoryName: item.categoryFieldName,
        }));
        setCategories(mappedCategories);
      } else {
        showToast("Định dạng dữ liệu danh mục không hợp lệ.", "error");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Lỗi không xác định khi lấy danh sách danh mục";
      showToast(errorMessage, "error");
    }
  }, []);

  // Carousel navigation functions - moved before useEffect to avoid initialization error
  const nextImage = useCallback(() => {
    if (facility?.images && facility.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === facility.images.length - 1 ? 0 : prev + 1
      );
    }
  }, [facility?.images]);

  const prevImage = useCallback(() => {
    if (facility?.images && facility.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? facility.images.length - 1 : prev - 1
      );
    }
  }, [facility?.images]);

  const goToImage = useCallback((index: number) => {
    setCurrentImageIndex(index);
  }, []);

  // Load categories immediately as they don't depend on facId
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    console.log("useEffect triggered with facId:", facId);
    if (facId) {
      setLoading(true);

      // Check if we have state data first
      const stateFacility = location.state?.facility as Facility | undefined;
      if (stateFacility && stateFacility.facId === Number(facId)) {
        console.log("Using state facility data:", stateFacility);
        setFacility(stateFacility);
        setFields(stateFacility.fields || []);
        setFilteredFields(stateFacility.fields || []);
        setServices(stateFacility.services || []);
        setFilteredServices(stateFacility.services || []);
        setDiscounts(stateFacility.discounts || []);
        setFilteredDiscounts(stateFacility.discounts || []);
        setLoading(false);

        // Still fetch fresh data in background but don't clear existing data
        Promise.all([
          fetchFields(),
          fetchServices(),
          fetchDiscounts(),
          fetchCategories(),
        ]).catch((err) => {
          console.error("Background fetch error:", err);
        });
        return;
      }

      // If no state data, fetch from API
      const fetchAllData = async () => {
        try {
          await fetchFacility();
          await Promise.all([
            fetchFields(),
            fetchServices(),
            fetchDiscounts(),
            fetchCategories(),
          ]);
          console.log("All API calls completed successfully");
        } catch (err) {
          console.error("Error in fetchAllData:", err);
          showToast("Lỗi khi tải dữ liệu. Vui lòng thử lại.", "error");
        } finally {
          setLoading(false);
        }
      };

      fetchAllData();
    } else {
      setLoading(false);
      showToast("Không có facId được cung cấp.", "error");
    }
  }, [
    facId,
    fetchCategories,
    fetchFacility,
    fetchFields,
    fetchServices,
    fetchDiscounts,
    location.state?.facility,
  ]);

  // Reset carousel index when facility changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [facility?.facId]);

  // Keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (facility?.images && facility.images.length > 1) {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          prevImage();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          nextImage();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [facility?.images, prevImage, nextImage]);

  // Auto-play carousel (optional)
  useEffect(() => {
    if (facility?.images && facility.images.length > 1 && !isCarouselPaused) {
      const interval = setInterval(() => {
        nextImage();
      }, 5000); // Change image every 5 seconds

      return () => clearInterval(interval);
    }
  }, [facility?.images, isCarouselPaused, nextImage]);

  useEffect(() => {
    const lowerCaseFilter = fieldFilter.toLowerCase();
    setFilteredFields(
      fields.filter(
        (field) =>
          field.fieldName.toLowerCase().includes(lowerCaseFilter) ||
          field.description.toLowerCase().includes(lowerCaseFilter) ||
          field.categoryName.toLowerCase().includes(lowerCaseFilter)
      )
    );
  }, [fieldFilter, fields]);

  useEffect(() => {
    const lowerCaseFilter = serviceFilter.toLowerCase();
    setFilteredServices(
      services.filter(
        (service) =>
          service.serviceName.toLowerCase().includes(lowerCaseFilter) ||
          service.description.toLowerCase().includes(lowerCaseFilter) ||
          service.status.toLowerCase().includes(lowerCaseFilter)
      )
    );
  }, [serviceFilter, services]);

  useEffect(() => {
    const performDiscountFilter = async () => {
      // Handle status filter
      if (discountFilter.startsWith("status:")) {
        const status = discountFilter.replace("status:", "");
        const isActive = status === "active";
        try {
          const statusResults = await fetchDiscountsByStatus(isActive);
          // Filter status results to only show discounts from current facility
          const facilityDiscounts = statusResults.filter(
            (discount: Discount) => discount.facId === Number(facId)
          );
          setFilteredDiscounts(facilityDiscounts);
        } catch (error) {
          console.error("Error fetching discounts by status:", error);
          // Fallback to client-side filtering
          setFilteredDiscounts(
            discounts.filter((discount) => discount.isActive === isActive)
          );
        }
        return;
      }

      const lowerCaseFilter = discountFilter.toLowerCase().trim();

      // If filter is empty, show all discounts
      if (!lowerCaseFilter) {
        setFilteredDiscounts(discounts);
        return;
      }

      // If filter is long enough (3+ characters), use server-side search
      if (lowerCaseFilter.length >= 3) {
        try {
          const searchResults = await searchDiscounts(lowerCaseFilter);
          // Filter search results to only show discounts from current facility
          const facilityDiscounts = searchResults.filter(
            (discount: any) => discount.facId === Number(facId)
          );
          const mappedResults: Discount[] = facilityDiscounts.map(
            (discount: any) => ({
              discountId: discount.discountId,
              facId: discount.facId,
              discountPercentage: discount.discountPercentage || 0,
              startDate: discount.startDate || "",
              endDate: discount.endDate || "",
              description: discount.description || "",
              isActive: discount.isActive || false,
              quantity: discount.quantity || 0,
            })
          );
          setFilteredDiscounts(mappedResults);
        } catch (error) {
          console.error("Error searching discounts:", error);
          // Fallback to client-side filtering
          setFilteredDiscounts(
            discounts.filter(
              (discount) =>
                discount.description.toLowerCase().includes(lowerCaseFilter) ||
                discount.discountPercentage
                  .toString()
                  .includes(lowerCaseFilter) ||
                (discount.isActive ? "hoạt động" : "không hoạt động").includes(
                  lowerCaseFilter
                )
            )
          );
        }
      } else {
        // Use client-side filtering for short queries
        setFilteredDiscounts(
          discounts.filter(
            (discount) =>
              discount.description.toLowerCase().includes(lowerCaseFilter) ||
              discount.discountPercentage
                .toString()
                .includes(lowerCaseFilter) ||
              (discount.isActive ? "hoạt động" : "không hoạt động").includes(
                lowerCaseFilter
              )
          )
        );
      }
    };

    performDiscountFilter();
  }, [
    discountFilter,
    discounts,
    searchDiscounts,
    fetchDiscountsByStatus,
    facId,
  ]);

  // Debug logs for fields and services changes
  useEffect(() => {
    console.log("Fields state changed:", fields);
    console.log("Filtered fields:", filteredFields);
  }, [fields, filteredFields]);

  useEffect(() => {
    console.log("Services state changed:", services);
    console.log("Filtered services:", filteredServices);
  }, [services, filteredServices]);

  const handleDeleteField = async (fieldId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sân này?")) {
      setIsSubmitting(true);
      try {
        const response = await fetch(`${API_URL}/api/Field/${fieldId}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          const result = await response.json();
          console.error("Delete field API error:", response.status, result);
          throw new Error(
            result.message ||
              `Lỗi khi xóa sân: ${response.status} - ${
                result.message || response.statusText
              }`
          );
        }

        setFields((prev) => prev.filter((f) => f.fieldId !== fieldId));
        setFilteredFields((prev) => prev.filter((f) => f.fieldId !== fieldId));
        showToast("Xóa sân thành công!", "success");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Lỗi không xác định khi xóa sân";
        showToast(errorMessage, "error");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) {
      setIsSubmitting(true);
      try {
        const response = await fetch(
          `${API_URL}/api/Service/DeleteService/${serviceId}`,
          {
            method: "DELETE",
            headers: getAuthHeaders(),
          }
        );

        if (!response.ok) {
          const result = await response.json();
          console.error("Delete service API error:", response.status, result);
          throw new Error(
            result.message ||
              `Lỗi khi xóa dịch vụ: ${response.status} - ${
                result.message || response.statusText
              }`
          );
        }

        setServices((prev) => prev.filter((s) => s.serviceId !== serviceId));
        setFilteredServices((prev) =>
          prev.filter((s) => s.serviceId !== serviceId)
        );
        showToast("Xóa dịch vụ thành công!", "success");
        fetchServices();
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Lỗi không xác định khi xóa dịch vụ";
        showToast(errorMessage, "error");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEditField = (field: Field) => {
    setEditField(field);
    setFieldFormData({
      fieldName: field.fieldName,
      categoryId: field.categoryId,
      description: field.description,
      isBookingEnable: field.isBookingEnable,
    });
  };

  const handleEditService = (service: Service) => {
    setEditService(service);
    setServiceFormData({
      serviceName: service.serviceName,
      price: service.price,
      status: service.status,
      imageFile: null,
      description: service.description,
      facilityAddress: service.facilityAddress,
      removeImage: false,
    });
  };

  const handleDeleteDiscount = async (discountId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) {
      setIsSubmitting(true);
      try {
        const response = await fetch(`${API_URL}/api/Discount/${discountId}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          const result = await response.json();
          console.error("Delete discount API error:", response.status, result);
          throw new Error(
            result.message ||
              `Lỗi khi xóa mã giảm giá: ${response.status} - ${
                result.message || response.statusText
              }`
          );
        }

        setDiscounts((prev) => prev.filter((d) => d.discountId !== discountId));
        setFilteredDiscounts((prev) =>
          prev.filter((d) => d.discountId !== discountId)
        );
        showToast("Xóa mã giảm giá thành công!", "success");
        fetchDiscounts();
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Lỗi không xác định khi xóa mã giảm giá";
        showToast(errorMessage, "error");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEditDiscount = (discount: Discount) => {
    setEditDiscount(discount);
    setDiscountFormData({
      discountPercentage: discount.discountPercentage,
      startDate: discount.startDate,
      endDate: discount.endDate,
      description: discount.description,
      isActive: discount.isActive,
      quantity: discount.quantity,
    });
  };

  const handleSaveFieldEdit = async () => {
    if (editField && fieldFormData) {
      if (!fieldFormData.fieldName || !fieldFormData.categoryId) {
        showToast("Tên sân và loại sân là bắt buộc!", "error");
        return;
      }
      setIsSubmitting(true);
      try {
        const response = await fetch(
          `${API_URL}/api/Field/${editField.fieldId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fieldName: fieldFormData.fieldName,
              categoryId: fieldFormData.categoryId,
              description: fieldFormData.description,
              isBookingEnable: fieldFormData.isBookingEnable ?? true,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          console.error("Update field API error:", response.status, result);
          throw new Error(
            result.message ||
              `Lỗi khi cập nhật sân: ${response.status} - ${
                result.message || response.statusText
              }`
          );
        }

        if (result.success) {
          const updatedField: Field = {
            fieldId: editField.fieldId,
            facId: editField.facId,
            facilityAddress: editField.facilityAddress,
            categoryId: fieldFormData.categoryId || editField.categoryId,
            categoryName:
              categories.find((c) => c.categoryId === fieldFormData.categoryId)
                ?.categoryName || editField.categoryName,
            fieldName: fieldFormData.fieldName || editField.fieldName,
            description: fieldFormData.description || editField.description,
            isBookingEnable:
              fieldFormData.isBookingEnable || editField.isBookingEnable,
          };

          setFields((prev) =>
            prev.map((f) =>
              f.fieldId === editField.fieldId ? updatedField : f
            )
          );
          setFilteredFields((prev) =>
            prev.map((f) =>
              f.fieldId === editField.fieldId ? updatedField : f
            )
          );
          setEditField(null);
          setFieldFormData(null);
          showToast("Cập nhật sân thành công!", "success");
        } else {
          showToast(result.message || "Không thể cập nhật sân.", "error");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Lỗi không xác định khi cập nhật sân";
        showToast(errorMessage, "error");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSaveServiceEdit = async () => {
    if (editService && serviceFormData) {
      if (!serviceFormData.serviceName || serviceFormData.price <= 0) {
        showToast("Tên dịch vụ và giá là bắt buộc!", "error");
        return;
      }

      // Check user role and token
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      console.log("User info for service edit:", {
        userId: user.UId,
        roleId: user.RoleId,
      });
      console.log("Token available:", !!token);

      if (!token) {
        showToast(
          "Không tìm thấy token xác thực. Vui lòng đăng nhập lại.",
          "error"
        );
        return;
      }

      if (user.RoleId !== 2) {
        showToast(
          "Bạn không có quyền cập nhật dịch vụ. Chỉ Field Owner mới có thể sử dụng tính năng này.",
          "error"
        );
        return;
      }

      setIsSubmitting(true);
      try {
        const formData = new FormData();
        formData.append("FacId", editService.facId.toString());
        formData.append("ServiceName", serviceFormData.serviceName);
        formData.append("Price", serviceFormData.price.toString());
        formData.append("Status", serviceFormData.status);
        formData.append("Description", serviceFormData.description);

        if (serviceFormData.imageFile) {
          // Uploading new image
          formData.append("ImageFile", serviceFormData.imageFile);
          formData.append("RemoveImage", "false");
          console.log("Uploading new image file");
        } else if (serviceFormData.removeImage) {
          // Remove existing image
          formData.append("RemoveImage", "true");
          console.log("Removing image - sending RemoveImage=true");
        } else {
          // Keep existing image
          formData.append("RemoveImage", "false");
          console.log("Keeping existing image - no ImageFile sent");
        }

        console.log("FormData contents for update:");
        for (const [key, value] of formData.entries()) {
          if (value instanceof File || value instanceof Blob) {
            console.log(
              `${key}:`,
              `File: ${value.name || "unnamed"} (${value.size} bytes) type: ${
                value.type
              }`
            );
          } else {
            console.log(`${key}:`, value);
          }
        }

        const response = await fetch(
          `${API_URL}/api/Service/UpdateService/${editService.serviceId}`,
          {
            method: "PUT",
            headers: getAuthHeaders(),
            body: formData,
          }
        );

        console.log("Update service response status:", response.status);
        console.log(
          "Update service response headers:",
          Object.fromEntries(response.headers.entries())
        );

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status} - ${response.statusText}`;

          // Check if response has JSON content
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            try {
              const result = await response.json();
              console.error(
                "Update service API error:",
                response.status,
                result
              );
              errorMessage = result.message || result.Message || errorMessage;
            } catch (jsonError) {
              console.error(
                "Failed to parse error response as JSON:",
                jsonError
              );
            }
          } else {
            // If not JSON, get text content for debugging
            const textContent = await response.text();
            console.error(
              "Update service non-JSON error response:",
              textContent
            );
          }

          throw new Error(`Lỗi khi cập nhật dịch vụ: ${errorMessage}`);
        }

        // Check if success response has JSON content
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.warn(
            "Success response is not JSON, treating as success without data"
          );
          // Refresh services to get updated list
          await fetchServices();
          setEditService(null);
          setServiceFormData(null);
          showToast("Cập nhật dịch vụ thành công!", "success");
          return;
        }

        const updatedService = await response.json();
        const mappedService: Service = {
          serviceId: updatedService.serviceId,
          facId: updatedService.facId,
          serviceName: updatedService.serviceName || "Unknown",
          price: updatedService.price || 0,
          status: updatedService.status || "Inactive",
          image: getImageUrl(updatedService.image) || getImageUrl(undefined),
          description: updatedService.description || "",
          facilityAddress:
            updatedService.facilityAddress || facility?.address || "Unknown",
        };

        setServices((prev) =>
          prev.map((s) =>
            s.serviceId === editService.serviceId ? mappedService : s
          )
        );
        setFilteredServices((prev) =>
          prev.map((s) =>
            s.serviceId === editService.serviceId ? mappedService : s
          )
        );
        setEditService(null);
        setServiceFormData(null);
        showToast("Cập nhật dịch vụ thành công!", "success");
        await fetchServices();
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Lỗi không xác định khi cập nhật dịch vụ";
        showToast(errorMessage, "error");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleAddField = async () => {
    if (
      !newFieldFormData.fieldName ||
      (newFieldFormData.categoryId ?? 0) <= 0
    ) {
      showToast("Tên sân và loại sân là bắt buộc!", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const requestBody = {
        fieldName: newFieldFormData.fieldName,
        facId: Number(facId),
        categoryId: newFieldFormData.categoryId,
        description: newFieldFormData.description,
        isBookingEnable: newFieldFormData.isBookingEnable ?? true,
      };

      console.log("Request body for Create-Field:", requestBody);
      console.log("API URL:", `${API_URL}/api/Field/Create-Field`);

      const response = await fetch(`${API_URL}/api/Field/Create-Field`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const result = await response.json();
        console.error("Add field API error:", response.status, result);
        throw new Error(
          result.message ||
            `Lỗi khi thêm sân: ${response.status} - ${
              result.message || response.statusText
            }`
        );
      }

      await fetchFields();
      setIsAddFieldModalOpen(false);
      setNewFieldFormData({
        categoryId: 1,
        fieldName: "",
        description: "",
        isBookingEnable: true,
      });
      showToast("Thêm sân thành công!", "success");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi không xác định khi thêm sân";
      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddService = async () => {
    if (!newServiceFormData.serviceName || newServiceFormData.price <= 0) {
      showToast("Tên dịch vụ và giá là bắt buộc!", "error");
      return;
    }

    // Validate token first
    if (!validateToken()) {
      showToast(
        "Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
        "error"
      );
      return;
    }

    // Check user role and token với thông tin chi tiết
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    console.log("=== TOKEN DEBUG INFO ===");
    console.log("Token exists:", !!token);
    console.log("Token length:", token ? token.length : 0);
    console.log(
      "Token preview:",
      token ? token.substring(0, 50) + "..." : "null"
    );
    console.log("User string from localStorage:", userStr);

    if (!token) {
      showToast(
        "Không tìm thấy token xác thực. Vui lòng đăng nhập lại.",
        "error"
      );
      return;
    }

    let user;
    try {
      user = JSON.parse(userStr || "{}");
      console.log("Parsed user info:", user);
      console.log("User ID:", user.UId || user.userId || user.id);
      console.log("User Role ID:", user.RoleId || user.roleId || user.role);
      console.log("User Email:", user.Email || user.email);
    } catch (parseError) {
      console.error("Failed to parse user from localStorage:", parseError);
      showToast(
        "Thông tin người dùng không hợp lệ. Vui lòng đăng nhập lại.",
        "error"
      );
      return;
    }

    // Kiểm tra quyền user (có thể RoleId là string hoặc number)
    const roleId = user.RoleId || user.roleId || user.role;
    if (roleId != 2 && roleId !== "2") {
      showToast(
        `Bạn không có quyền thêm dịch vụ. Role hiện tại: ${roleId}. Chỉ Field Owner (Role 2) mới có thể sử dụng tính năng này.`,
        "error"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("serviceName", newServiceFormData.serviceName);
      formData.append("price", newServiceFormData.price.toString());
      formData.append("status", newServiceFormData.status);
      formData.append("description", newServiceFormData.description);
      if (newServiceFormData.imageFile) {
        formData.append("imageFile", newServiceFormData.imageFile);
      }
      formData.append("facId", facId || "");

      console.log("=== API REQUEST DEBUG ===");
      console.log("API URL:", `${API_URL}/api/Service/Add/Service`);
      console.log("Method: POST");
      console.log(
        "Headers will include Authorization:",
        `Bearer ${token.substring(0, 20)}...`
      );
      console.log("FormData contents:");
      for (const [key, value] of formData.entries()) {
        console.log(
          `  ${key}:`,
          typeof value === "object" ? "File object" : value
        );
      }

      // Test với một request khác để kiểm tra authentication
      console.log("Testing API connection...");
      try {
        // Test multiple authentication approaches
        const authTests = [
          {
            name: "Standard Bearer",
            headers: { Authorization: `Bearer ${token}` } as Record<
              string,
              string
            >,
          },
          {
            name: "Bearer with Content-Type",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            } as Record<string, string>,
          },
          {
            name: "Bearer with Accept",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            } as Record<string, string>,
          },
          {
            name: "Bearer with both headers",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            } as Record<string, string>,
          },
        ];

        for (const test of authTests) {
          console.log(`\n=== Testing ${test.name} ===`);
          try {
            const testResponse = await fetch(
              `${API_URL}/api/Service/GetAllService`,
              {
                method: "GET",
                headers: test.headers,
              }
            );

            console.log(`${test.name} - Status:`, testResponse.status);
            console.log(`${test.name} - StatusText:`, testResponse.statusText);
            console.log(`${test.name} - Redirected:`, testResponse.redirected);
            console.log(`${test.name} - URL:`, testResponse.url);

            if (testResponse.status === 302) {
              const location = testResponse.headers.get("location");
              console.log(`${test.name} - Redirect location:`, location);
            }

            if (testResponse.ok) {
              console.log(`${test.name} - SUCCESS!`);
              break; // Found working authentication
            }
          } catch (innerError) {
            console.error(`${test.name} - Error:`, innerError);
          }
        }
      } catch (testError) {
        console.error("API connection test failed:", testError);
        throw new Error(
          `Lỗi kết nối API: ${
            testError instanceof Error ? testError.message : "Unknown error"
          }`
        );
      }

      console.log("=== Testing CORS and Authentication ===");
      try {
        const optionsResponse = await fetch(
          `${API_URL}/api/Service/Add/Service`,
          {
            method: "OPTIONS",
            headers: {
              Origin: "http://localhost:5173",
              "Access-Control-Request-Method": "POST",
              "Access-Control-Request-Headers": "authorization,content-type",
            },
          }
        );
        console.log("OPTIONS response status:", optionsResponse.status);
        console.log(
          "OPTIONS response headers:",
          Object.fromEntries(optionsResponse.headers.entries())
        );
      } catch (optionsError) {
        console.error("OPTIONS request failed:", optionsError);
      }

      // Test with different Content-Type approaches for FormData
      let response;
      const approaches: { name: string; headers: Record<string, string> }[] = [
        {
          name: "No Content-Type (let browser set)",
          headers: { Authorization: `Bearer ${token}` },
        },
        {
          name: "Manual multipart boundary",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "multipart/form-data; boundary=" +
              "----WebKitFormBoundary" +
              Math.random().toString(36),
          },
        },
      ];

      for (const approach of approaches) {
        // Remove any undefined header values to satisfy type requirements
        const filteredHeaders: Record<string, string> = Object.fromEntries(
          Object.entries(approach.headers).filter(
            ([, value]) => typeof value === "string"
          )
        );
        console.log(`\n=== Trying ${approach.name} ===`);
        try {
          response = await fetch(`${API_URL}/api/Service/Add/Service`, {
            method: "POST",
            headers: filteredHeaders,
            body: formData,
          });

          console.log(`${approach.name} - Status:`, response.status);
          console.log(`${approach.name} - StatusText:`, response.statusText);
          console.log(`${approach.name} - Redirected:`, response.redirected);

          if (
            response.status !== 302 &&
            response.status !== 401 &&
            response.status !== 403
          ) {
            console.log(`${approach.name} - SUCCESS! Using this approach.`);
            break;
          } else {
            console.log(`${approach.name} - Authentication failed`);
          }
        } catch (approachError) {
          console.error(`${approach.name} - Error:`, approachError);
          continue;
        }
      }

      if (!response) {
        throw new Error("All authentication approaches failed");
      }

      console.log("=== API RESPONSE DEBUG ===");
      console.log("Response status:", response.status);
      console.log("Response statusText:", response.statusText);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );
      console.log("Response URL:", response.url);
      console.log("Response redirected:", response.redirected);

      // Nếu response có status 302, đây là redirect - thường là do authentication/authorization issue
      if (response.status === 302) {
        const location = response.headers.get("location");
        console.error("API returned 302 redirect to:", location);
        throw new Error(
          `Authentication failed. Server redirected to: ${location}`
        );
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} - ${response.statusText}`;

        // Check if response has JSON content
        const contentType = response.headers.get("content-type");
        console.log("Error response content-type:", contentType);

        if (contentType && contentType.includes("application/json")) {
          try {
            const result = await response.json();
            console.error("Add service API error:", response.status, result);
            errorMessage = result.message || result.Message || errorMessage;
          } catch (jsonError) {
            console.error("Failed to parse error response as JSON:", jsonError);
          }
        } else {
          // If not JSON, get text content for debugging
          try {
            const textContent = await response.text();
            console.error("Add service non-JSON error response:", textContent);
            if (textContent.includes("AccessDenied")) {
              errorMessage =
                "Không có quyền truy cập. Vui lòng kiểm tra token và quyền user.";
            }
          } catch (textError) {
            console.error("Failed to read error response as text:", textError);
          }
        }

        throw new Error(`Lỗi khi thêm dịch vụ: ${errorMessage}`);
      }

      // Check if success response has JSON content
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn(
          "Success response is not JSON, treating as success without data"
        );
        // Refresh services to get updated list
        setNewServiceFormData({
          serviceName: "",
          price: 0,
          status: "Active",
          description: "",
          imageFile: null,
          facilityAddress: "",
        });
        showToast("Thêm dịch vụ thành công!", "success");
        return;
      }

      const newService = await response.json();
      const mappedService: Service = {
        serviceId: newService.serviceId,
        facId: newService.facId,
        serviceName: newService.serviceName || "Unknown",
        price: newService.price || 0,
        status: newService.status || "Inactive",
        image: getImageUrl(newService.image) || getImageUrl(undefined),
        description: newService.description || "",
        facilityAddress: facility?.address || "Unknown",
      };

      setServices((prev) => [...prev, mappedService]);
      setFilteredServices((prev) => [...prev, mappedService]);
      setIsAddServiceModalOpen(false);
      setNewServiceFormData({
        serviceName: "",
        price: 0,
        status: "Active",
        imageFile: null,
        description: "",
        facilityAddress: "",
      });
      showToast("Thêm dịch vụ thành công!", "success");
      await fetchServices();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Lỗi không xác định khi thêm dịch vụ";
      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDiscount = async () => {
    if (
      !newDiscountFormData.discountPercentage ||
      newDiscountFormData.discountPercentage <= 0
    ) {
      showToast("Phần trăm giảm giá là bắt buộc và phải lớn hơn 0!", "error");
      return;
    }

    if (!newDiscountFormData.startDate || !newDiscountFormData.endDate) {
      showToast("Ngày bắt đầu và ngày kết thúc là bắt buộc!", "error");
      return;
    }

    if (
      new Date(newDiscountFormData.endDate) <=
      new Date(newDiscountFormData.startDate)
    ) {
      showToast("Ngày kết thúc phải sau ngày bắt đầu!", "error");
      return;
    }

    if (!validateToken()) {
      showToast(
        "Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
        "error"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/Discount`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          facId: Number(facId),
          discountPercentage: newDiscountFormData.discountPercentage,
          startDate: newDiscountFormData.startDate,
          endDate: newDiscountFormData.endDate,
          description: newDiscountFormData.description,
          isActive: newDiscountFormData.isActive,
          quantity: newDiscountFormData.quantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Lỗi khi thêm mã giảm giá: ${response.status} - ${response.statusText}`
        );
      }

      const result = await response.json();

      // Success response handling
      await fetchDiscounts();
      setIsAddDiscountModalOpen(false);
      setNewDiscountFormData({
        discountPercentage: 0,
        startDate: "",
        endDate: "",
        description: "",
        isActive: true,
        quantity: 1,
      });
      showToast("Thêm mã giảm giá thành công!", "success");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Lỗi không xác định khi thêm mã giảm giá";
      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDiscountEdit = async () => {
    if (editDiscount && discountFormData) {
      if (
        !discountFormData.discountPercentage ||
        discountFormData.discountPercentage <= 0
      ) {
        showToast("Phần trăm giảm giá là bắt buộc và phải lớn hơn 0!", "error");
        return;
      }

      if (!discountFormData.startDate || !discountFormData.endDate) {
        showToast("Ngày bắt đầu và ngày kết thúc là bắt buộc!", "error");
        return;
      }

      if (
        new Date(discountFormData.endDate) <=
        new Date(discountFormData.startDate)
      ) {
        showToast("Ngày kết thúc phải sau ngày bắt đầu!", "error");
        return;
      }

      if (!validateToken()) {
        showToast(
          "Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
          "error"
        );
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await fetch(
          `${API_URL}/api/Discount/${editDiscount.discountId}`,
          {
            method: "PUT",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              facId: editDiscount.facId,
              discountPercentage: discountFormData.discountPercentage,
              startDate: discountFormData.startDate,
              endDate: discountFormData.endDate,
              description: discountFormData.description,
              isActive: discountFormData.isActive,
              quantity: discountFormData.quantity,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Lỗi khi cập nhật mã giảm giá: ${response.status} - ${response.statusText}`
          );
        }

        const result = await response.json();

        // Success response handling
        await fetchDiscounts();
        closeModal();
        showToast("Cập nhật mã giảm giá thành công!", "success");
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Lỗi không xác định khi cập nhật mã giảm giá";
        showToast(errorMessage, "error");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleFieldChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFieldFormData((prev) =>
        prev
          ? { ...prev, [name]: (e.target as HTMLInputElement).checked }
          : prev
      );
    } else {
      setFieldFormData((prev) =>
        prev
          ? { ...prev, [name]: name === "categoryId" ? Number(value) : value }
          : prev
      );
    }
  };

  const handleServiceChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (name === "imageFile" && e.target instanceof HTMLInputElement) {
      const file = e.target.files?.[0] || null;
      setServiceFormData((prev) =>
        prev ? { ...prev, imageFile: file, removeImage: false } : prev
      );
    } else {
      setServiceFormData((prev) =>
        prev
          ? { ...prev, [name]: type === "number" ? Number(value) : value }
          : prev
      );
    }
  };

  const handleNewFieldChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setNewFieldFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setNewFieldFormData((prev) => ({
        ...prev,
        [name]: name === "categoryId" ? Number(value) : value,
      }));
    }
  };

  const handleNewServiceChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (name === "imageFile" && e.target instanceof HTMLInputElement) {
      const file = e.target.files?.[0] || null;
      setNewServiceFormData((prev) => ({ ...prev, imageFile: file }));
    } else {
      setNewServiceFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      }));
    }
  };

  const closeModal = () => {
    setSelectedField(null);
    setSelectedService(null);
    setSelectedDiscount(null);
    setEditField(null);
    setEditService(null);
    setEditDiscount(null);
    setFieldFormData(null);
    setServiceFormData(null);
    setDiscountFormData(null);
    setIsAddFieldModalOpen(false);
    setIsAddServiceModalOpen(false);
    setIsAddDiscountModalOpen(false);
  };

  const handleDiscountChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setDiscountFormData((prev) =>
      prev
        ? {
            ...prev,
            [name]:
              type === "number"
                ? Number(value)
                : type === "checkbox"
                ? (e.target as HTMLInputElement).checked
                : value,
          }
        : null
    );
  };

  const handleNewDiscountChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setNewDiscountFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? Number(value)
          : type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleManageField = (fieldId: number, fieldName: string) => {
    navigate(
      `/weekly_schedule?fieldId=${fieldId}&fieldName=${encodeURIComponent(
        fieldName
      )}&facId=${facId}`
    );
  };

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="min-h-screen flex flex-col bg-gray-50 pl-64 pt-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Đang tải...
            </h2>
          </div>
        </div>
      </>
    );
  }

  if (!facility) {
    return (
      <>
        <Sidebar />
        <div className="min-h-screen flex flex-col bg-gray-50 pl-64 pt-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Không tìm thấy cơ sở
            </h2>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 hover:shadow-lg"
              title="Quay lại"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-50 pl-64">
        {/* Header Section */}
        <div className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 hover:shadow-lg"
                  title="Quay lại"
                >
                  <FiArrowLeft className="h-5 w-5" />
                </button>
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
                    Chi tiết cơ sở
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Quản lý thông tin chi tiết và hoạt động của cơ sở
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></div>
                  Đang hoạt động
                </span>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 px-6 sm:px-8 lg:px-10 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Facility Information Card */}

            {/* Management Tabs */}
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
              <div className="p-8">
                <div className="space-y-6 mb-8">
                  {/* Tab Navigation */}
                  <div className="flex justify-center">
                    <div className="flex bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl p-2 border-2 border-gray-200 shadow-lg">
                      <button
                        type="button"
                        onClick={() => setActiveTab("overview")}
                        className={`px-6 py-3 font-bold text-sm rounded-xl transition-all duration-300 transform ${
                          activeTab === "overview"
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl scale-105 border-2 border-green-400"
                            : "text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-md hover:scale-102 border-2 border-transparent"
                        }`}
                      >
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
                              d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                            />
                          </svg>
                          <span>Tổng quan</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("fields")}
                        className={`px-6 py-3 font-bold text-sm rounded-xl transition-all duration-300 transform ${
                          activeTab === "fields"
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl scale-105 border-2 border-green-400"
                            : "text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-md hover:scale-102 border-2 border-transparent"
                        }`}
                      >
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
                          <span>Sân trong cơ sở</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("services")}
                        className={`px-6 py-3 font-bold text-sm rounded-xl transition-all duration-300 transform ${
                          activeTab === "services"
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl scale-105 border-2 border-green-400"
                            : "text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-md hover:scale-102 border-2 border-transparent"
                        }`}
                      >
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
                              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v2a2 2 0 002 2v1M8 6v2a2 2 0 00-2 2v1"
                            />
                          </svg>
                          <span>Dịch vụ</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("discounts")}
                        className={`px-6 py-3 font-bold text-sm rounded-xl transition-all duration-300 transform ${
                          activeTab === "discounts"
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl scale-105 border-2 border-green-400"
                            : "text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-md hover:scale-102 border-2 border-transparent"
                        }`}
                      >
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
                              d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
                            />
                          </svg>
                          <span>Mã giảm giá</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Controls Section */}
                  <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    {/* Add Button */}
                    <div className="flex-shrink-0">
                      {activeTab === "fields" && (
                        <button
                          type="button"
                          onClick={() => setIsAddFieldModalOpen(true)}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                          disabled={isSubmitting}
                        >
                          <FiPlus className="h-5 w-5" />
                          <span>Thêm sân mới</span>
                        </button>
                      )}
                      {activeTab === "services" && (
                        <button
                          type="button"
                          onClick={() => setIsAddServiceModalOpen(true)}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                          disabled={isSubmitting}
                        >
                          <FiPlus className="h-5 w-5" />
                          <span>Thêm dịch vụ mới</span>
                        </button>
                      )}
                      {activeTab === "discounts" && (
                        <button
                          type="button"
                          onClick={() => setIsAddDiscountModalOpen(true)}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                          disabled={isSubmitting}
                        >
                          <FiPlus className="h-5 w-5" />
                          <span>Thêm mã giảm giá mới</span>
                        </button>
                      )}
                    </div>

                    {/* Filter and Search */}
                    <div className="flex flex-col sm:flex-row gap-3 items-center flex-1 lg:max-w-2xl">
                      {activeTab === "discounts" && (
                        <div className="relative w-full sm:w-auto flex-shrink-0">
                          <label
                            htmlFor="discountStatusFilter"
                            className="sr-only"
                          >
                            Lọc theo trạng thái mã giảm giá
                          </label>
                          <select
                            id="discountStatusFilter"
                            title="Lọc theo trạng thái mã giảm giá"
                            value={
                              discountFilter.startsWith("status:")
                                ? discountFilter.replace("status:", "")
                                : "all"
                            }
                            onChange={(e) => {
                              if (e.target.value === "all") {
                                setDiscountFilter("");
                              } else {
                                setDiscountFilter(`status:${e.target.value}`);
                              }
                            }}
                            className="w-full sm:w-48 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md bg-white font-medium text-gray-700"
                          >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Đang hoạt động</option>
                            <option value="inactive">Tạm dừng</option>
                          </select>
                        </div>
                      )}

                      <div className="relative flex-1 w-full">
                        {activeTab !== "overview" && (
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <FiSearch className="h-5 w-5" />
                          </div>
                        )}
                        {activeTab !== "overview" && (
                          <input
                            type="text"
                            placeholder={
                              activeTab === "fields"
                                ? "Tìm kiếm sân theo tên hoặc mô tả..."
                                : activeTab === "services"
                                ? "Tìm kiếm dịch vụ theo tên, mô tả..."
                                : "Tìm kiếm mã giảm giá theo mô tả..."
                            }
                            value={
                              activeTab === "fields"
                                ? fieldFilter
                                : activeTab === "services"
                                ? serviceFilter
                                : discountFilter.startsWith("status:")
                                ? ""
                                : discountFilter
                            }
                            onChange={(e) => {
                              if (activeTab === "fields") {
                                setFieldFilter(e.target.value);
                              } else if (activeTab === "services") {
                                setServiceFilter(e.target.value);
                              } else {
                                setDiscountFilter(e.target.value);
                              }
                            }}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-gray-700 placeholder-gray-400"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {activeTab === "overview" && (
                  <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
                    <div className="md:flex">
                      <div className="md:w-2/5 lg:w-1/3">
                        <div
                          style={{ height: "33vw" }}
                          className="relative h-100 md:h-100 group"
                          onMouseEnter={() => setIsCarouselPaused(true)}
                          onMouseLeave={() => setIsCarouselPaused(false)}
                        >
                          {/* Image Carousel */}
                          {facility.images && facility.images.length > 0 ? (
                            <>
                              {/* Main Image */}
                              <img
                                src={
                                  facility.images[currentImageIndex]
                                    ?.imageUrl || getImageUrl(undefined)
                                }
                                alt={`Facility image ${currentImageIndex + 1}`}
                                className="w-full h-full object-cover transition-opacity duration-300"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  console.log(
                                    "Carousel image load error. Original src:",
                                    target.src
                                  );
                                  target.src = getImageUrl(undefined);
                                }}
                              />

                              {/* Gradient Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

                              {/* Navigation Arrows - only show if more than 1 image */}
                              {facility.images.length > 1 && (
                                <>
                                  <button
                                    type="button"
                                    onClick={prevImage}
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                                    title="Previous image"
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
                                        d="M15 19l-7-7 7-7"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={nextImage}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                                    title="Next image"
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
                                        d="M9 5l7 7-7 7"
                                      />
                                    </svg>
                                  </button>
                                </>
                              )}

                              {/* Image Counter */}
                              <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-medium">
                                {currentImageIndex + 1} /{" "}
                                {facility.images.length}
                              </div>

                              {/* Auto-play control - only show if more than 1 image */}
                              {facility.images.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setIsCarouselPaused(!isCarouselPaused)
                                  }
                                  className="absolute top-4 left-4 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded-full transition-all duration-200"
                                  title={
                                    isCarouselPaused
                                      ? "Play slideshow"
                                      : "Pause slideshow"
                                  }
                                >
                                  {isCarouselPaused ? (
                                    <svg
                                      className="w-4 h-4"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  ) : (
                                    <svg
                                      className="w-4 h-4"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                </button>
                              )}

                              {/* Dots Indicator - only show if more than 1 image */}
                              {facility.images.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                  {facility.images.map((_, index) => (
                                    <button
                                      key={index}
                                      type="button"
                                      onClick={() => goToImage(index)}
                                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                        index === currentImageIndex
                                          ? "bg-white scale-125"
                                          : "bg-white bg-opacity-50 hover:bg-opacity-75"
                                      }`}
                                      title={`Go to image ${index + 1}`}
                                    />
                                  ))}
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              {/* Fallback Single Image */}
                              <img
                                src={facility.picture || getImageUrl(undefined)}
                                alt="Facility"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  console.log(
                                    "Fallback image load error. Original src:",
                                    target.src
                                  );
                                  target.src = getImageUrl(undefined);
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="md:w-3/5 lg:w-2/3 p-8">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h2 className="text-3xl font-bold text-gray-900">
                                {facility.name}
                              </h2>
                            </div>
                            <p className="text-gray-600 text-lg leading-relaxed">
                              {facility.description}
                            </p>
                            {facility.subdescription && (
                              <p className="text-gray-600 text-lg leading-relaxed">
                                {facility.subdescription}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="flex items-start space-x-3">
                              <div className="bg-green-100 p-2 rounded-lg">
                                <FiMapPin className="h-5 w-5 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                                  Địa chỉ
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  {facility.address}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="flex items-start space-x-3">
                              <div className="bg-green-100 p-2 rounded-lg">
                                <FiClock className="h-5 w-5 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                                  Giờ hoạt động
                                </h3>
                                <div className="flex items-center space-x-2">
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">
                                    Mở: {facility.openTime}
                                  </span>
                                  <span className="text-gray-400">-</span>
                                  <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md text-xs font-medium">
                                    Đóng: {facility.closeTime}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Statistics */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Thống kê tổng quan
                          </h3>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="text-2xl font-bold text-green-600">
                                  {filteredFields.length}
                                </div>
                                <div className="text-sm text-gray-600 font-medium">
                                  Sân bóng
                                </div>
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="text-2xl font-bold text-green-600">
                                  {filteredServices.length}
                                </div>
                                <div className="text-sm text-gray-600 font-medium">
                                  Dịch vụ
                                </div>
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="text-2xl font-bold text-green-600">
                                  {filteredDiscounts.length}
                                </div>
                                <div className="text-sm text-gray-600 font-medium">
                                  Mã giảm giá
                                </div>
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="text-2xl font-bold text-emerald-600">
                                  {facility.images?.length || 0}
                                </div>
                                <div className="text-sm text-gray-600 font-medium">
                                  Hình ảnh
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "fields" && (
                  <div className="space-y-6">
                    {filteredFields.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
                          <svg
                            className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Chưa có sân nào
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Hãy thêm sân đầu tiên để bắt đầu quản lý
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsAddFieldModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                          >
                            <FiPlus className="h-4 w-4" />
                            Thêm sân đầu tiên
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-gray-50 to-green-50">
                              <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                  <div className="flex items-center space-x-2">
                                    <span>STT</span>
                                  </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
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
                                    <span>Tên sân</span>
                                  </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
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
                                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                      />
                                    </svg>
                                    <span>Loại sân</span>
                                  </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                  <span>Mô tả</span>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                  <span>Địa chỉ</span>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                  <span>Trạng thái</span>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                  <span>Thao tác</span>
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                              {filteredFields.map((field, index) => (
                                <tr
                                  key={field.fieldId}
                                  className="hover:bg-green-50 transition-colors duration-150 group"
                                >
                                  <td className="px-6 py-6 whitespace-nowrap">
                                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                      {index + 1}
                                    </div>
                                  </td>
                                  <td className="px-6 py-6 whitespace-nowrap">
                                    <div>
                                      <div className="text-sm font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                                        {field.fieldName}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-6 whitespace-nowrap">
                                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                                      {field.categoryName}
                                    </span>
                                  </td>
                                  <td className="px-6 py-6">
                                    <div className="text-sm text-gray-600 max-w-xs">
                                      <div
                                        className="truncate"
                                        title={field.description}
                                      >
                                        {field.description || "Không có mô tả"}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-6">
                                    <div className="text-sm text-gray-600 max-w-xs truncate">
                                      {field.facilityAddress}
                                    </div>
                                  </td>
                                  <td className="px-6 py-6 whitespace-nowrap">
                                    <span
                                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                        field.isBookingEnable
                                          ? "bg-green-100 text-green-800 border border-green-200"
                                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                      }`}
                                    >
                                      {field.isBookingEnable
                                        ? "Có thể đặt"
                                        : "Không thể đặt"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-6 whitespace-nowrap">
                                    <div className="flex items-center space-x-2">
                                      <button
                                        type="button"
                                        onClick={() => setSelectedField(field)}
                                        className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:shadow-md"
                                        title="Xem chi tiết"
                                      >
                                        <FiEye className="h-4 w-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleEditField(field)}
                                        className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:shadow-md"
                                        title="Chỉnh sửa"
                                      >
                                        <FiEdit className="h-4 w-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDeleteField(field.fieldId)
                                        }
                                        className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:shadow-md"
                                        title="Xóa"
                                        disabled={isSubmitting}
                                      >
                                        <FiTrash2 className="h-4 w-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleManageField(
                                            field.fieldId,
                                            field.fieldName
                                          )
                                        }
                                        className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:shadow-md"
                                        title="Quản lý lịch"
                                      >
                                        Quản lý
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "services" && (
                  <div className="space-y-4">
                    {filteredServices.length === 0 ? (
                      <div className="text-center py-16 text-gray-500">
                        <div className="text-lg font-medium mb-2">
                          Chưa có dịch vụ nào
                        </div>
                        <div className="text-sm">
                          Hoặc không tìm thấy kết quả phù hợp với từ khóa tìm
                          kiếm
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto shadow-sm border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                STT
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                Tên dịch vụ
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                Giá
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                Trạng thái
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                Mô tả
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                Hình ảnh
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                Địa chỉ
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                Thao tác
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredServices.map((service) => (
                              <tr
                                key={service.serviceId}
                                className="hover:bg-gray-50 transition-colors duration-150"
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                  #{service.serviceId}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                  {service.serviceName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                  {service.price.toLocaleString()} VND
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                      service.status === "Active" ||
                                      service.status === "Available"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {service.status === "Active" ||
                                    service.status === "Available"
                                      ? "Hoạt động"
                                      : "Tạm dừng"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                                  <div
                                    className="truncate"
                                    title={service.description}
                                  >
                                    {service.description}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <img
                                    src={getImageUrl(service.image)}
                                    alt="Service"
                                    className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      console.log(
                                        "Service image load error. Original src:",
                                        target.src
                                      );
                                      target.src = getImageUrl(undefined);
                                    }}
                                  />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {service.facilityAddress}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSelectedService(service)
                                      }
                                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors duration-200"
                                      title="Xem chi tiết"
                                    >
                                      <FiEye className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleEditService(service)}
                                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors duration-200"
                                      title="Chỉnh sửa"
                                    >
                                      <FiEdit className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteService(service.serviceId)
                                      }
                                      className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors duration-200"
                                      title="Xóa"
                                      disabled={isSubmitting}
                                    >
                                      <FiTrash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "discounts" && (
                  <div className="space-y-6">
                    {filteredDiscounts.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl p-12 max-w-md mx-auto border border-gray-200 shadow-sm">
                          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg
                              className="w-10 h-10 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Chưa có mã giảm giá nào
                          </h3>
                          <p className="text-gray-600 mb-6 leading-relaxed">
                            Hoặc không tìm thấy kết quả phù hợp với từ khóa tìm
                            kiếm
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsAddDiscountModalOpen(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                          >
                            <FiPlus className="h-5 w-5" />
                            Tạo mã giảm giá đầu tiên
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto shadow-sm border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                STT
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                % Giảm giá
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                Thời gian áp dụng
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                Tên mã giảm giá
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                Số lượng
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                Trạng thái
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                Thao tác
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredDiscounts.map((discount) => (
                              <tr
                                key={discount.discountId}
                                className="hover:bg-gray-50 transition-colors duration-150"
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                  #{discount.discountId}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                  {discount.discountPercentage}%
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  <div>
                                    Từ:{" "}
                                    {new Date(
                                      discount.startDate
                                    ).toLocaleDateString("vi-VN")}
                                  </div>
                                  <div>
                                    Đến:{" "}
                                    {new Date(
                                      discount.endDate
                                    ).toLocaleDateString("vi-VN")}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                                  <div
                                    className="truncate"
                                    title={discount.description}
                                  >
                                    {discount.description || "Không có mô tả"}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                  {discount.quantity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                      discount.isActive
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {discount.isActive
                                      ? "Hoạt động"
                                      : "Tạm dừng"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSelectedDiscount(discount)
                                      }
                                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors duration-200"
                                      title="Xem chi tiết"
                                    >
                                      <FiEye className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleEditDiscount(discount)
                                      }
                                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors duration-200"
                                      title="Chỉnh sửa"
                                    >
                                      <FiEdit className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteDiscount(
                                          discount.discountId
                                        )
                                      }
                                      className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors duration-200"
                                      title="Xóa"
                                      disabled={isSubmitting}
                                    >
                                      <FiTrash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {selectedField && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm"
                    onClick={closeModal}
                  >
                    <div
                      className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 transform transition-all duration-300 scale-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 rounded-t-2xl">
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
                              Chi tiết sân: {selectedField.fieldName}
                            </h3>
                          </div>
                          <button
                            type="button"
                            title="Đóng"
                            onClick={closeModal}
                            className="text-white hover:text-gray-200 transition-colors bg-white bg-opacity-20 p-2 rounded-xl hover:bg-opacity-30"
                          >
                            <FiX className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              ID Sân
                            </span>
                            <p className="text-lg font-bold text-green-600 mt-1">
                              #{selectedField.fieldId}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              Trạng thái
                            </span>
                            <div className="mt-2">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                  selectedField.isBookingEnable
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                }`}
                              >
                                <div
                                  className={`w-2 h-2 rounded-full mr-2 ${
                                    selectedField.isBookingEnable
                                      ? "bg-green-600"
                                      : "bg-emerald-600"
                                  }`}
                                ></div>
                                {selectedField.isBookingEnable
                                  ? "Có thể đặt"
                                  : "Không thể đặt"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                            <span className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                              Loại sân
                            </span>
                            <p className="text-lg font-bold text-green-800 mt-1">
                              {selectedField.categoryName}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              Mô tả
                            </span>
                            <p className="text-gray-900 mt-2 leading-relaxed">
                              {selectedField.description}
                            </p>
                          </div>
                          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                            <span className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                              Địa chỉ cơ sở
                            </span>
                            <p className="text-green-800 mt-2 leading-relaxed">
                              {selectedField.facilityAddress}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedService && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm"
                    onClick={closeModal}
                  >
                    <div
                      className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 transform transition-all duration-300 scale-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 rounded-t-2xl">
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
                                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v2a2 2 0 002 2v1M8 6v2a2 2 0 00-2 2v1"
                                />
                              </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white">
                              Chi tiết dịch vụ: {selectedService.serviceName}
                            </h3>
                          </div>
                          <button
                            type="button"
                            title="Đóng"
                            onClick={closeModal}
                            className="text-white hover:text-gray-200 transition-colors bg-white bg-opacity-20 p-2 rounded-xl hover:bg-opacity-30"
                          >
                            <FiX className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              ID Dịch vụ
                            </span>
                            <p className="text-lg font-bold text-green-600 mt-1">
                              #{selectedService.serviceId}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              Trạng thái
                            </span>
                            <div className="mt-2">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                  selectedService.status === "Active" ||
                                  selectedService.status === "Available"
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : "bg-gray-100 text-gray-800 border border-gray-200"
                                }`}
                              >
                                <div
                                  className={`w-2 h-2 rounded-full mr-2 ${
                                    selectedService.status === "Active" ||
                                    selectedService.status === "Available"
                                      ? "bg-green-600"
                                      : "bg-gray-600"
                                  }`}
                                ></div>
                                {selectedService.status === "Active" ||
                                selectedService.status === "Available"
                                  ? "Hoạt động"
                                  : "Tạm dừng"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                            <span className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                              Giá dịch vụ
                            </span>
                            <p className="text-2xl font-bold text-emerald-800 mt-1">
                              {selectedService.price.toLocaleString()} VND
                            </p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              Mô tả dịch vụ
                            </span>
                            <p className="text-gray-900 mt-2 leading-relaxed">
                              {selectedService.description}
                            </p>
                          </div>
                          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                            <span className="text-sm font-semibold text-yellow-700 uppercase tracking-wide">
                              Hình ảnh dịch vụ
                            </span>
                            <div className="mt-3">
                              <img
                                src={getImageUrl(selectedService.image)}
                                alt="Service"
                                className="w-full h-32 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  console.log(
                                    "Selected service image load error. Original src:",
                                    target.src
                                  );
                                  target.src = getImageUrl(undefined);
                                }}
                              />
                            </div>
                          </div>
                          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                            <span className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                              Địa chỉ cơ sở
                            </span>
                            <p className="text-green-800 mt-2 leading-relaxed">
                              {selectedService.facilityAddress}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {editField && fieldFormData && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm"
                    onClick={closeModal}
                  >
                    <div
                      className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 transform transition-all duration-300 scale-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-white bg-opacity-20 p-2 rounded-xl">
                              <FiEdit className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white">
                              Chỉnh sửa sân: {editField.fieldName}
                            </h3>
                          </div>
                          <button
                            type="button"
                            title="Đóng"
                            onClick={closeModal}
                            className="text-white hover:text-gray-200 transition-colors bg-white bg-opacity-20 p-2 rounded-xl hover:bg-opacity-30"
                          >
                            <FiX className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              Tên sân
                            </label>
                            <input
                              type="text"
                              name="fieldName"
                              value={fieldFormData.fieldName || ""}
                              onChange={handleFieldChange}
                              placeholder="Nhập tên sân bóng..."
                              maxLength={50}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              Loại sân
                            </label>
                            <label
                              htmlFor="editFieldCategoryId"
                              className="sr-only"
                            >
                              Loại sân
                            </label>
                            <select
                              id="editFieldCategoryId"
                              name="categoryId"
                              value={fieldFormData.categoryId || ""}
                              onChange={handleFieldChange}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                              disabled={isSubmitting}
                              title="Loại sân"
                            >
                              <option value="">Chọn loại sân</option>
                              {categories.map((category) => (
                                <option
                                  key={category.categoryId}
                                  value={category.categoryId}
                                >
                                  {category.categoryName}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              Mô tả
                            </label>
                            <textarea
                              name="description"
                              value={fieldFormData.description || ""}
                              onChange={handleFieldChange}
                              rows={3}
                              placeholder="Nhập mô tả chi tiết về sân bóng..."
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                name="isBookingEnable"
                                checked={fieldFormData.isBookingEnable || false}
                                onChange={handleFieldChange}
                                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded-lg"
                                disabled={isSubmitting}
                                title="Cho phép đặt sân"
                              />
                              <div>
                                <label className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                                  Cho phép đặt sân
                                </label>
                                <p className="text-xs text-green-600 mt-1">
                                  Kích hoạt tính năng đặt sân trực tuyến
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={closeModal}
                            className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105"
                            disabled={isSubmitting}
                          >
                            Hủy bỏ
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveFieldEdit}
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Đang cập nhật...</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <FiEdit className="w-4 h-4" />
                                <span>Cập nhật sân</span>
                              </div>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isAddFieldModalOpen && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm"
                    onClick={closeModal}
                  >
                    <div
                      className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 transform transition-all duration-300 scale-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-white bg-opacity-20 p-2 rounded-xl">
                              <FiPlus className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white">
                              Thêm sân mới
                            </h3>
                          </div>
                          <button
                            type="button"
                            title="Đóng"
                            onClick={closeModal}
                            className="text-white hover:text-gray-200 transition-colors bg-white bg-opacity-20 p-2 rounded-xl hover:bg-opacity-30"
                          >
                            <FiX className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              Tên sân
                            </label>
                            <input
                              type="text"
                              name="fieldName"
                              value={newFieldFormData.fieldName || ""}
                              onChange={handleNewFieldChange}
                              placeholder="Nhập tên sân bóng..."
                              maxLength={50}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              Loại sân
                            </label>
                            <select
                              name="categoryId"
                              value={newFieldFormData.categoryId || ""}
                              onChange={handleNewFieldChange}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                              disabled={isSubmitting}
                              title="Chọn loại sân"
                            >
                              <option value="">Chọn loại sân</option>
                              {categories.map((category) => (
                                <option
                                  key={category.categoryId}
                                  value={category.categoryId}
                                >
                                  {category.categoryName}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              Mô tả sân
                            </label>
                            <textarea
                              name="description"
                              value={newFieldFormData.description || ""}
                              onChange={handleNewFieldChange}
                              rows={3}
                              placeholder="Nhập mô tả chi tiết về sân bóng..."
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                name="isBookingEnable"
                                checked={
                                  newFieldFormData.isBookingEnable || false
                                }
                                onChange={handleNewFieldChange}
                                className="h-5 w-5 text-green-600 focus:ring-green-500 border-2 border-gray-300 rounded-md transition-all duration-200"
                                disabled={isSubmitting}
                                title="Cho phép đặt sân"
                              />
                              <label className="text-sm font-semibold text-yellow-700 uppercase tracking-wide flex items-center space-x-2">
                                <span> Cho phép đặt sân</span>
                              </label>
                            </div>
                            <p className="text-xs text-yellow-600 mt-2 ml-8">
                              Khách hàng có thể đặt sân này trực tuyến
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={closeModal}
                            className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105"
                            disabled={isSubmitting}
                          >
                            Hủy bỏ
                          </button>
                          <button
                            type="button"
                            onClick={handleAddField}
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Đang thêm...</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <FiPlus className="w-4 h-4" />
                                <span>Thêm sân</span>
                              </div>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isAddServiceModalOpen && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm"
                    onClick={closeModal}
                  >
                    <div
                      className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 transform transition-all duration-300 scale-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-white bg-opacity-20 p-2 rounded-xl">
                              <FiPlus className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white">
                              Thêm dịch vụ mới
                            </h3>
                          </div>
                          <button
                            type="button"
                            title="Đóng"
                            onClick={closeModal}
                            className="text-white hover:text-gray-200 transition-colors bg-white bg-opacity-20 p-2 rounded-xl hover:bg-opacity-30"
                          >
                            <FiX className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              Tên dịch vụ
                            </label>
                            <input
                              type="text"
                              name="serviceName"
                              value={newServiceFormData.serviceName}
                              onChange={handleNewServiceChange}
                              placeholder="Nhập tên dịch vụ..."
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              Giá dịch vụ (VND)
                            </label>
                            <input
                              type="number"
                              name="price"
                              value={newServiceFormData.price}
                              onChange={handleNewServiceChange}
                              placeholder="0"
                              min="0"
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              Trạng thái
                            </label>
                            <label
                              htmlFor="newServiceStatus"
                              className="sr-only"
                            >
                              Trạng thái
                            </label>
                            <select
                              id="newServiceStatus"
                              name="status"
                              value={newServiceFormData.status}
                              onChange={handleNewServiceChange}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                              disabled={isSubmitting}
                              title="Trạng thái dịch vụ"
                            >
                              <option value="Active">Hoạt động</option>
                              <option value="Inactive">Tạm dừng</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              Mô tả dịch vụ
                            </label>
                            <textarea
                              name="description"
                              value={newServiceFormData.description}
                              onChange={handleNewServiceChange}
                              rows={3}
                              placeholder="Nhập mô tả chi tiết về dịch vụ..."
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              Hình ảnh dịch vụ
                            </label>
                            <div className="relative">
                              <input
                                type="file"
                                name="imageFile"
                                accept="image/*"
                                onChange={handleNewServiceChange}
                                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-green-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                disabled={isSubmitting}
                                title="Chọn ảnh"
                              />
                            </div>
                            {newServiceFormData.imageFile && (
                              <div className="mt-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                                <span className="text-sm font-semibold text-gray-700 block mb-2">
                                  Xem trước hình ảnh:
                                </span>
                                <img
                                  src={URL.createObjectURL(
                                    newServiceFormData.imageFile
                                  )}
                                  alt="Preview"
                                  className="w-40 h-40 object-cover rounded-xl border-2 border-gray-300 shadow-sm"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={closeModal}
                            className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105"
                            disabled={isSubmitting}
                          >
                            Hủy bỏ
                          </button>
                          <button
                            type="button"
                            onClick={handleAddService}
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Đang thêm...</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <FiPlus className="w-4 h-4" />
                                <span>Thêm dịch vụ</span>
                              </div>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {editService && serviceFormData && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm"
                    onClick={closeModal}
                  >
                    <div
                      className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 transform transition-all duration-300 scale-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-white bg-opacity-20 p-2 rounded-xl">
                              <FiEdit className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white">
                              Chỉnh sửa dịch vụ: {editService.serviceName}
                            </h3>
                          </div>
                          <button
                            type="button"
                            title="Đóng"
                            onClick={closeModal}
                            className="text-white hover:text-gray-200 transition-colors bg-white bg-opacity-20 p-2 rounded-xl hover:bg-opacity-30"
                          >
                            <FiX className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              Tên dịch vụ
                            </label>
                            <input
                              type="text"
                              name="serviceName"
                              value={serviceFormData.serviceName}
                              onChange={handleServiceChange}
                              placeholder="Nhập tên dịch vụ..."
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              Giá dịch vụ (VND)
                            </label>
                            <input
                              type="number"
                              name="price"
                              value={serviceFormData.price}
                              onChange={handleServiceChange}
                              placeholder="0"
                              min="0"
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              Trạng thái
                            </label>
                            <select
                              name="status"
                              value={serviceFormData.status}
                              onChange={handleServiceChange}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                              disabled={isSubmitting}
                              title="Status"
                            >
                              <option value="Active">Hoạt động</option>
                              <option value="Inactive">Tạm dừng</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              Mô tả dịch vụ
                            </label>
                            <textarea
                              name="description"
                              value={serviceFormData.description}
                              onChange={handleServiceChange}
                              rows={3}
                              placeholder="Nhập mô tả chi tiết về dịch vụ..."
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              Hình ảnh dịch vụ
                            </label>
                            <div className="relative">
                              <input
                                type="file"
                                name="imageFile"
                                accept="image/*"
                                onChange={handleServiceChange}
                                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-green-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                disabled={isSubmitting}
                                title="Hình ảnh"
                              />
                            </div>

                            {/* Debug console log */}
                            {console.log("Service form debug:", {
                              hasImageFile: !!serviceFormData.imageFile,
                              removeImage: serviceFormData.removeImage,
                              hasEditService: !!editService,
                              hasImage: editService?.image,
                              serviceFormData,
                            })}

                            {/* Display current image if no new file is selected and not marked for removal */}
                            {!serviceFormData.imageFile &&
                              !serviceFormData.removeImage &&
                              editService &&
                              editService.image && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-blue-700">
                                      Hình ảnh hiện tại:
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (serviceFormData) {
                                          console.log("Đánh dấu xóa ảnh");
                                          setServiceFormData({
                                            ...serviceFormData,
                                            removeImage: true,
                                          });
                                        }
                                      }}
                                      className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-md hover:bg-red-100"
                                      title="Xóa ảnh"
                                      disabled={isSubmitting}
                                    >
                                      <FiX className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <img
                                    src={getImageUrl(editService.image)}
                                    alt="Current service"
                                    className="w-40 h-40 object-cover rounded-xl border-2 border-gray-300 shadow-sm"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.src = getImageUrl(undefined);
                                    }}
                                  />
                                </div>
                              )}

                            {/* Display new image preview */}
                            {serviceFormData.imageFile && (
                              <div className="mt-4 p-4 bg-green-50 rounded-xl border-2 border-green-200">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-semibold text-green-700">
                                    Xem trước hình ảnh mới:
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (serviceFormData) {
                                        setServiceFormData({
                                          ...serviceFormData,
                                          imageFile: null,
                                        });
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-md hover:bg-red-100"
                                    title="Hủy ảnh mới"
                                    disabled={isSubmitting}
                                  >
                                    <FiX className="w-4 h-4" />
                                  </button>
                                </div>
                                <img
                                  src={URL.createObjectURL(
                                    serviceFormData.imageFile
                                  )}
                                  alt="Preview"
                                  className="w-40 h-40 object-cover rounded-xl border-2 border-gray-300 shadow-sm"
                                />
                              </div>
                            )}

                            {/* Display message when image is marked for removal */}
                            {serviceFormData.removeImage &&
                              !serviceFormData.imageFile &&
                              editService &&
                              editService.image && (
                                <div className="mt-4 p-4 bg-red-50 rounded-xl border-2 border-red-200">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-red-700">
                                      Ảnh sẽ được xóa khi lưu thay đổi
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (serviceFormData) {
                                          console.log("Khôi phục ảnh");
                                          setServiceFormData({
                                            ...serviceFormData,
                                            removeImage: false,
                                          });
                                        }
                                      }}
                                      className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
                                      title="Khôi phục ảnh"
                                      disabled={isSubmitting}
                                    >
                                      Khôi phục
                                    </button>
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={closeModal}
                            className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105"
                            disabled={isSubmitting}
                          >
                            Hủy bỏ
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveServiceEdit}
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Đang cập nhật...</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <FiEdit className="w-4 h-4" />
                                <span>Cập nhật dịch vụ</span>
                              </div>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedDiscount && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm"
                    onClick={closeModal}
                  >
                    <div
                      className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 transform transition-all duration-300 scale-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 rounded-t-2xl">
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
                                  d="M7 7h10l4 8H3l4-8zM7 7V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10M9 11h6"
                                />
                              </svg>
                            </div>
                            <h2 className="text-xl font-bold text-white">
                              Chi tiết mã giảm giá
                            </h2>
                          </div>
                          <button
                            type="button"
                            title="Đóng"
                            onClick={closeModal}
                            className="text-white hover:text-gray-200 transition-colors bg-white bg-opacity-20 p-2 rounded-xl hover:bg-opacity-30"
                          >
                            <FiX className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                          <div className="bg-gray-50 p-4 rounded-xl">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">
                              ID mã giảm giá
                            </h3>
                            <p className="text-lg font-bold text-gray-900">
                              #{selectedDiscount.discountId}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">
                              Phần trăm giảm giá
                            </h3>
                            <p className="text-lg font-bold text-green-600">
                              {selectedDiscount.discountPercentage}%
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl">
                              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                Ngày bắt đầu
                              </h3>
                              <p className="text-sm text-gray-900">
                                {selectedDiscount.startDate}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl">
                              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                Ngày kết thúc
                              </h3>
                              <p className="text-sm text-gray-900">
                                {selectedDiscount.endDate}
                              </p>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">
                              Số lượng
                            </h3>
                            <p className="text-lg font-bold text-gray-900">
                              {selectedDiscount.quantity}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">
                              Trạng thái
                            </h3>
                            <span
                              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                selectedDiscount.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {selectedDiscount.isActive
                                ? "Hoạt động"
                                : "Không hoạt động"}
                            </span>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">
                              Mô tả
                            </h3>
                            <p className="text-gray-900 leading-relaxed">
                              {selectedDiscount.description || "Không có mô tả"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isAddDiscountModalOpen && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm"
                    onClick={closeModal}
                  >
                    <div
                      className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 transform transition-all duration-300 scale-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-white bg-opacity-20 p-2 rounded-xl">
                              <FiPlus className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-white">
                              Thêm mã giảm giá mới
                            </h2>
                          </div>
                          <button
                            type="button"
                            title="Đóng"
                            onClick={closeModal}
                            className="text-white hover:text-gray-200 transition-colors bg-white bg-opacity-20 p-2 rounded-xl hover:bg-opacity-30"
                          >
                            <FiX className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                              Phần trăm giảm giá (%)
                            </label>
                            <input
                              type="number"
                              name="discountPercentage"
                              value={newDiscountFormData.discountPercentage}
                              onChange={handleNewDiscountChange}
                              placeholder="Nhập phần trăm giảm giá..."
                              min="1"
                              max="100"
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-700">
                                Ngày bắt đầu
                              </label>
                              <input
                                type="date"
                                name="startDate"
                                value={newDiscountFormData.startDate}
                                onChange={handleNewDiscountChange}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                                disabled={isSubmitting}
                                title="Ngày bắt đầu"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-700">
                                Ngày kết thúc
                              </label>
                              <input
                                type="date"
                                name="endDate"
                                value={newDiscountFormData.endDate}
                                onChange={handleNewDiscountChange}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                                disabled={isSubmitting}
                                title="Ngày kết thúc"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                              Số lượng
                            </label>
                            <input
                              type="number"
                              name="quantity"
                              value={newDiscountFormData.quantity}
                              onChange={handleNewDiscountChange}
                              placeholder="Nhập số lượng..."
                              min="1"
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                              Tên mã giảm giá
                            </label>
                            <input
                              type="text"
                              name="description"
                              value={newDiscountFormData.description}
                              onChange={handleNewDiscountChange}
                              placeholder="Nhập tên mã giảm giá..."
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                              Trạng thái
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                name="isActive"
                                checked={newDiscountFormData.isActive}
                                onChange={handleNewDiscountChange}
                                className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                                disabled={isSubmitting}
                                title="Kích hoạt mã giảm giá"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                Kích hoạt mã giảm giá
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={closeModal}
                            className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105"
                            disabled={isSubmitting}
                          >
                            Hủy bỏ
                          </button>
                          <button
                            type="button"
                            onClick={handleAddDiscount}
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Đang thêm...</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <FiPlus className="w-4 h-4" />
                                <span>Thêm mã giảm giá</span>
                              </div>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {editDiscount && discountFormData && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm"
                    onClick={closeModal}
                  >
                    <div
                      className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 transform transition-all duration-300 scale-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-white bg-opacity-20 p-2 rounded-xl">
                              <FiEdit className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-white">
                              Chỉnh sửa mã giảm giá
                            </h2>
                          </div>
                          <button
                            type="button"
                            title="Đóng"
                            onClick={closeModal}
                            className="text-white hover:text-gray-200 transition-colors bg-white bg-opacity-20 p-2 rounded-xl hover:bg-opacity-30"
                          >
                            <FiX className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                              Phần trăm giảm giá (%)
                            </label>
                            <input
                              type="number"
                              name="discountPercentage"
                              value={discountFormData.discountPercentage}
                              onChange={handleDiscountChange}
                              placeholder="Nhập phần trăm giảm giá..."
                              min="1"
                              max="100"
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-700">
                                Ngày bắt đầu
                              </label>
                              <input
                                type="date"
                                name="startDate"
                                value={discountFormData.startDate}
                                onChange={handleDiscountChange}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                                disabled={isSubmitting}
                                title="Ngày bắt đầu"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-700">
                                Ngày kết thúc
                              </label>
                              <input
                                type="date"
                                name="endDate"
                                value={discountFormData.endDate}
                                onChange={handleDiscountChange}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                                disabled={isSubmitting}
                                title="Ngày kết thúc"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                              Số lượng
                            </label>
                            <input
                              type="number"
                              name="quantity"
                              value={discountFormData.quantity}
                              onChange={handleDiscountChange}
                              placeholder="Nhập số lượng..."
                              min="1"
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                              Mô tả
                            </label>
                            <textarea
                              name="description"
                              value={discountFormData.description}
                              onChange={handleDiscountChange}
                              rows={3}
                              placeholder="Nhập mô tả chi tiết về mã giảm giá..."
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                              Trạng thái
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                name="isActive"
                                checked={discountFormData.isActive}
                                onChange={handleDiscountChange}
                                className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                                disabled={isSubmitting}
                                title="Status"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                Kích hoạt mã giảm giá
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={closeModal}
                            className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105"
                            disabled={isSubmitting}
                          >
                            Hủy bỏ
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveDiscountEdit}
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Đang cập nhật...</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <FiEdit className="w-4 h-4" />
                                <span>Cập nhật mã giảm giá</span>
                              </div>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default FacilityDetail;
