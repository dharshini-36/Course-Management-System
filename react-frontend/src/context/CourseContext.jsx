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
            const response = await api.get("/api/v1/courses");
            setCourses(response.data.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch courses:", err);
            setError("Unable to load courses. Is the backend running on port 5000?");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCourses();
    }, []);

    async function addCourse(courseData) {
        try {
            const response = await api.post("/api/v1/courses", courseData);
            const newCourse = response.data.data;
            setCourses((prev) => [...prev, newCourse]);
            return newCourse;
        } catch (err) {
            console.error("Error adding course:", err);
            throw err;
        }
    }

    async function updateCourse(id, courseData) {
        try {
            const response = await api.put(`/api/v1/courses/${id}`, courseData);
            const updatedCourse = response.data.data;
            setCourses((prev) => prev.map((c) => (c.id === id ? updatedCourse : c)));
            return updatedCourse;
        } catch (err) {
            console.error("Error updating course:", err);
            throw err;
        }
    }

    async function deleteCourse(id) {
        try {
            await api.delete(`/api/v1/courses/${id}`);
            setCourses((prev) => prev.filter((c) => c.id !== id));
        } catch (err) {
            console.error("Error deleting course:", err);
            throw err;
        }
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