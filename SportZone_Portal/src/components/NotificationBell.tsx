import React, { useEffect, useState } from "react";

interface Notification {
  notiId: number;
  content: string;
  isRead: boolean;
}

interface NotificationBellProps {
  userId: number;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = React.useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/Notification/user/${userId}`, {
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      const arr = Array.isArray(data)
        ? data
        : data.success && Array.isArray(data.data)
        ? data.data
        : [];
      const notifications: Notification[] = arr.map(
        (item: { notiId: number; content?: string; isRead?: boolean }) => ({
          notiId: item.notiId,
          content: item.content ?? "",
          isRead: item.isRead ?? false,
        })
      );
      setNotifications(notifications);
    } catch {
      setNotifications([]);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) fetchNotifications();
  }, [userId, fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (notiId: number | undefined) => {
    if (typeof notiId !== "number" || isNaN(notiId)) return;
    const token = localStorage.getItem("token");
    await fetch(`/api/Notification/mark-as-read/${notiId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    setNotifications((prev) =>
      prev.map((n) => (n.notiId === notiId ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem("token");
    await fetch(`/api/Notification/mark-all-as-read/${userId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = async (notiId: number | undefined) => {
    if (typeof notiId !== "number" || isNaN(notiId)) return;
    const token = localStorage.getItem("token");
    await fetch(`/api/Notification/${notiId}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    setNotifications((prev) => prev.filter((n) => n.notiId !== notiId));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="text-white hover:text-[#1ebd6f]"
      >
        <span className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </span>
      </button>
      {showNotifications && (
        <div className="absolute right-0 mt-3 w-80 bg-white text-[#333] rounded-2xl shadow-2xl z-50 border border-gray-200 animate-fadeInUp">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-green-50 to-green-100 rounded-t-2xl">
            <span className="font-semibold text-green-700 text-base">
              Thông báo
            </span>
            <span className="text-xs text-gray-400">{unreadCount} mới</span>
            <button
              className="ml-2 text-green-500 hover:text-green-700 p-1 rounded-full text-xs border border-green-200"
              onClick={markAllAsRead}
              title="Đánh dấu tất cả đã đọc"
            >
              Đọc tất cả
            </button>
          </div>
          <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              <li className="px-5 py-6 text-center text-gray-400 text-sm">
                Đang tải...
              </li>
            ) : notifications.length === 0 ? (
              <li className="px-5 py-6 text-center text-gray-400 text-sm">
                Không có thông báo mới
              </li>
            ) : (
              notifications.map((noti, idx) => {
                const validId =
                  typeof noti.notiId === "number" && !isNaN(noti.notiId);
                return (
                  <li
                    key={validId ? noti.notiId : `noti-${idx}`}
                    className={`px-5 py-3 flex items-center gap-2 group ${
                      noti.isRead ? "opacity-60" : ""
                    }`}
                  >
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="flex-1 text-sm text-gray-800">
                      {noti.content}
                    </span>
                    {!noti.isRead && validId && (
                      <button
                        className="ml-2 text-green-500 hover:text-green-700 p-1 rounded-full transition-colors"
                        title="Đánh dấu đã đọc"
                        onClick={() => markAsRead(noti.notiId)}
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
                    )}
                    {validId && (
                      <button
                        className="ml-2 text-red-500 hover:text-red-700 p-1 rounded-full transition-colors"
                        title="Xóa thông báo"
                        onClick={() => deleteNotification(noti.notiId)}
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
