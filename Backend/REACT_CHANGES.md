# React changes (task steps 33-37)

The backend now answers at /api/v1/... on port 5000 and wraps data as
{ success, message, data }, so the frontend must read `response.data.data`.

1. Set the axios base URL to http://localhost:5000 (your api.js).
2. Stop json-server / the old backend (Ctrl+C).
3. In react-frontend/src/context/CourseContext.jsx use:

```jsx
// GET all
const response = await api.get("/api/v1/courses");
setCourses(response.data.data);

const addCourse = async (courseData) => {
  try {
    const response = await api.post("/api/v1/courses", courseData);
    const newCourse = response.data.data;
    setCourses(prev => [...prev, newCourse]);
    return newCourse;
  } catch (error) {
    console.error("Error adding course:", error);
    throw error;
  }
};

const updateCourse = async (id, courseData) => {
  try {
    const response = await api.put(`/api/v1/courses/${id}`, courseData);
    const updatedCourse = response.data.data;
    setCourses(prev => prev.map(c => (c.id === id ? updatedCourse : c)));
    return updatedCourse;
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
};

const deleteCourse = async (id) => {
  try {
    await api.delete(`/api/v1/courses/${id}`);
    setCourses(prev => prev.filter(c => c.id !== id));
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
};
```

4. Students / enrollments: change `/students` -> `/api/v1/students`,
   `/enrollments` -> `/api/v1/enrollments`, and read `.data.data`.
5. Course fields are now courseName, courseCode, instructor, duration,
   category, description, status (not title/weeks/level...).
