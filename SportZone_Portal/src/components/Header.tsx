/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useRef, useState } from "react";
import NotificationBell from "./NotificationBell";
import { useNavigate } from "react-router-dom";

// Types
interface ExternalLogin {
  Id: number;
  UId: number;
  ExternalProvider: string;
  ExternalUserId: string;
  AccessToken: string;
}

interface User {
  UId: number;
  RoleId: number;
  UEmail: string;
  UStatus: string;
  UCreateDate: string;
  IsExternalLogin: boolean;
  IsVerify: boolean;
  Admin: null | any;
  Customers: any[];
  ExternalLogins: ExternalLogin[];
  FieldOwner: null | any;
  Notifications: any[];
  Role: null | any;
  Staff: null | any;
  avatarUrl?: string;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  // Notification state đã chuyển sang NotificationBell

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const transformedUser: User = {
          UId: parsedUser.uId || parsedUser.UId,
          RoleId: parsedUser.roleId || parsedUser.RoleId,
          UEmail: parsedUser.uEmail || parsedUser.UEmail,
          UStatus: parsedUser.uStatus || parsedUser.UStatus || "Active",
          UCreateDate:
            parsedUser.uCreateDate ||
            parsedUser.UCreateDate ||
            new Date().toISOString(),
          IsExternalLogin: parsedUser.isExternalLogin ?? false,
          IsVerify: parsedUser.isVerify ?? false,
          Admin: parsedUser.Admin ?? null,
          Customers: parsedUser.Customers ?? [],
          ExternalLogins: parsedUser.ExternalLogins ?? [],
          FieldOwner: parsedUser.FieldOwner ?? null,
          Notifications:
            parsedUser.notifications ?? parsedUser.Notifications ?? [],
          Role: parsedUser.Role ?? null,
          Staff: parsedUser.Staff ?? null,
          avatarUrl:
            parsedUser.avatarUrl ||
            "https://www.vietnamworks.com/hrinsider/wp-content/uploads/2023/12/anh-den-ngau.jpeg",
        };

        if (transformedUser.UId && transformedUser.UEmail) {
          setUser(transformedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        setUser(null);
      }
    }
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <header className="bg-[#1a3c34] text-white shadow-md sticky top-0 z-50 py-4 px-6 font-inter">
      <nav className="flex items-center justify-between flex-wrap">
        <div className="font-bold text-2xl text-[#1ebd6f] flex items-center gap-2">
          <a href="/homepage">
            <span>⚽</span> SportZone
          </a>
        </div>
        <div className="hidden md:flex items-center gap-8 ml-12 flex-grow">
          <a href="/homepage" className="text-white hover:text-[#1ebd6f]">
            Trang chủ
          </a>
          <a href="/field_list" className="text-white hover:text-[#1ebd6f]">
            Danh sách sân
          </a>
          {user && (
            <a
              href="/booking-history"
              className="text-white hover:text-[#1ebd6f]"
            >
              Lịch sử đặt sân
            </a>
          )}
          {user &&
            (user.RoleId === 2 || user.RoleId === 3 || user.RoleId === 4) && (
              <a
                href={
                  user.RoleId === 3 ? "/users_manager" : "/facility_manager"
                }
                className="text-white hover:text-[#1ebd6f]"
              >
                {user.RoleId === 3 ? "Quản lý admin" : "Quản lý cơ sở"}
              </a>
            )}
        </div>

        <div className="flex items-center gap-4 relative">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchValue.trim()) {
                navigate(
                  `/field_list?search=${encodeURIComponent(searchValue.trim())}`
                );
              } else {
                navigate("/field_list");
              }
            }}
            className="relative w-64"
            role="search"
          >
            <input
              type="text"
              placeholder="Tìm sân bóng..."
              className="w-full px-4 py-2 pr-2 rounded-md border text-sm text-gray-900 placeholder-gray-400 bg-white focus:ring-2 focus:ring-[#1ebd6f]"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#1ebd6f] text-white rounded-md p-2 hover:bg-[#159e5a] flex items-center focus:outline-none focus:ring-2 focus:ring-[#1ebd6f]"
              title="Tìm kiếm"
              style={{ height: "32px", width: "32px" }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4-4m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>

          {!user ? (
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 border border-[#1ebd6f] text-[#1ebd6f] rounded hover:bg-[#e6f6ef]"
            >
              Đăng nhập
            </button>
          ) : (
            <div className="flex items-center gap-4 relative">
              {/* Notification bell component */}
              {user && <NotificationBell userId={user.UId} />}

              {/* Profile dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                >
                  <img
                    src={user.avatarUrl}
                    alt="avatar"
                    className="w-9 h-9 rounded-full border"
                  />
                  <span className="text-sm font-medium">{user.UEmail}</span>
                </div>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 bg-white text-[#333] rounded shadow-md w-48 z-50">
                    {/* Đã chuyển Lịch sử đặt sân ra navbar */}
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowProfileMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-red-500 hover:bg-[#fbeaea]"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
