import { setCurrentChat } from "@/store/slices/currentChatSlice";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

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
        console.log("Setting loading to true...");
        setLoading(true);

        Promise.all([fetchNotifications(), fetchNotificationsForMessages()])
            .then(() => {
                console.log("Setting loading to false...");
                setLoading(false);

                const modalElement = document.getElementById("notificationModal");
                modalElement.classList.add("translate-x-full");
                setTimeout(() => {
                    modalElement.classList.remove("translate-x-full");
                    modalElement.classList.add("translate-x-0");
                }, 10);
            })
            .catch((error) => {
                console.error("Error in Promise.all:", error);
                setLoading(false);
            });
    }, [fetchNotifications, fetchNotificationsForMessages]);

    const closeModal = () => {
        const modalElement = document.getElementById("notificationModal");
        modalElement.classList.remove("translate-x-0");
        modalElement.classList.add("translate-x-full");
        setTimeout(() => {
            turnNotificationsToOff();
        }, 500);
    };

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

    // Combine and sort notifications by time
    const allNotifications = [...notifications, ...notificationForMessages].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    return (
        <div
            id="notificationModal"
            className="fixed right-0 top-0 mt-4 mr-4 z-50 max-w-sm w-full transform transition-transform duration-500 ease-in-out translate-x-full"
        >
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="px-4 py-2 flex justify-between items-center border-b border-gray-300">
                    <h3 className="text-xl sm:text-2xl font-semibold text-black">Notifications</h3>
                    <FontAwesomeIcon
                        icon={faTimes}
                        className="text-gray-500 cursor-pointer hover:text-gray-800"
                        onClick={closeModal}
                    />
                </div>
                <div className="p-4">
                    {loading ? (
                        <p className="text-gray-600 text-xs sm:text-sm">Loading notifications...</p>
                    ) : allNotifications.length === 0 ? (
                        <p className="text-gray-600 text-xs sm:text-sm">No notifications to show</p>
                    ) : (
                        allNotifications.map((notification) => (
                            <div
                                key={notification.notification_id}
                                onClick={() => handleSpecificClickForChat(notification)}
                                className="mb-4 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors duration-200"
                            >
                                <div className="flex items-center">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800 text-sm sm:text-base">
                                            {notification.name ? notification.name + ":" : null}
                                            {notification.content}
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {formatRelativeTime(new Date(notification.created_at))}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
