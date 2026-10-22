
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../css/InterviewerDashboard.css";


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
    <main className="interviewer-dashboard container-fluid py-4 py-lg-5">
      <div className="dashboard-container mx-auto">

        {/* Header */}
        <header className="dashboard-header d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <span className="dashboard-eyebrow">INTERVIEWHUB WORKSPACE</span>
            <h1 className="dashboard-title mt-2 mb-2">
              Interviewer Dashboard
            </h1>
            <p className="dashboard-subtitle mb-0">
              Manage student requests and conduct interviews.
            </p>
          </div>

          <button
            className="btn btn-primary refresh-btn"
            onClick={loadInterviews}
            disabled={loading}
          >
            <span className="me-2">↻</span>
            {loading ? "Loading..." : "Refresh Requests"}
          </button>
        </header>

        {/* Feedback Messages */}
        {message && (
          <div className="alert alert-info dashboard-alert" role="status">
            {message}
          </div>
        )}

        {error && (
          <div className="alert alert-danger dashboard-alert" role="alert">
            {error}
          </div>
        )}

        {/* Dashboard Overview */}
        <section className="row g-3 mb-5">
          <div className="col-12 col-md-4">
            <div className="overview-card pending-overview h-100">
              <div className="overview-icon">◷</div>
              <p>Pending Requests</p>
              <h2>{interviews.length}</h2>
              <span>Awaiting scheduling</span>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="overview-card scheduled-overview h-100">
              <div className="overview-icon">▦</div>
              <p>Scheduled Interviews</p>
              <h2>{scheduledInterviews.length}</h2>
              <span>Ready for the session</span>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="overview-card completed-overview h-100">
              <div className="overview-icon">✓</div>
              <p>Completed Interviews</p>
              <h2>{completedInterviews.length}</h2>
              <span>Past interview sessions</span>
            </div>
          </div>
        </section>

        {/* Pending Requests */}
        <section className="dashboard-section mb-5">
          <div className="section-heading d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
            <div>
              <h2>Pending Requests</h2>
              <p>Review student details and schedule a session.</p>
            </div>
            <span className="section-count">
              {interviews.length} requests
            </span>
          </div>

          {loading && (
            <div className="dashboard-empty">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>Loading interview requests...</p>
            </div>
          )}

          {!loading && !error && interviews.length === 0 && (
            <div className="dashboard-empty">
              <div className="empty-icon">◷</div>
              <h3>All caught up!</h3>
              <p>No pending interview requests right now.</p>
            </div>
          )}

          {!loading && interviews.length > 0 && (
            <div className="row g-4">
              {interviews.map((interview) => (
                <div className="col-12 col-lg-6" key={interview._id}>
                  <article className="interview-card h-100">
                    <div className="interview-card-header d-flex justify-content-between align-items-start gap-2">
                      <div>
                        <span className="card-label">INTERVIEW TOPIC</span>
                        <h3>{interview.topic}</h3>
                      </div>
                      <span className="status-badge status-pending">
                        {interview.status}
                      </span>
                    </div>

                    <div className="student-details">
                      <div className="detail-icon">S</div>
                      <div className="min-w-0">
                        <span>Student</span>
                        <p>{interview.studentName}</p>
                      </div>
                    </div>

                    <div className="detail-row">
                      <span>Email</span>
                      <p className="text-break">{interview.studentEmail}</p>
                    </div>

                    <div className="notes-box">
                      <span>Student Notes</span>
                      <p>{interview.notes || "No additional notes provided."}</p>
                    </div>

                    <div className="schedule-box">
                      <label
                        className="form-label"
                        htmlFor={`schedule-${interview._id}`}
                      >
                        Select date and time
                      </label>

                      <input
                        className="form-control schedule-input"
                        id={`schedule-${interview._id}`}
                        type="datetime-local"
                        value={scheduleTimes[interview._id] || ""}
                        onChange={(event) =>
                          setScheduleTimes((previous) => ({
                            ...previous,
                            [interview._id]: event.target.value,
                          }))
                        }
                      />

                      <button
                        className="btn btn-primary schedule-btn w-100 mt-3"
                        onClick={() => handleSchedule(interview._id)}
                        disabled={schedulingId === interview._id}
                      >
                        {schedulingId === interview._id
                          ? "Scheduling..."
                          : "Schedule Interview →"}
                      </button>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Scheduled Interviews */}
        <section className="dashboard-section mb-5">
          <div className="section-heading d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
            <div>
              <h2>Scheduled Interviews</h2>
              <p>Manage upcoming sessions and join your interviews.</p>
            </div>
            <span className="section-count">
              {scheduledInterviews.length} scheduled
            </span>
          </div>

          {!loading && !error && scheduledInterviews.length === 0 && (
            <div className="dashboard-empty">
              <div className="empty-icon">▦</div>
              <h3>No scheduled interviews</h3>
              <p>Scheduled sessions will appear here.</p>
            </div>
          )}

          <div className="row g-4">
            {scheduledInterviews.map((interview) => (
              <div className="col-12 col-lg-6" key={interview._id}>
                <article className="interview-card h-100">
                  <div className="interview-card-header d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <span className="card-label">UPCOMING SESSION</span>
                      <h3>{interview.topic}</h3>
                    </div>
                    <span className="status-badge status-scheduled">
                      {interview.status}
                    </span>
                  </div>

                  <div className="student-details">
                    <div className="detail-icon">S</div>
                    <div className="min-w-0">
                      <span>Student</span>
                      <p>{interview.studentName}</p>
                    </div>
                  </div>

                  <div className="detail-row">
                    <span>Email</span>
                    <p className="text-break">{interview.studentEmail}</p>
                  </div>

                  <div className="scheduled-time-box">
                    <span>Scheduled date & time</span>
                    <p>
                      {interview.scheduledAt
                        ? new Date(interview.scheduledAt).toLocaleString()
                        : "Not scheduled"}
                    </p>
                  </div>

                  <Link
                    className="btn btn-success join-interview-btn w-100 mt-3"
                    to={`/interview/${interview._id}?role=interviewer&roomId=${encodeURIComponent(
                      interview.roomId
                    )}`}
                  >
                    Join Interview →
                  </Link>
                </article>
              </div>
            ))}
          </div>
        </section>

        {/* Completed Interviews */}
        <section className="dashboard-section mb-4">
          <div className="section-heading d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
            <div>
              <h2>Completed Interviews</h2>
              <p>Review your previously completed sessions.</p>
            </div>
            <span className="section-count">
              {completedInterviews.length} completed
            </span>
          </div>

          {!loading && !error && completedInterviews.length === 0 && (
            <div className="dashboard-empty">
              <div className="empty-icon">✓</div>
              <h3>No completed interviews yet</h3>
              <p>Your completed sessions will appear here.</p>
            </div>
          )}

          <div className="row g-4">
            {completedInterviews.map((interview) => (
              <div className="col-12 col-lg-6" key={interview._id}>
                <article className="interview-card completed-card h-100">
                  <div className="interview-card-header d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <span className="card-label">INTERVIEW HISTORY</span>
                      <h3>{interview.topic}</h3>
                    </div>
                    <span className="status-badge status-completed">
                      {interview.status}
                    </span>
                  </div>

                  <div className="student-details">
                    <div className="detail-icon">S</div>
                    <div className="min-w-0">
                      <span>Student</span>
                      <p>{interview.studentName}</p>
                    </div>
                  </div>

                  <div className="detail-row">
                    <span>Email</span>
                    <p className="text-break">{interview.studentEmail}</p>
                  </div>

                  <div className="scheduled-time-box">
                    <span>Scheduled date & time</span>
                    <p>
                      {interview.scheduledAt
                        ? new Date(interview.scheduledAt).toLocaleString()
                        : "Not scheduled"}
                    </p>
                  </div>

                  <div className="completed-time-box">
                    <span>Completed on</span>
                    <p>
                      {interview.updatedAt
                        ? new Date(interview.updatedAt).toLocaleString()
                        : "Unknown"}
                    </p>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </section>

        <footer className="dashboard-footer">
          InterviewHub · Interview Management Workspace
        </footer>

      </div>
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
