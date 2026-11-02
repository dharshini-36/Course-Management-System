import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// The JWT lives in sessionStorage (cleared when the tab closes) but the user
// details used to live in localStorage (kept forever). That mismatch made the
// app look "logged in" with no token, so every API call failed with
// "Authentication token is required". Now a saved user only counts as logged in
// while a matching token (and role) still exists in sessionStorage.
function readSavedUser(key, role) {
    const hasToken = Boolean(sessionStorage.getItem("token"));
    const savedRole = sessionStorage.getItem("role");

    if (!hasToken || savedRole !== role) {
        return null;
    }

    const data = localStorage.getItem(key);
    if (!data) return null;

    try {
        return JSON.parse(data);
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [student, setStudent] = useState(() =>
        readSavedUser("loggedInStudent", "student") || readSavedUser("currentStudent", "student")
    );

    const [admin, setAdmin] = useState(() => readSavedUser("loggedInAdmin", "admin"));

    function loginStudent(studentData) {
        setStudent(studentData);
        localStorage.setItem("loggedInStudent", JSON.stringify(studentData));
        localStorage.setItem("currentStudent", JSON.stringify(studentData));
    }

    function loginAdmin(adminData) {
        setAdmin(adminData);
        localStorage.setItem("loggedInAdmin", JSON.stringify(adminData));
    }

    function logoutStudent() {
        setStudent(null);
        localStorage.removeItem("loggedInStudent");
        localStorage.removeItem("currentStudent");
        sessionStorage.removeItem("token"); // remove the JWT too
        sessionStorage.removeItem("role");
    }

    function logoutAdmin() {
        setAdmin(null);
        localStorage.removeItem("loggedInAdmin");
        sessionStorage.removeItem("token"); // remove the JWT too
        sessionStorage.removeItem("role");
    }

    return (
        <AuthContext.Provider value={{ student, admin, loginStudent, loginAdmin, logoutStudent, logoutAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}