import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageCss from "../components/PageCss";
import { useAuth } from "../auth/AuthContext";
import { loginStudent as loginStudentApi } from "../api/authApi";
import { getErrorMessage } from "../api/errorMessage";

export default function StuLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    
    const { loginStudent } = useAuth();
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        e.stopPropagation();

        try {
            // 1. Ask the backend to check the email + password (JWT login)
            const result = await loginStudentApi({ email, password });

            // 2. Save the JWT so Axios sends it with protected requests
            sessionStorage.setItem("token", result.token);
            sessionStorage.setItem("role", "student"); // used to show/hide role-based buttons

            // 3. Update the app's login state (keep fullName for other pages)
            loginStudent({ ...result.student, fullName: result.student.name });

            // 4. Redirect to courses
            navigate("/courses");
        } catch (err) {
            console.error("Login failed:", err);
            setErrorMessage(
                getErrorMessage(err) ||
                "Could not reach the server. Is the backend running on port 5000?"
            );
        }
    }

    return (
        <>
            <PageCss href="/css/student_login.css" />
            <div className="split-wrapper">
                {/* Left Side Content */}
                <div className="auth-side auth-side-top">
                    <Link to="/" className="back-link">
                        <i className="fa-solid fa-arrow-left"></i>
                        Back to Home
                    </Link>
                    <div className="auth-side-logo">
                        <i className="fa-solid fa-graduation-cap"></i>
                        <span>LearnHub</span>
                    </div>
                    <h2>Pick up right where you left off.</h2>
                    <p>Sign in to access your courses, track your progress, and continue building skills that matter.</p>
                </div>

                {/* Right Side Form */}
                <div className="auth-form-side">
                    <div className="auth-card">
                        <div className="auth-panel active">
                            <h1 className="auth-title">Student Login</h1>
                            <p className="auth-subtitle">Welcome back! Please enter your details.</p>

                            {errorMessage && (
                                <p style={{ color: "red", fontWeight: "bold", margin: "10px 0" }}>
                                    {errorMessage}
                                </p>
                            )}

                            <form className="auth-form" onSubmit={handleLogin}>
                                <label htmlFor="studentEmail">Email Address</label>
                                <input 
                                    type="email" 
                                    id="studentEmail" 
                                    placeholder="you@example.com" 
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setErrorMessage(""); }}
                                    required 
                                />

                                <label htmlFor="studentPassword">Password</label>
                                <input 
                                    type="password" 
                                    id="studentPassword" 
                                    placeholder="••••••••" 
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setErrorMessage(""); }}
                                    required 
                                />

                                <button type="submit" className="auth-submit">Sign In</button>
                            </form>

                            <p className="auth-footer-text">
                                Don't have an account?{" "}
                                <Link to="/register">Register here</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}