
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";


const API_URL = "https://mock-interview-platform-api.onrender.com/api/interviews/pending";
const SCHEDULED_API_URL = "https://mock-interview-platform-api.onrender.com/api/interviews";
const BASE_URL = "https://mock-interview-platform-api.onrender.com/api/interviews";


function InterviewerDashboard() {
  const [interviews, setInterviews] = useState([]);
  const [scheduledInterviews, setScheduledInterviews] = useState([]);
  const [completedInterviews, setCompletedInterviews] = useState([]);
  const [scheduleTimes, setScheduleTimes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [schedulingId, setSchedulingId] = useState("");

  const loadInterviews = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        pendingResponse,
        scheduledResponse,
        completedResponse,
      ] = await Promise.all([
        fetch(API_URL),
        fetch(`${SCHEDULED_API_URL}/scheduled`),
        fetch(`${SCHEDULED_API_URL}/completed`),
      ]);

      const pendingData = await pendingResponse.json();
      const scheduledData = await scheduledResponse.json();
      const completedData = await completedResponse.json();

      if (!pendingResponse.ok) {
        throw new Error(
          pendingData.message || "Could not load pending requests"
        );
      }

      if (!scheduledResponse.ok) {
        throw new Error(
          scheduledData.message || "Could not load scheduled interviews"
        );
      }

      if (!completedResponse.ok) {
        throw new Error(
          completedData.message || "Could not load completed interviews"
        );
      }

      setInterviews(pendingData.interviews || []);
      setScheduledInterviews(scheduledData.interviews || []);
      setCompletedInterviews(completedData.interviews || []);
    } catch (err) {
      setError(err.message || "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInterviews();
  }, [loadInterviews]);

  async function handleSchedule(interviewId) {
    const selectedTime = scheduleTimes[interviewId];

    if (!selectedTime) {
      setMessage("Please select an interview date and time.");
      return;
    }

    const scheduledAt = new Date(selectedTime);

    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
      setMessage("Please select a valid future date and time.");
      return;
    }

    setSchedulingId(interviewId);
    setMessage("");

    try {
      const response = await fetch(`${BASE_URL}/${interviewId}/schedule`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scheduledAt: scheduledAt.toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not schedule interview");
      }

      setMessage("Interview scheduled successfully!");
      await loadInterviews();
    } catch (err) {
      setMessage(err.message || "Could not connect to the server.");
    } finally {
      setSchedulingId("");
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <h1>Interviewer Dashboard</h1>
      <p>Review student requests and manage interviews.</p>

      <button onClick={loadInterviews} disabled={loading}>
        {loading ? "Loading..." : "Refresh Requests"}
      </button>

      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}

      <hr style={{ margin: "28px 0" }} />

      <h2>Pending Requests</h2>

      {!loading && !error && interviews.length === 0 && (
        <p>No pending interview requests.</p>
      )}

      {interviews.map((interview) => (
        <article key={interview._id} style={cardStyle}>
          <h3>{interview.topic}</h3>
          <p><strong>Student:</strong> {interview.studentName}</p>
          <p><strong>Email:</strong> {interview.studentEmail}</p>
          <p><strong>Notes:</strong> {interview.notes || "None"}</p>
          <p><strong>Status:</strong> {interview.status}</p>

          <label htmlFor={`schedule-${interview._id}`}>
            Interview date and time
          </label>

          <input
            id={`schedule-${interview._id}`}
            type="datetime-local"
            value={scheduleTimes[interview._id] || ""}
            onChange={(event) =>
              setScheduleTimes((previous) => ({
                ...previous,
                [interview._id]: event.target.value,
              }))
            }
            style={inputStyle}
          />

          <button
            onClick={() => handleSchedule(interview._id)}
            disabled={schedulingId === interview._id}
          >
            {schedulingId === interview._id
              ? "Scheduling..."
              : "Schedule Interview"}
          </button>
        </article>
      ))}

      <hr style={{ margin: "32px 0" }} />

      <h2>Scheduled Interviews</h2>

      {!loading && !error && scheduledInterviews.length === 0 && (
        <p>No scheduled interviews found.</p>
      )}

      {scheduledInterviews.map((interview) => (
        <article key={interview._id} style={cardStyle}>
          <h3>{interview.topic}</h3>
          <p><strong>Student:</strong> {interview.studentName}</p>
          <p><strong>Email:</strong> {interview.studentEmail}</p>
          <p>
            <strong>Scheduled time:</strong>{" "}
            {interview.scheduledAt
              ? new Date(interview.scheduledAt).toLocaleString()
              : "Not scheduled"}
          </p>
          <p><strong>Status:</strong> {interview.status}</p>

          <Link
            to={`/interview/${interview._id}?role=interviewer&roomId=${encodeURIComponent(
              interview.roomId
            )}`}
          >
            Join Interview
          </Link>
        </article>
      ))}

      <hr style={{ margin: "32px 0" }} />

      <h2>Completed Interviews</h2>

      {!loading && !error && completedInterviews.length === 0 && (
        <p>No completed interviews found.</p>
      )}

      {completedInterviews.map((interview) => (
        <article key={interview._id} style={cardStyle}>
          <h3>{interview.topic}</h3>
          <p><strong>Student:</strong> {interview.studentName}</p>
          <p><strong>Email:</strong> {interview.studentEmail}</p>
          <p>
            <strong>Scheduled time:</strong>{" "}
            {interview.scheduledAt
              ? new Date(interview.scheduledAt).toLocaleString()
              : "Not scheduled"}
          </p>
          <p><strong>Status:</strong> {interview.status}</p>
          <p>
            <strong>Completed on:</strong>{" "}
            {interview.updatedAt
              ? new Date(interview.updatedAt).toLocaleString()
              : "Unknown"}
          </p>
        </article>
      ))}
    </main>
  );
}

const cardStyle = {
  border: "1px solid #ccc",
  borderRadius: 8,
  padding: 16,
  marginTop: 16,
};

const inputStyle = {
  display: "block",
  padding: 10,
  margin: "8px 0 12px",
  maxWidth: "100%",
};

export default InterviewerDashboard;
