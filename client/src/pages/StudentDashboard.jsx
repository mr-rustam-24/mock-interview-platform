
import { useState } from "react";
import { Link } from "react-router-dom";
import "../../css/StudentDashboard.css";;

const API_URL =
  "https://mock-interview-platform-api.onrender.com/api/interviews";

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
    <main className="container-fluid px-3 px-lg-5 py-4 dashboard-page">
      <header className="dashboard-header rounded-4 p-4 p-lg-5 mb-4">
        <h1 className="fw-bold">Student Dashboard</h1>
        <p className="mb-0">
          Request a mock interview and check your scheduled interviews.
        </p>
      </header>

      {message && (
        <div className="alert alert-info" role="status">
          {message}
        </div>
      )}

      <div className="row g-4">
        {/* Request Interview */}
        <div className="col-12 col-lg-5">
          <section className="card dashboard-card h-100">
            <div className="card-body p-4">
              <h2 className="h4 fw-bold mb-2">
                Request an Interview
              </h2>

              <p className="text-secondary mb-4">
                Fill in your details to request an interview.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="studentName" className="form-label">
                    Full Name
                  </label>
                  <input
                    id="studentName"
                    name="studentName"
                    className="form-control"
                    placeholder="Enter your full name"
                    value={form.studentName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="studentEmail" className="form-label">
                    Email Address
                  </label>
                  <input
                    id="studentEmail"
                    name="studentEmail"
                    type="email"
                    className="form-control"
                    placeholder="Enter your email address"
                    value={form.studentEmail}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="topic" className="form-label">
                    Interview Topic
                  </label>
                  <input
                    id="topic"
                    name="topic"
                    className="form-control"
                    placeholder="Node.js, React, DSA..."
                    value={form.topic}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="notes" className="form-label">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    className="form-control"
                    rows={4}
                    placeholder="What would you like to practice?"
                    value={form.notes}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Request Interview"}
                </button>
              </form>
            </div>
          </section>
        </div>

        {/* My Interviews */}
        <div className="col-12 col-lg-7">
          <section className="card dashboard-card">
            <div className="card-body p-4">
              <h2 className="h4 fw-bold mb-2">My Interviews</h2>

              <p className="text-secondary mb-4">
                Search and check your interview status.
              </p>

              <form onSubmit={loadInterviews} className="mb-4">
                <label htmlFor="searchEmail" className="form-label">
                  Your Email Address
                </label>

                <div className="d-flex flex-column flex-sm-row gap-2">
                  <input
                    id="searchEmail"
                    type="email"
                    className="form-control"
                    placeholder="Enter your request email"
                    value={emailToSearch}
                    onChange={(event) =>
                      setEmailToSearch(event.target.value)
                    }
                    required
                  />

                  <button
                    type="submit"
                    className="btn btn-primary flex-shrink-0"
                    disabled={loadingInterviews}
                  >
                    {loadingInterviews ? "Loading..." : "Find Interviews"}
                  </button>
                </div>
              </form>

              {interviews.length === 0 ? (
                <div className="empty-state text-center p-4">
                  <h3 className="h6 fw-bold">
                    Your interviews will appear here
                  </h3>
                  <p className="text-secondary small mb-0">
                    Search using the email you used for your request.
                  </p>
                </div>
              ) : (
                interviews.map((interview) => (
                  <article
                    key={interview._id}
                    className="interview-item p-3 mb-3"
                  >
                    <div className="d-flex flex-column flex-sm-row
                                    justify-content-between gap-3">
                      <div>
                        <h3 className="h5 fw-bold">
                          {interview.topic}
                        </h3>

                        <p className="mb-2">
                          <strong>Status:</strong>{" "}
                          <span className="badge text-bg-primary">
                            {interview.status}
                          </span>
                        </p>

                        <p className="small text-secondary mb-0">
                          <strong>Scheduled time:</strong>{" "}
                          {interview.scheduledAt
                            ? new Date(
                                interview.scheduledAt
                              ).toLocaleString()
                            : "Not scheduled yet"}
                        </p>
                      </div>

                      {interview.status === "scheduled" && (
                        <div>
                          <Link
                            className="btn btn-primary btn-sm"
                            to={`/interview/${interview._id}?role=student&roomId=${encodeURIComponent(
                              interview.roomId
                            )}`}
                          >
                            Join Interview
                          </Link>
                        </div>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default StudentDashboard;
