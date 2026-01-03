import { setCurrentChat } from "@/store/slices/currentChatSlice";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

// SVG Icons
const Icons = {
  Close: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Bell: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Message: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  Info: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Empty: () => (
    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
};

const Notifications = ({ turnNotificationsToOff }) => {
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState([]);
  const [notificationForMessages, setNotificationForMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const userData = useSelector((state) => state.userData.value);
  const role = userData.role;
  const id = userData.user_id;
  const router = useRouter();

  const handleSpecificClickForChat = (notification) => {
    if (notification.chat_id) {
      dispatch(setCurrentChat(notification.chat_id));
      router.push("/chat");
      turnNotificationsToOff();
    }
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(`/api/notifications?role=${role}&id=${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications.");
      }

      const data = await response.json();
      setNotifications(data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [role, id]);

  const fetchNotificationsForMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/notification_for_messages?role=${role}&id=${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch message notifications.");
      }

      const data = await response.json();
      setNotificationForMessages(data.notifications);
    } catch (error) {
      console.error("Error fetching message notifications:", error);
    }
  }, [role, id]);

  useEffect(() => {
    setLoading(true);

    Promise.all([fetchNotifications(), fetchNotificationsForMessages()])
      .then(() => {
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error in Promise.all:", error);
        setLoading(false);
      });
  }, [fetchNotifications, fetchNotificationsForMessages]);

  const formatRelativeTime = (date) => {
    const now = new Date();
    const elapsed = date - now;

    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(elapsed / (1000 * 60));
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));

    const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    if (Math.abs(days) > 0) {
      return formatter.format(days, "day");
    } else if (Math.abs(hours) > 0) {
      return formatter.format(hours, "hour");
    } else if (Math.abs(minutes) > 0) {
      return formatter.format(minutes, "minute");
    } else {
      return formatter.format(seconds, "second");
    }
  };

  const getNotificationIcon = (notification) => {
    if (notification.chat_id) {
      return (
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
          <Icons.Message />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
        <Icons.Info />
      </div>
    );
  };

  // Combine and sort notifications by time
  const allNotifications = [...notifications, ...notificationForMessages].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={turnNotificationsToOff}
      />

      {/* Notification Panel */}
      <div className="fixed right-4 top-20 z-50 w-full max-w-sm animate-in slide-in-from-right duration-300">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Icons.Bell />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Notifications</h3>
                <p className="text-emerald-100 text-xs">
                  {allNotifications.length} {allNotifications.length === 1 ? 'notification' : 'notifications'}
                </p>
              </div>
            </div>
            <button
              onClick={turnNotificationsToOff}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-colors"
            >
              <Icons.Close />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-3" />
                <p className="text-gray-500 text-sm">Loading notifications...</p>
              </div>
            ) : allNotifications.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center">
                <Icons.Empty />
                <p className="text-gray-500 text-sm mt-3">No notifications yet</p>
                <p className="text-gray-400 text-xs mt-1">We&apos;ll notify you when something arrives</p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {allNotifications.map((notification, index) => (
                  <div
                    key={notification.notification_id || index}
                    onClick={() => handleSpecificClickForChat(notification)}
                    className={`group p-4 rounded-xl transition-all duration-300 ${
                      notification.chat_id
                        ? "bg-blue-50 hover:bg-blue-100 cursor-pointer"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            {notification.name && (
                              <p className="font-semibold text-gray-800 text-sm truncate">
                                {notification.name}
                              </p>
                            )}
                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                              {notification.content}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {formatRelativeTime(new Date(notification.created_at))}
                          </span>
                          {notification.chat_id && (
                            <span className="text-xs text-blue-500 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              Open chat
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {allNotifications.length > 0 && (
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
              <button className="w-full py-2 text-sm text-emerald-600 font-medium hover:text-emerald-700 transition-colors flex items-center justify-center gap-1">
                <Icons.Check />
                Mark all as read
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Notifications;
