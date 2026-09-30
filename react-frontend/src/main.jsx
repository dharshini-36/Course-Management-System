import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import { CourseProvider } from "./context/CourseContext";
import "./index.css";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <CourseProvider>
                    <App />
                </CourseProvider>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);