import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../../Sidebar";

interface Order {
  orderId: number;
  bookingId: number;
  facilityName: string;
  fieldName: string;
  customerName: string;
  customerPhone: string;
  totalPrice: number;
  totalServicePrice: number;
  contentPayment: string;
  statusPayment: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  createAt: string;
  action: string;
}

interface OrderDetail {
  orderId: number;
  bookingId: number;
  facilityName: string;
  fieldName: string;
  categoryFieldName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  totalPrice: number;
  totalServicePrice: number;
  fieldRentalPrice: number;
  discountAmount: number;
  deposit: number;
  contentPayment: string;
  statusPayment: string;
  paymentMethod: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  bookingTitle: string;
  bookingStatus: string;
  services: OrderServiceDetail[];
  createAt: string;
  bookingCreateAt: string;
}

interface OrderServiceDetail {
  serviceId: number;
  serviceName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

const OrdersTable: React.FC = () => {
  const [ordersPerPage, setOrdersPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchParams] = useSearchParams();

  // Filter states
  const [filters, setFilters] = useState({
    facility: "",
    customer: "",
    priceFrom: "",
    priceTo: "",
    paymentStatus: "",
    dateFrom: "",
    dateTo: "",
  });

  // Dropdown states
  const [showDropdowns, setShowDropdowns] = useState<{
    [key: string]: boolean;
  }>({
    facility: false,
    customer: false,
    price: false,
    paymentStatus: false,
    date: false,
  });

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Lấy tham số từ query string
  const fieldName = searchParams.get("fieldName") || "";

  // Dữ liệu mẫu theo cấu trúc database thực (Order liên kết với Booking)
  const [orders, setOrders] = useState<Order[]>([
    {
      orderId: 1,
      bookingId: 101,
      facilityName: "Sân bóng đá Central Park",
      fieldName: "Sân bóng đá số 1",
      customerName: "Nguyễn Văn Minh",
      customerPhone: "0912345678",
      totalPrice: 450000,
      totalServicePrice: 55000,
      contentPayment: "Thanh toán đặt sân bóng đá 11 người",
      statusPayment: "Đã cọc",
      bookingDate: "2025-07-15",
      startTime: "14:00",
      endTime: "16:00",
      createAt: "2025-07-12T09:30:00",
      action: "Chi tiết",
    },
    {
      orderId: 2,
      bookingId: 102,
      facilityName: "Sân bóng đá Central Park",
      fieldName: "Sân bóng đá số 2",
      customerName: "Trần Thị Hương",
      customerPhone: "0987654321",
      totalPrice: 520000,
      totalServicePrice: 70000,
      contentPayment: "Thanh toán đặt sân bóng đá 7 người + dịch vụ",
      statusPayment: "Đã thanh toán",
      bookingDate: "2025-07-20",
      startTime: "16:00",
      endTime: "18:00",
      createAt: "2025-07-18T14:20:00",
      action: "Chi tiết",
    },
    {
      orderId: 3,
      bookingId: 103,
      facilityName: "Sân tennis Quận 1",
      fieldName: "Sân tennis số 1",
      customerName: "Lê Hoàng Nam",
      customerPhone: "0901234567",
      totalPrice: 380000,
      totalServicePrice: 30000,
      contentPayment: "Thanh toán đặt sân tennis đơn",
      statusPayment: "Đã thanh toán",
      bookingDate: "2025-07-16",
      startTime: "09:00",
      endTime: "10:30",
      createAt: "2025-07-14T16:45:00",
      action: "Chi tiết",
    },
    {
      orderId: 4,
      bookingId: 104,
      facilityName: "Sân bóng rổ Downtown",
      fieldName: "Sân bóng rổ số 1",
      customerName: "Phạm Minh Tuấn",
      customerPhone: "0934567890",
      totalPrice: 320000,
      totalServicePrice: 40000,
      contentPayment: "Thanh toán đặt sân bóng rổ",
      statusPayment: "Chưa thanh toán",
      bookingDate: "2025-07-22",
      startTime: "19:00",
      endTime: "21:00",
      createAt: "2025-07-20T11:15:00",
      action: "Chi tiết",
    },
    {
      orderId: 5,
      bookingId: 105,
      facilityName: "Sân cầu lông Sport Center",
      fieldName: "Sân cầu lông số 3",
      customerName: "Hoàng Thị Lan",
      customerPhone: "0945678901",
      totalPrice: 280000,
      totalServicePrice: 25000,
      contentPayment: "Thanh toán đặt sân cầu lông đôi",
      statusPayment: "Đã cọc",
      bookingDate: "2025-07-25",
      startTime: "18:00",
      endTime: "19:30",
      createAt: "2025-07-23T08:30:00",
      action: "Chi tiết",
    },
    {
      orderId: 6,
      bookingId: 106,
      facilityName: "Sân bóng đá Central Park",
      fieldName: "Sân bóng đá mini số 1",
      customerName: "Đặng Văn Hùng",
      customerPhone: "0967890123",
      totalPrice: 480000,
      totalServicePrice: 60000,
      contentPayment: "Thanh toán đặt sân bóng đá mini",
      statusPayment: "Chưa thanh toán",
      bookingDate: "2025-07-18",
      startTime: "20:00",
      endTime: "22:00",
      createAt: "2025-07-16T13:20:00",
      action: "Chi tiết",
    },
    {
      orderId: 7,
      bookingId: 107,
      facilityName: "Sân tennis Quận 1",
      fieldName: "Sân tennis số 2",
      customerName: "Vũ Thị Mai",
      customerPhone: "0978901234",
      totalPrice: 420000,
      totalServicePrice: 45000,
      contentPayment: "Thanh toán đặt sân tennis đôi",
      statusPayment: "Đã thanh toán",
      bookingDate: "2025-07-21",
      startTime: "15:00",
      endTime: "17:00",
      createAt: "2025-07-19T10:45:00",
      action: "Chi tiết",
    },
    {
      orderId: 8,
      bookingId: 108,
      facilityName: "Sân bóng rổ Downtown",
      fieldName: "Sân bóng rổ số 2",
      customerName: "Ngô Minh Đức",
      customerPhone: "0989012345",
      totalPrice: 360000,
      totalServicePrice: 50000,
      contentPayment: "Thanh toán đặt sân bóng rổ + thiết bị",
      statusPayment: "Đã cọc",
      bookingDate: "2025-07-17",
      startTime: "17:00",
      endTime: "19:00",
      createAt: "2025-07-15T15:30:00",
      action: "Chi tiết",
    },
    {
      orderId: 9,
      bookingId: 109,
      facilityName: "Sân cầu lông Sport Center",
      fieldName: "Sân cầu lông số 1",
      customerName: "Trịnh Văn Khoa",
      customerPhone: "0990123456",
      totalPrice: 300000,
      totalServicePrice: 35000,
      contentPayment: "Thanh toán đặt sân cầu lông đơn",
      statusPayment: "Chưa thanh toán",
      bookingDate: "2025-07-24",
      startTime: "07:00",
      endTime: "09:00",
      createAt: "2025-07-22T09:15:00",
      action: "Chi tiết",
    },
    {
      orderId: 10,
      bookingId: 110,
      facilityName: "Sân bóng đá Central Park",
      fieldName: "Sân bóng đá số 3",
      customerName: "Phan Thị Ngọc",
      customerPhone: "0901345678",
      totalPrice: 550000,
      totalServicePrice: 80000,
      contentPayment: "Thanh toán đặt sân bóng đá 11 người premium",
      statusPayment: "Đã thanh toán",
      bookingDate: "2025-07-26",
      startTime: "10:00",
      endTime: "12:00",
      createAt: "2025-07-24T12:00:00",
      action: "Chi tiết",
    },
  ]);

  // Lấy danh sách unique values cho dropdown filters
  const uniqueFacilities = [
    ...new Set(orders.map((order) => order.facilityName)),
  ];
  const uniqueCustomers = [
    ...new Set(orders.map((order) => order.customerName)),
  ];
  const paymentStatuses = ["Đã thanh toán", "Chưa thanh toán", "Đã cọc"];

  // Apply filters
  const filteredOrders = orders.filter((order) => {
    const matchesFacility =
      !filters.facility || order.facilityName.includes(filters.facility);
    const matchesCustomer =
      !filters.customer || order.customerName.includes(filters.customer);
    const matchesPaymentStatus =
      !filters.paymentStatus || order.statusPayment === filters.paymentStatus;
    const matchesFieldName =
      !fieldName || order.facilityName.includes(fieldName);

    // Price range filter
    let matchesPrice = true;
    if (filters.priceFrom && order.totalPrice < parseInt(filters.priceFrom))
      matchesPrice = false;
    if (filters.priceTo && order.totalPrice > parseInt(filters.priceTo))
      matchesPrice = false;

    return (
      matchesFacility &&
      matchesCustomer &&
      matchesPaymentStatus &&
      matchesFieldName &&
      matchesPrice
    );
  });

  // Tính phân trang
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Đã thanh toán":
        return "bg-green-100 text-green-800";
      case "Chưa thanh toán":
        return "bg-red-100 text-red-800";
      case "Đã cọc":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Toggle dropdown visibility
  const toggleDropdown = (dropdownName: string) => {
    setShowDropdowns((prev) => ({
      ...prev,
      [dropdownName]: !prev[dropdownName],
    }));
  };

  // Update payment status
  const updatePaymentStatus = (orderId: number, newStatus: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.orderId === orderId
          ? { ...order, statusPayment: newStatus }
          : order
      )
    );
  };

  // Open order detail modal
  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  // Get detailed order information (mock data based on real database structure)
  const getOrderDetail = (order: Order): OrderDetail => {
    // Mock services data based on real database
    const mockServices: OrderServiceDetail[] = [
      { serviceId: 1, serviceName: "Thuê bóng đá", price: 30000, quantity: 1 },
      { serviceId: 2, serviceName: "Nước uống", price: 15000, quantity: 2 },
      { serviceId: 3, serviceName: "Khăn lạnh", price: 10000, quantity: 1 },
    ];

    return {
      orderId: order.orderId,
      bookingId: order.bookingId,
      facilityName: order.facilityName,
      fieldName: order.fieldName,
      categoryFieldName: order.facilityName.includes("tennis")
        ? "Sân Tennis"
        : order.facilityName.includes("bóng rổ")
        ? "Sân Bóng rổ"
        : order.facilityName.includes("cầu lông")
        ? "Sân Cầu lông"
        : "Sân Bóng đá",
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: `${order.customerName
        .toLowerCase()
        .replace(/\s+/g, "")}@email.com`,
      totalPrice: order.totalPrice,
      totalServicePrice: order.totalServicePrice,
      fieldRentalPrice: order.totalPrice - order.totalServicePrice,
      discountAmount: 0,
      deposit: Math.round(order.totalPrice * 0.3), // 30% deposit
      contentPayment: order.contentPayment,
      statusPayment: order.statusPayment,
      paymentMethod: "Chuyển khoản ngân hàng",
      bookingDate: order.bookingDate,
      startTime: order.startTime,
      endTime: order.endTime,
      bookingTitle: `Đặt ${order.fieldName}`,
      bookingStatus: "Đã xác nhận",
      services: mockServices,
      createAt: new Date(order.createAt).toLocaleString("vi-VN"),
      bookingCreateAt: new Date(
        new Date(order.createAt).getTime() - 24 * 60 * 60 * 1000
      ).toLocaleString("vi-VN"), // 1 day before order
    };
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".dropdown-container")) {
        setShowDropdowns({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      facility: "",
      customer: "",
      priceFrom: "",
      priceTo: "",
      paymentStatus: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pl-64 pt-8 pr-6">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Quản lý đơn đặt sân
                  {fieldName && (
                    <span className="text-blue-600 ml-2">- {fieldName}</span>
                  )}
                </h1>
                <p className="text-gray-600 text-sm">
                  Quản lý và theo dõi tất cả đơn đặt sân của hệ thống
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                  <span className="text-blue-700 font-medium text-sm">
                    Tổng: {filteredOrders.length} đơn
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Bộ lọc tìm kiếm
              </h3>
              {(filters.facility ||
                filters.customer ||
                filters.priceFrom ||
                filters.priceTo ||
                filters.paymentStatus ||
                filters.dateFrom ||
                filters.dateTo) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 hover:bg-red-100 transition-colors duration-200 text-sm font-medium"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span>Xóa bộ lọc</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Facility Filter */}
              <div className="relative dropdown-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cơ sở
                </label>
                <button
                  onClick={() => toggleDropdown("facility")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 cursor-pointer flex items-center justify-between bg-white transition-all duration-200"
                >
                  <span className="text-gray-900">
                    {filters.facility || "Chọn cơ sở"}
                  </span>
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showDropdowns.facility && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-30 min-w-full max-w-sm">
                    <div className="p-3">
                      <input
                        type="text"
                        placeholder="Tìm kiếm cơ sở..."
                        value={filters.facility}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            facility: e.target.value,
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                      <div className="mt-2 max-h-48 overflow-y-auto">
                        <div
                          onClick={() => {
                            setFilters((prev) => ({ ...prev, facility: "" }));
                            toggleDropdown("facility");
                          }}
                          className="p-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-500 border-b border-gray-100"
                        >
                          Tất cả cơ sở
                        </div>
                        {uniqueFacilities.map((facility, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              setFilters((prev) => ({ ...prev, facility }));
                              toggleDropdown("facility");
                            }}
                            className="p-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 hover:text-blue-600"
                          >
                            {facility}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Filter */}
              <div className="relative dropdown-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khách hàng
                </label>
                <button
                  onClick={() => toggleDropdown("customer")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 cursor-pointer flex items-center justify-between bg-white transition-all duration-200"
                >
                  <span className="text-gray-900">
                    {filters.customer || "Chọn khách hàng"}
                  </span>
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showDropdowns.customer && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-30 min-w-full max-w-sm">
                    <div className="p-3">
                      <input
                        type="text"
                        placeholder="Tìm kiếm khách hàng..."
                        value={filters.customer}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            customer: e.target.value,
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                      <div className="mt-2 max-h-48 overflow-y-auto">
                        <div
                          onClick={() => {
                            setFilters((prev) => ({ ...prev, customer: "" }));
                            toggleDropdown("customer");
                          }}
                          className="p-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-500 border-b border-gray-100"
                        >
                          Tất cả khách hàng
                        </div>
                        {uniqueCustomers.map((customer, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              setFilters((prev) => ({ ...prev, customer }));
                              toggleDropdown("customer");
                            }}
                            className="p-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 hover:text-blue-600"
                          >
                            {customer}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Filter */}
              <div className="relative dropdown-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khoảng giá
                </label>
                <button
                  onClick={() => toggleDropdown("price")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 cursor-pointer flex items-center justify-between bg-white transition-all duration-200"
                >
                  <span className="text-gray-900">
                    {filters.priceFrom || filters.priceTo
                      ? `${filters.priceFrom || "0"} - ${
                          filters.priceTo || "∞"
                        }`
                      : "Chọn khoảng giá"}
                  </span>
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showDropdowns.price && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-30 min-w-full max-w-sm">
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Từ (VND)
                          </label>
                          <input
                            type="number"
                            placeholder="0"
                            value={filters.priceFrom}
                            onChange={(e) =>
                              setFilters((prev) => ({
                                ...prev,
                                priceFrom: e.target.value,
                              }))
                            }
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            title="Giá từ"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Đến (VND)
                          </label>
                          <input
                            type="number"
                            placeholder="1000000"
                            value={filters.priceTo}
                            onChange={(e) =>
                              setFilters((prev) => ({
                                ...prev,
                                priceTo: e.target.value,
                              }))
                            }
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            title="Giá đến"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => toggleDropdown("price")}
                        className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                      >
                        Áp dụng
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Status Filter */}
              <div className="relative dropdown-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái thanh toán
                </label>
                <button
                  onClick={() => toggleDropdown("paymentStatus")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 cursor-pointer flex items-center justify-between bg-white transition-all duration-200"
                >
                  <span className="text-gray-900">
                    {filters.paymentStatus || "Chọn trạng thái"}
                  </span>
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showDropdowns.paymentStatus && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-30 min-w-full max-w-sm">
                    <div className="p-2">
                      <div
                        onClick={() => {
                          setFilters((prev) => ({
                            ...prev,
                            paymentStatus: "",
                          }));
                          toggleDropdown("paymentStatus");
                        }}
                        className="p-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-500 border-b border-gray-100"
                      >
                        Tất cả trạng thái
                      </div>
                      {paymentStatuses.map((status, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setFilters((prev) => ({
                              ...prev,
                              paymentStatus: status,
                            }));
                            toggleDropdown("paymentStatus");
                          }}
                          className="p-2 hover:bg-blue-50 cursor-pointer text-sm flex items-center text-gray-700 hover:text-blue-600"
                        >
                          <span
                            className={`inline-block w-3 h-3 rounded-full mr-3 ${
                              getPaymentStatusColor(status).split(" ")[0]
                            }`}
                          ></span>
                          {status}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Date Filter */}
              <div className="relative dropdown-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khoảng thời gian
                </label>
                <button
                  onClick={() => toggleDropdown("date")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 cursor-pointer flex items-center justify-between bg-white transition-all duration-200"
                >
                  <span className="text-gray-900">
                    {filters.dateFrom || filters.dateTo
                      ? `${filters.dateFrom || "..."} - ${
                          filters.dateTo || "..."
                        }`
                      : "Chọn thời gian"}
                  </span>
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showDropdowns.date && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-30 min-w-full max-w-sm">
                    <div className="p-4">
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Từ ngày
                          </label>
                          <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) =>
                              setFilters((prev) => ({
                                ...prev,
                                dateFrom: e.target.value,
                              }))
                            }
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            title="Ngày từ"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Đến ngày
                          </label>
                          <input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) =>
                              setFilters((prev) => ({
                                ...prev,
                                dateTo: e.target.value,
                              }))
                            }
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            title="Ngày đến"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => toggleDropdown("date")}
                        className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                      >
                        Áp dụng
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                Danh sách đơn đặt sân
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-green-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider whitespace-nowrap">
                      STT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider whitespace-nowrap">
                      Mã đơn
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider whitespace-nowrap">
                      Cơ sở / Sân
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider whitespace-nowrap">
                      Khách hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider whitespace-nowrap">
                      Thời gian đặt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider whitespace-nowrap">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider whitespace-nowrap">
                      Trạng thái thanh toán
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider whitespace-nowrap">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedOrders.map((order, index) => (
                    <tr
                      key={order.orderId}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.orderId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                        #{order.bookingId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">
                            {order.facilityName}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {order.fieldName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">
                            {order.customerName}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {order.customerPhone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">
                            {new Date(order.bookingDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {order.startTime} - {order.endTime}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div>
                          <div className="text-blue-600">
                            {order.totalPrice.toLocaleString()}đ
                          </div>
                          <div className="text-gray-500 text-xs">
                            DV: {order.totalServicePrice.toLocaleString()}đ
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative dropdown-container">
                          <button
                            onClick={() =>
                              toggleDropdown(`paymentStatus_${order.orderId}`)
                            }
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:shadow-md ${getPaymentStatusColor(
                              order.statusPayment
                            )}`}
                          >
                            {order.statusPayment}
                            <svg
                              className="w-3 h-3 ml-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                          {showDropdowns[`paymentStatus_${order.orderId}`] && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-20 min-w-40">
                              <div className="py-1">
                                {paymentStatuses.map((status, statusIndex) => (
                                  <div
                                    key={statusIndex}
                                    onClick={() => {
                                      updatePaymentStatus(
                                        order.orderId,
                                        status
                                      );
                                      toggleDropdown(
                                        `paymentStatus_${order.orderId}`
                                      );
                                    }}
                                    className={`px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm flex items-center transition-colors duration-200 ${
                                      status === order.statusPayment
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-700 hover:text-blue-600"
                                    }`}
                                  >
                                    <span
                                      className={`inline-block w-2 h-2 rounded-full mr-3 ${
                                        getPaymentStatusColor(status).split(
                                          " "
                                        )[0]
                                      }`}
                                    ></span>
                                    {status}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => openOrderDetail(order)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                          <svg
                            className="w-3 h-3 mr-1"
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
                          {order.action}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  Hiển thị{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * ordersPerPage + 1}
                  </span>{" "}
                  đến{" "}
                  <span className="font-medium">
                    {Math.min(
                      currentPage * ordersPerPage,
                      filteredOrders.length
                    )}
                  </span>{" "}
                  của{" "}
                  <span className="font-medium">{filteredOrders.length}</span>{" "}
                  kết quả
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {/* Items per page selector */}
                <div className="flex items-center space-x-2">
                  <label
                    htmlFor="ordersPerPage"
                    className="text-sm font-medium text-gray-700"
                  >
                    Hiển thị:
                  </label>
                  <select
                    id="ordersPerPage"
                    value={ordersPerPage}
                    onChange={(e) => {
                      setOrdersPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                {/* Pagination controls */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg border ${
                      currentPage === 1
                        ? "text-gray-400 border-gray-200 cursor-not-allowed"
                        : "text-gray-700 border-gray-300 hover:bg-gray-50"
                    } transition-colors duration-200`}
                    aria-label="Trang đầu"
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
                        d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg border ${
                      currentPage === 1
                        ? "text-gray-400 border-gray-200 cursor-not-allowed"
                        : "text-gray-700 border-gray-300 hover:bg-gray-50"
                    } transition-colors duration-200`}
                    aria-label="Trang trước"
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
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`w-8 h-8 rounded-lg border text-sm font-medium transition-colors duration-200 ${
                            pageNumber === currentPage
                              ? "bg-blue-600 text-white border-blue-600"
                              : "text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg border ${
                      currentPage === totalPages
                        ? "text-gray-400 border-gray-200 cursor-not-allowed"
                        : "text-gray-700 border-gray-300 hover:bg-gray-50"
                    } transition-colors duration-200`}
                    aria-label="Trang tiếp"
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg border ${
                      currentPage === totalPages
                        ? "text-gray-400 border-gray-200 cursor-not-allowed"
                        : "text-gray-700 border-gray-300 hover:bg-gray-50"
                    } transition-colors duration-200`}
                    aria-label="Trang cuối"
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
                        d="M13 5l7 7-7 7M5 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Chi tiết đơn đặt sân</h2>
                  <p className="text-blue-100 text-sm">
                    Đơn hàng #{selectedOrder.orderId}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  title="Đóng modal"
                  className="text-white hover:text-gray-200 transition-colors duration-200"
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

            {/* Modal Body */}
            <div className="p-6">
              {(() => {
                const orderDetail = getOrderDetail(selectedOrder);
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Order Information */}
                    <div className="space-y-6">
                      {/* Basic Info */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2 text-blue-600"
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
                          Thông tin đơn hàng
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Mã đơn hàng:</span>
                            <span className="font-medium">
                              #{orderDetail.orderId}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Mã booking:</span>
                            <span className="font-medium">
                              #{orderDetail.bookingId}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Ngày tạo đơn:</span>
                            <span className="font-medium">
                              {orderDetail.createAt}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Ngày tạo booking:
                            </span>
                            <span className="font-medium">
                              {orderDetail.bookingCreateAt}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Ngày đặt sân:</span>
                            <span className="font-medium">
                              {new Date(
                                orderDetail.bookingDate
                              ).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Thời gian sân:
                            </span>
                            <span className="font-medium">
                              {orderDetail.startTime} - {orderDetail.endTime}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Trạng thái booking:
                            </span>
                            <span className="font-medium text-green-600">
                              {orderDetail.bookingStatus}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          Thông tin khách hàng
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Họ tên:</span>
                            <span className="font-medium">
                              {orderDetail.customerName}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Số điện thoại:
                            </span>
                            <span className="font-medium">
                              {orderDetail.customerPhone}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">
                              {orderDetail.customerEmail}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Booking Info */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v1a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 21h14a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2z"
                            />
                          </svg>
                          Thông tin booking
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Mã booking:</span>
                            <span className="font-medium text-blue-600">
                              #{orderDetail.bookingId}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Tiêu đề booking:
                            </span>
                            <span className="font-medium">
                              {orderDetail.bookingTitle}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Ngày tạo booking:
                            </span>
                            <span className="font-medium">
                              {orderDetail.bookingCreateAt}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Trạng thái booking:
                            </span>
                            <span className="font-medium text-green-600">
                              {orderDetail.bookingStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Facility & Payment Info */}
                    <div className="space-y-6">
                      {/* Facility Info */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2 text-purple-600"
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
                          Thông tin sân
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cơ sở:</span>
                            <span className="font-medium">
                              {orderDetail.facilityName}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tên sân:</span>
                            <span className="font-medium">
                              {orderDetail.fieldName}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Loại sân:</span>
                            <span className="font-medium">
                              {orderDetail.categoryFieldName}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Services */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2 text-indigo-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h2m0-13v13m0-13c.789 0 1.456.602 1.52 1.359l.05.641H18m-.08 13.879C17.856 21.398 17.189 22 16.4 22H9m7-13c-.041-.789-.607-1.456-1.359-1.52L14 7.5H9.6m7.4 0c.789 0 1.456.602 1.52 1.359l.05.641H21m-2 13.879C18.856 21.398 18.189 22 17.4 22h-2"
                            />
                          </svg>
                          Dịch vụ đi kèm
                        </h3>
                        <div className="space-y-2">
                          {orderDetail.services.map((service, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center">
                                <svg
                                  className="w-4 h-4 text-green-500 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <span className="text-gray-700">
                                  {service.serviceName}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                {service.quantity}x{" "}
                                {service.price.toLocaleString()}đ
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2 text-orange-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          Thông tin thanh toán
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Giá thuê sân:</span>
                            <span className="font-medium">
                              {orderDetail.fieldRentalPrice.toLocaleString()}đ
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tiền dịch vụ:</span>
                            <span className="font-medium">
                              {orderDetail.totalServicePrice.toLocaleString()}đ
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Giảm giá:</span>
                            <span className="font-medium text-red-600">
                              -{orderDetail.discountAmount.toLocaleString()}đ
                            </span>
                          </div>
                          <div className="border-t pt-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tổng tiền:</span>
                              <span className="font-bold text-lg text-blue-600">
                                {orderDetail.totalPrice.toLocaleString()}đ
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Đã cọc:</span>
                            <span className="font-medium text-green-600">
                              {orderDetail.deposit.toLocaleString()}đ
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Trạng thái:</span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                                orderDetail.statusPayment
                              )}`}
                            >
                              {orderDetail.statusPayment}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phương thức:</span>
                            <span className="font-medium">
                              {orderDetail.paymentMethod}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nội dung:</span>
                            <span className="font-medium text-sm">
                              {orderDetail.contentPayment}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrdersTable;
