import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getUnreadCount } from "../data/notificationsStore";

// Highlights the link of the page you are on.
function navClass({ isActive }) {
    return isActive ? "active-nav" : undefined;
}

export default function Navbar() {
    const { student, admin, logoutStudent, logoutAdmin } = useAuth();
    const navigate = useNavigate();
    // useLocation forces a re-render on every navigation, which keeps the
    // notification badge fresh.
    useLocation();

    const unreadCount = getUnreadCount(student?.email || "");

    function handleLogout() {
        if (admin) {
            logoutAdmin();
        } else {
            logoutStudent();
        }
        navigate("/");
    }

    return (
        <header className="navbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "15px 30px", background: "#fff", borderBottom: "1px solid #eaeaea" }}>
            <Link to="/" className="logo" style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", fontSize: "20px", textDecoration: "none", color: "inherit" }}>
                <i className="fa-solid fa-graduation-cap"></i>
                <span>
                    LearnHub
                    {admin && <span className="admin-tag">Admin</span>}
                </span>
            </Link>

            <ul className="nav-links" style={{ display: "flex", gap: "20px", listStyle: "none", margin: 0, padding: 0, alignItems: "center" }}>
                <li><NavLink to="/" end className={navClass}>Home</NavLink></li>
                <li><NavLink to="/courses" className={navClass}>Courses</NavLink></li>
                {(student || admin) && (
                    <li>
                        <NavLink to="/notifications" className={navClass} style={{ position: "relative" }}>
                            Notifications
                            {student && unreadCount > 0 && (
                                <span
                                    style={{
                                        position: "absolute",
                                        top: "-8px",
                                        right: "-16px",
                                        background: "#e11d48",
                                        color: "#fff",
                                        borderRadius: "999px",
                                        fontSize: "10px",
                                        fontWeight: "700",
                                        lineHeight: "1",
                                        padding: "3px 5px",
                                        minWidth: "16px",
                                        textAlign: "center",
                                    }}
                                >
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </NavLink>
                    </li>
                )}
                {student && <li><NavLink to="/dashboard" className={navClass}>Dashboard</NavLink></li>}
                {admin && <li><NavLink to="/admin-dashboard" className={navClass}>Admin Dashboard</NavLink></li>}
                {student && <li><NavLink to="/my-courses" className={navClass}>My Courses</NavLink></li>}
                {student && <li><NavLink to="/my-progress" className={navClass}>My Progress</NavLink></li>}
                {(student || admin) && <li><NavLink to="/chat" className={navClass}>Chat</NavLink></li>}
            </ul>

            <div className="nav-buttons">
                {student || admin ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <span style={{ fontWeight: "600", color: "#333" }}>
                            <i className="fa-solid fa-user" style={{ marginRight: "6px" }}></i>
                            {student ? (student.fullName || student.name || student.username) : (admin.fullName || admin.email)}
                        </span>
                        <button type="button" onClick={handleLogout} className="login-btn" style={{ cursor: "pointer", padding: "6px 14px" }}>
                            Logout
                        </button>
                    </div>
                ) : (
                    // /login lets the visitor choose Student or Admin
                    <Link to="/login" className="login-btn">
                        Login / Register
                    </Link>
                )}
            </div>
        </header>
    );
}