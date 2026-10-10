
import { useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://192.168.0.190:9000/api/interviews";

function StudentDashboard() {
  const [form, setForm] = useState({
    studentName: "",
    studentEmail: "",
    topic: "",
    notes: "",
  });

  const [emailToSearch, setEmailToSearch] = useState("");
  const [interviews, setInterviews] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingInterviews, setLoadingInterviews] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      setMessage("Interview request submitted successfully!");
      setEmailToSearch(form.studentEmail);
      setForm({
        studentName: "",
        studentEmail: "",
        topic: "",
        notes: "",
      });
    } catch (error) {
      setMessage(error.message || "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  async function loadInterviews(event) {
    event.preventDefault();
    setMessage("");

    if (!emailToSearch.trim()) {
      setMessage("Please enter your email address.");
      return;
    }

    setLoadingInterviews(true);

    try {
      const response = await fetch(
        `${API_URL}/student?email=${encodeURIComponent(
          emailToSearch.trim()
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load interviews.");
      }

      setInterviews(data.interviews || []);

      if (!data.interviews?.length) {
        setMessage("No interviews found for this email.");
      }
    } catch (error) {
      setMessage(error.message || "Could not connect to the server.");
    } finally {
      setLoadingInterviews(false);
    }
  }

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: 24 }}>
      <h1>Student Dashboard</h1>
      <p>Request a mock interview and check your scheduled interviews.</p>

      <h2>Request an Interview</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="studentName">Full Name</label>
        <input
          id="studentName"
          name="studentName"
          value={form.studentName}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <label htmlFor="studentEmail">Email</label>
        <input
          id="studentEmail"
          name="studentEmail"
          type="email"
          value={form.studentEmail}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <label htmlFor="topic">Interview Topic</label>
        <input
          id="topic"
          name="topic"
          value={form.topic}
          onChange={handleChange}
          placeholder="Node.js, React, DSA..."
          required
          style={inputStyle}
        />

        <label htmlFor="notes">Additional Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={4}
          style={inputStyle}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Request Interview"}
        </button>
      </form>

      <hr style={{ margin: "32px 0" }} />

      <h2>My Interviews</h2>

      <form onSubmit={loadInterviews}>
        <label htmlFor="searchEmail">Your email address</label>
        <input
          id="searchEmail"
          type="email"
          value={emailToSearch}
          onChange={(event) => setEmailToSearch(event.target.value)}
          placeholder="Enter the email used for your request"
          required
          style={inputStyle}
        />

        <button type="submit" disabled={loadingInterviews}>
          {loadingInterviews ? "Loading..." : "Find My Interviews"}
        </button>
      </form>

      {message && <p role="status">{message}</p>}

      {interviews.map((interview) => (
        <article
          key={interview._id}
          style={{
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: 16,
            marginTop: 16,
          }}
        >
          <h3>{interview.topic}</h3>
          <p>
            <strong>Status:</strong> {interview.status}
          </p>

          <p>
            <strong>Scheduled time:</strong>{" "}
            {interview.scheduledAt
              ? new Date(interview.scheduledAt).toLocaleString()
              : "Not scheduled yet"}
          </p>

          {interview.status === "scheduled" && (
            <Link
              to={`/interview/${interview._id}?role=student&roomId=${encodeURIComponent(
                interview.roomId
              )}`}
            >
              Join Interview
            </Link>
          )}
        </article>
      ))}
    </main>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: 10,
  margin: "6px 0 18px",
};

export default StudentDashboard;
