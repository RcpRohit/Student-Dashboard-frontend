import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [activeSection, setActiveSection] = useState("list");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    course: "",
    profileImage: null,
  });

  const API_BASE_URL = "https://student-dash-project-backend.vercel.app/api/students";

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/getStudent`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      // Convert buffer to base64 for displaying
      const studentsWithImages = data.map((s) => {
        let imageSrc =
          "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150";

        if (s.profileImage && s.profileImage.data) {
          const base64String = btoa(
            new Uint8Array(s.profileImage.data.data).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ""
            )
          );
          imageSrc = `data:${s.profileImage.contentType};base64,${base64String}`;
        }

        return {
          ...s,
          profileImage: imageSrc,
        };
      });

      setStudents(studentsWithImages);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to fetch students. Please check server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Input change (for text fields)
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // File input
  const handleFileChange = (e) =>
    setFormData({ ...formData, profileImage: e.target.files[0] });

  // Create student
  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.course) return;
    setLoading(true);
    setError("");
    try {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("email", formData.email);
      formDataObj.append("course", formData.course);

      if (formData.profileImage) {
        formDataObj.append("profileImage", formData.profileImage);
      }

      const res = await fetch(`${API_BASE_URL}/addStudent`, {
        method: "POST",
        body: formDataObj,
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const newStudent = await res.json();

      setStudents([
        ...students,
        {
          ...newStudent,
          profileImage:
            newStudent.profileImage ||
            "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150",
        },
      ]);

      setFormData({ name: "", email: "", course: "", profileImage: null });
      setActiveSection("list");
    } catch (err) {
      console.error("Error creating student:", err);
      setError("Failed to create student.");
    } finally {
      setLoading(false);
    }
  };

  // Edit
  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      course: student.course,
      profileImage: null,
    });
    setActiveSection("edit");
  };

  // Update student
  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.course) return;
    setLoading(true);
    setError("");
    try {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("email", formData.email);
      formDataObj.append("course", formData.course);

      if (formData.profileImage) {
        formDataObj.append("profileImage", formData.profileImage);
      }

      const res = await fetch(
        `${API_BASE_URL}/updatedStudentById/${editingStudent._id}`,
        {
          method: "PUT",
          body: formDataObj,
        }
      );

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const updatedStudent = await res.json();

      setStudents(
        students.map((s) =>
          s._id === editingStudent._id
            ? {
                ...updatedStudent,
                profileImage:
                  updatedStudent.profileImage ||
                  "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150",
              }
            : s
        )
      );

      setFormData({ name: "", email: "", course: "", profileImage: null });
      setEditingStudent(null);
      setActiveSection("list");
    } catch (err) {
      console.error("Error updating student:", err);
      setError("Failed to update student.");
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/DeleteStudentById/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      setStudents(students.filter((s) => s._id !== id));
      if (selectedStudent?._id === id) setActiveSection("list");
    } catch (err) {
      console.error("Error deleting student:", err);
      setError("Failed to delete student.");
    } finally {
      setLoading(false);
    }
  };

  // View
  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setActiveSection("view");
  };

  // rest of your code unchanged...
}

export default App;
