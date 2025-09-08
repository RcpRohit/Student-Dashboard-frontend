import { useState, useEffect } from "react";
import "./App.css";

function App() {
  // ---------- Student States ----------
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);

  // ---------- Course States ----------
  const [courses, setCourses] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("studentList");

  // ---------- Student Form ----------
  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    course: "",
    profileImage: null,
  });

  // ---------- Course Form ----------
  const [courseForm, setCourseForm] = useState({
    name: "",
  });

  const STUDENT_API = "https://student-dash-project-backend.vercel.app/api/students";
  const COURSE_API = "https://student-dash-project-backend.vercel.app/api/course";

  // ---------------- Fetch Students ----------------
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${STUDENT_API}/getStudent`);
      if (!res.ok) throw new Error(`HTTP error! ${res.status}`);
      const data = await res.json();

      const studentsWithImages = data.map((s) => {
        let imageSrc =
          "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150";
        if (s.profileImage && s.profileImage.data) {
          const base64String = btoa(
            new Uint8Array(s.profileImage.data.data).reduce(
              (d, byte) => d + String.fromCharCode(byte),
              ""
            )
          );
          imageSrc = `data:${s.profileImage.contentType};base64,${base64String}`;
        }
        return { ...s, profileImage: imageSrc };
      });

      setStudents(studentsWithImages);
    } catch (err) {
      setError("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Fetch Courses ----------------
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${COURSE_API}/getAllCourses`);
      if (!res.ok) throw new Error(`HTTP error! ${res.status}`);
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      setError("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  // ---------------- Student Handlers ----------------
  const handleStudentInputChange = (e) =>
    setStudentForm({ ...studentForm, [e.target.name]: e.target.value });

  const handleStudentFileChange = (e) =>
    setStudentForm({ ...studentForm, profileImage: e.target.files[0] });

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    const formDataObj = new FormData();
    formDataObj.append("name", studentForm.name);
    formDataObj.append("email", studentForm.email);
    formDataObj.append("course", studentForm.course);
    if (studentForm.profileImage)
      formDataObj.append("profileImage", studentForm.profileImage);

    const res = await fetch(`${STUDENT_API}/addStudent`, {
      method: "POST",
      body: formDataObj,
    });
    const newStudent = await res.json();
    setStudents([...students, newStudent]);
    setStudentForm({ name: "", email: "", course: "", profileImage: null });
    setActiveSection("studentList");
  };

  // ---------------- Course Handlers ----------------
  const handleCourseInputChange = (e) =>
    setCourseForm({ ...courseForm, [e.target.name]: e.target.value });

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    const res = await fetch(`${COURSE_API}/addCourse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(courseForm),
    });
    const newCourse = await res.json();
    setCourses([...courses, newCourse]);
    setCourseForm({ name: "" });
    setActiveSection("courseList");
  };

  // ---------------- UI Renders ----------------
  const renderStudentList = () => (
    <div className="list-container">
      <div className="list-header">
        <h2>All Students ({students.length})</h2>
        <button onClick={() => setActiveSection("studentCreate")} className="btn-primary">
          Add New Student
        </button>
      </div>
      <div className="students-grid">
        {students.map((s) => (
          <div key={s._id} className="student-card">
            <img src={s.profileImage} alt={s.name} />
            <h3>{s.name}</h3>
            <p>{s.email}</p>
            <p>{s.course}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCourseList = () => (
    <div className="list-container">
      <div className="list-header">
        <h2>All Courses ({courses.length})</h2>
        <button onClick={() => setActiveSection("courseCreate")} className="btn-primary">
          Add New Course
        </button>
      </div>
      <div className="students-grid">
        {courses.map((c) => (
          <div key={c._id} className="student-card">
            <h3>{c.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStudentForm = () => (
    <form onSubmit={handleCreateStudent} className="student-form">
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={studentForm.name}
        onChange={handleStudentInputChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={studentForm.email}
        onChange={handleStudentInputChange}
        required
      />
      <input
        type="text"
        name="course"
        placeholder="Course"
        value={studentForm.course}
        onChange={handleStudentInputChange}
        required
      />
      <input type="file" onChange={handleStudentFileChange} />
      <button type="submit" className="btn-primary">Create Student</button>
    </form>
  );

  const renderCourseForm = () => (
    <form onSubmit={handleCreateCourse} className="student-form">
      <input
        type="text"
        name="name"
        placeholder="Course Name"
        value={courseForm.name}
        onChange={handleCourseInputChange}
        required
      />
      <button type="submit" className="btn-primary">Create Course</button>
    </form>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "studentList": return renderStudentList();
      case "studentCreate": return renderStudentForm();
      case "courseList": return renderCourseList();
      case "courseCreate": return renderCourseForm();
      default: return renderStudentList();
    }
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h1>Dashboard</h1>
        <nav>
          <button onClick={() => setActiveSection("studentList")}>
            👥 Students
          </button>
          <button onClick={() => setActiveSection("courseList")}>
            📚 Courses
          </button>
        </nav>
      </div>
      <div className="main-content">{renderContent()}</div>
    </div>
  );
}

export default App;
