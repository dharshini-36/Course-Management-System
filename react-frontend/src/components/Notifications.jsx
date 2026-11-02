import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import { createSocket } from "../api/socketClient";

function timeAgo(iso) {
    const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString();
}

// Live notifications from the backend (chat messages etc.).
// This is a small COMPONENT. The full page lives in pages/Notifications.jsx
// and imports this file - this file must never import the page.
export default function LiveNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        apiClient
            .get("/notifications")
            .then((response) => setNotifications(response.data.notifications))
            .catch(() => setError("Could not load live notifications."));

        const socket = createSocket();

        socket.on("new_notification", (notification) => {
            setNotifications((previous) =>
                previous.some((item) => item._id === notification._id)
                    ? previous
                    : [notification, ...previous]
            );
        });

        socket.connect();

        return () => {
            socket.disconnect();
        };
    }, []);

    async function markRead(notification) {
        if (notification.isRead) return;

        try {
            await apiClient.patch(`/notifications/${notification._id}/read`);
            setNotifications((previous) =>
                previous.map((item) =>
                    item._id === notification._id ? { ...item, isRead: true } : item
                )
            );
        } catch {
            setError("Could not mark the notification as read.");
        }
    }

    const unread = notifications.filter((item) => !item.isRead).length;

    return (
        <>
            <div className="db-section-header">
                <h2>
                    <i className="fa-solid fa-comments"></i>
                    Live Notifications
                    {unread > 0 && <span className="notif-dot" style={{ marginLeft: 8 }}></span>}
                </h2>
            </div>

            {error && (
                <p role="alert" style={{ color: "#b91c1c", margin: "8px 0" }}>
                    {error}
                </p>
            )}

            {notifications.length === 0 ? (
                <div className="db-empty-state">
                    <div className="db-empty-icon">
                        <i className="fa-solid fa-bell-slash"></i>
                    </div>
                    <h3>No live notifications yet</h3>
                    <p>New chat messages will show up here instantly.</p>
                </div>
            ) : (
                notifications.map((item) => (
                    <div
                        key={item._id}
                        className={`db-course-item notif-item ${!item.isRead ? "notif-item--unread" : ""}`}
                        style={{ cursor: item.isRead ? "default" : "pointer" }}
                        onClick={() => markRead(item)}
                    >
                        <div className="db-course-item-left">
                            <div className="db-course-item-icon">
                                <i className="fa-solid fa-message"></i>
                            </div>
                            <div>
                                <div className="db-course-item-name">
                                    {item.message}
                                    {!item.isRead && <span className="notif-dot"></span>}
                                </div>
                            </div>
                        </div>
                        <span className="db-course-status db-status--progress">
                            {timeAgo(item.createdAt)}
                        </span>
                    </div>
                ))
            )}
        </>
    );
}