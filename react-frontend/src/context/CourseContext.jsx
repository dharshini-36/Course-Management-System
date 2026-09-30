import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const CourseContext = createContext(null);

export function CourseProvider({ children }) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function fetchCourses() {
        try {
            setLoading(true);
            const response = await api.get("/courses");
            setCourses(response.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch courses:", err);
            setError("Unable to load courses. Is the mock API running on port 5000?");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCourses();
    }, []);

    async function addCourse(course) {
        const response = await api.post("/courses", course);
        setCourses((prev) => [...prev, response.data]);
        return response.data;
    }

    async function updateCourse(id, updatedCourse) {
        const response = await api.put(`/courses/${id}`, { ...updatedCourse, id });
        setCourses((prev) => prev.map((c) => (c.id === id ? response.data : c)));
        return response.data;
    }

    async function deleteCourse(id) {
        await api.delete(`/courses/${id}`);
        setCourses((prev) => prev.filter((c) => c.id !== id));
    }

    return (
        <CourseContext.Provider
            value={{ courses, loading, error, fetchCourses, addCourse, updateCourse, deleteCourse }}
        >
            {children}
        </CourseContext.Provider>
    );
}

export function useCourses() {
    return useContext(CourseContext);
}