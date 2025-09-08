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
    profileImage: null, // File ठेवणार
  });

  const API_BASE_URL = "https://student-dash-project-backend.vercel.app/api/students";

  const fetchStudents = async () => {
  try {
    setLoading(true);
    setError("");
    const response = await fetch(${API_BASE_URL}/getStudent);
    if (!response.ok)
      throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    // Convert buffer to base64 for displaying
    const studentsWithImages = data.map((s) => {
      let imageSrc = "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150";

      if (s.profileImage && s.profileImage.data) {
        // Convert binary to base64
        const base64String = btoa(
          new Uint8Array(s.profileImage.data.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        imageSrc = `data:$s.profileImage.contentType};base64,${base64String}`;
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

      const res = await fetch(${API_BASE_URL}/addStudent, {
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
      profileImage: null, // नवीन फाइल निवडल्याशिवाय update करणार नाही
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
        ${API_BASE_URL}/updatedStudentById/${editingStudent._id},
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
      const res = await fetch(${API_BASE_URL}/DeleteStudentById/${id}, {
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

  // Form
  const renderForm = (type) => (
    <div className="form-container">
      <h2>{type === "create" ? "Create New Student" : "Edit Student"}</h2>
      {error && <div className="error-message">{error}</div>}
      <form
        onSubmit={type === "create" ? handleCreateStudent : handleUpdateStudent}
        className="student-form"
      >
        <div className="form-group">
          <label>Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter student name"
            required
          />
        </div>
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter email address"
            required
          />
        </div>
        <div className="form-group">
          <label>Course *</label>
          <select
            name="course"
            value={formData.course}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Course</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Civil Engineering">Civil Engineering</option>
            <option value="Business Administration">Business Administration</option>
          </select>
        </div>
        <div className="form-group">
          <label>Profile Image</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? type === "create"
                ? "Creating..."
                : "Updating..."
              : type === "create"
              ? "Create Student"
              : "Update Student"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setActiveSection("list")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  // List
  const renderStudentList = () => (
    <div className="list-container">
      <div className="list-header">
        <h2>All Students ({students.length})</h2>
        <button
          className="btn-primary"
          onClick={() => setActiveSection("create")}
          disabled={loading}
        >
          Add New Student
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Loading students...</div>}
      <div className="students-grid">
        {students.map((student) => (
          <div key={student._id} className="student-card">
            <div className="student-avatar">
              <img src={student.profileImage} alt={student.name} />
            </div>
            <div className="student-info">
              <h3>{student.name}</h3>
              <p className="student-email">{student.email}</p>
              <p className="student-course">{student.course}</p>
            </div>
            <div className="student-actions">
              <button
                className="btn-view"
                onClick={() => handleViewStudent(student)}
                disabled={loading}
              >
                View
              </button>
              <button
                className="btn-edit"
                onClick={() => handleEditStudent(student)}
                disabled={loading}
              >
                Edit
              </button>
              <button
                className="btn-delete"
                onClick={() => handleDeleteStudent(student._id)}
                disabled={loading}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {!loading && students.length === 0 && (
        <div className="empty-state">
          <h3>No Students Found</h3>
          <p>Create your first student to get started</p>
          <button
            className="btn-primary"
            onClick={() => setActiveSection("create")}
          >
            Create Student
          </button>
        </div>
      )}
    </div>
  );

  // View
  const renderStudentView = () => {
    if (!selectedStudent) return <p>No student selected.</p>;
    return (
      <div className="view-container">
        <button
          className="btn-back"
          onClick={() => setActiveSection("list")}
        >
          ← Back to List
        </button>
        <div className="student-detail-card">
          <div className="student-header">
            <img
              src={selectedStudent.profileImage}
              alt={selectedStudent.name}
              className="profile-image"
            />
            <div className="student-title">
              <h1>{selectedStudent.name}</h1>
              <p className="student-id">Student ID: {selectedStudent._id}</p>
            </div>
          </div>
          <div className="student-details">
            <div className="detail-item">
              <strong>Email:</strong> <span>{selectedStudent.email}</span>
            </div>
            <div className="detail-item">
              <strong>Course:</strong> <span>{selectedStudent.course}</span>
            </div>
            <div className="detail-item">
              <strong>Profile Image:</strong>
              <a
                href={selectedStudent.profileImage}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Full Image
              </a>
            </div>
          </div>
          <div className="detail-actions">
            <button
              className="btn-primary"
              onClick={() => handleEditStudent(selectedStudent)}
              disabled={loading}
            >
              Edit Student
            </button>
            <button
              className="btn-delete"
              onClick={() => handleDeleteStudent(selectedStudent._id)}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Student"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case "create":
        return renderForm("create");
      case "edit":
        return renderForm("edit");
      case "view":
        return renderStudentView();
      default:
        return renderStudentList();
    }
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>Student Dashboard</h1>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${
              activeSection === "list" ? "active" : ""
            }`}
            onClick={() => setActiveSection("list")}
          >
            👥 List Students
          </button>
          <button
            className={`nav-item ${
              activeSection === "create" ? "active" : ""
            }`}
            onClick={() => setActiveSection("create")}
          >
            ➕ Create Student
          </button>
        </nav>
        <div className="sidebar-footer">
          <p>Total Students: {students.length}</p>
        </div>
      </div>
      <div className="main-content">{renderContent()}</div>
    </div>
  );
}

export default App;