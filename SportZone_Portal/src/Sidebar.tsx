import {
  Bell,
  Building2,
  ClipboardList,
  Home,
  User2,
  Users,
  FileText,
  LogOut,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface User {
  UId: number;
  RoleId: number;
  UEmail: string;
  UStatus?: string;
  UCreateDate?: string;
  IsExternalLogin?: boolean;
  IsVerify?: boolean;
  Admin?: unknown;
  Customer?: unknown;
  FieldOwner?: unknown;
  Staff?: unknown;
  Role?: unknown;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const isActive = (path: string) => location.pathname === path;

  const linkClasses = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition h-11 ${
      isActive(path)
        ? "bg-[#1ebd6f] text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Đơn đặt sân mới #456" },
    { id: 2, text: "Thanh toán hoàn thành #789" },
    { id: 3, text: "Yêu cầu hủy đặt sân #123" },
  ]);
  const unreadNotifications = notifications.length;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log("User loaded:", parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const isAdmin = user?.RoleId === 3;
  const isFieldOwner = user?.RoleId === 2;
  const isStaff = user?.RoleId === 4;

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-50 flex flex-col">
      {/* User Info Header */}
      <div className="p-4 border-b border-gray-200 bg-green-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.UEmail?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            </div>
            <div className="text-white">
              <div className="text-sm font-medium">
                {user?.UEmail?.split("@")[0] || "Người dùng"}
              </div>
              <div className="text-xs text-green-100">
                {user?.RoleId === 3
                  ? "Admin"
                  : user?.RoleId === 2
                  ? "Chủ sân"
                  : user?.RoleId === 4
                  ? "Nhân viên"
                  : "Người dùng"}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-white hover:text-green-100 p-1 rounded transition-colors"
            title="Đăng xuất"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex flex-col gap-1 px-2 py-4 flex-1 overflow-y-auto">
        <Link to="/" className={linkClasses("/")}>
          <Home size={18} /> Trang chủ
        </Link>

        {isAdmin && (
          <>
            <Link to="/users_manager" className={linkClasses("/users_manager")}>
              <Users size={18} /> Quản lý tài khoản
            </Link>
            <Link
              to="/regulation_manager"
              className={linkClasses("/regulation_manager")}
            >
              <FileText size={18} /> Quản lý quy định
            </Link>
          </>
        )}

        {/* Menu cho Field Owner (Role 2) */}
        {isFieldOwner && (
          <>
            <Link
              to="/facility_manager"
              className={linkClasses("/facility_manager")}
            >
              <Building2 size={18} /> Cơ sở
            </Link>
            <Link to="/staff_manager" className={linkClasses("/staff_manager")}>
              <User2 size={18} /> Nhân viên
            </Link>
            <Link
              to="/finance_manager"
              className={linkClasses("/finance_manager")}
            >
              <ClipboardList size={18} /> Quản lý tài chính
            </Link>
            {/* <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`${linkClasses("/notifications")} w-full text-left`}
              >
                <Bell size={18} /> Thông báo
                {unreadNotifications > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="fixed top-24 left-72 right-4 w-[320px] min-w-[260px] max-w-[90vw] bg-white border border-gray-200 rounded-2xl shadow-2xl z-[9999] animate-fadeInUp overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-green-50 to-green-100 rounded-t-2xl">
                    <span className="font-semibold text-green-700 text-base">
                      Thông báo field owner
                    </span>
                    <span className="text-xs text-gray-400">
                      {unreadNotifications} mới
                    </span>
                  </div>
                  <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                    {notifications.length === 0 ? (
                      <li className="px-5 py-6 text-center text-gray-400 text-sm">
                        Không có thông báo mới
                      </li>
                    ) : (
                      notifications.map((noti) => (
                        <li
                          key={noti.id}
                          className="px-5 py-3 hover:bg-green-50 transition-colors flex items-center gap-2 group"
                        >
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="flex-1 text-sm text-gray-800">
                            {noti.text}
                          </span>
                          <button
                            className="ml-2 text-green-500 hover:text-green-700 p-1 rounded-full transition-colors"
                            title="Đánh dấu đã đọc"
                            onClick={() =>
                              setNotifications(
                                notifications.filter((n) => n.id !== noti.id)
                              )
                            }
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div> */}
            <Link to="/order_manager" className={linkClasses("/order_manager")}>
              <ClipboardList size={18} /> Đơn đặt
            </Link>
          </>
        )}

        {isStaff && (
          <>
            <Link
              to="/facility_manager"
              className={linkClasses("/facility_manager")}
            >
              <Building2 size={18} /> Cơ sở
            </Link>
            <Link to="/order_manager" className={linkClasses("/order_manager")}>
              <ClipboardList size={18} /> Đơn đặt
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
