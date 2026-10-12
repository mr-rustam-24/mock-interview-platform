
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../css/Home.css";
import "../../css/Navbar.css";

function Home() {
  const navigate = useNavigate();

  return (
    <main className="home-page">
      {/* Navbar */}
      <nav className="navbar navbar-expand-md home-nav">
        <div className="container">
          <Link to="/" className="navbar-brand home-logo">
            <span className="logo-icon">M</span>
            <span>MockMate</span>
          </Link>

          <span className="nav-label d-none d-md-inline">
            Mock Interview Platform
          </span>

          <div className="d-flex align-items-center gap-2 ms-auto auth-nav-links">
            <Link to="/login" className="btn home-login-btn">
              Login
            </Link>

            <Link to="/signup" className="btn home-signup-btn">
              Signup <span>→</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center g-4">
            {/* Hero Content */}
            <div className="col-lg-6 hero-content">
              <span className="hero-badge">
                <span className="badge-dot"></span>
                YOUR CAREER STARTS HERE
              </span>

              <h1 className="hero-title">
                Practice today.
                <br />
                <span>Perform tomorrow.</span>
              </h1>

              <div className="hero-highlights">
                <span>✓ Real interview practice</span>
                <span>✓ One-to-one video sessions</span>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="col-lg-6">
              <div className="hero-visual">
                <div className="visual-circle visual-circle-one"></div>
                <div className="visual-circle visual-circle-two"></div>

                <div className="visual-label label-top">
                  <span className="label-icon">✦</span>
                  Build your confidence
                </div>

                <div className="video-illustration">
                  <div className="video-topbar">
                    <div className="window-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span>MockMate Interview</span>
                  </div>

                  <div className="video-screen">
                    <div className="video-person interviewer-person">
                      <div className="person-avatar avatar-purple">
                        <span>👩🏻‍💼</span>
                      </div>
                      <span className="person-caption">Interviewer</span>
                    </div>

                    <div className="video-person student-person">
                      <div className="person-avatar avatar-green">
                        <span>👨🏻‍💻</span>
                      </div>
                      <span className="person-caption">Candidate</span>
                    </div>
                  </div>

                  <div className="video-controls">
                    <span className="control-dot">⌕</span>
                    <span className="control-dot">🎙</span>
                    <span className="control-dot end-call">☎</span>
                    <span className="control-dot">⚙</span>
                  </div>
                </div>

                <div className="visual-label label-bottom">
                  <span className="success-icon">✓</span>
                  Learn · Practice · Succeed
                </div>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="role-section">

            <div className="row g-4 role-cards">
              {/* Student Card */}
              <div className="col-md-6">
                <article className="role-card student-card h-100">
                  <div className="role-card-top">
                    <div className="role-icon student-icon">🎓</div>
                    <span className="role-tag student-tag">
                      FOR STUDENTS
                    </span>
                  </div>

                  <h3>I'm a Student</h3>
                  <p>
                    Request mock interviews, practice your skills,
                    and prepare for your dream job with confidence.
                  </p>

                  <button
                    className="btn role-button student-button"
                    onClick={() => navigate("/student-dashboard")}
                  >
                    Student Dashboard <span>→</span>
                  </button>
                </article>
              </div>

              {/* Interviewer Card */}
              <div className="col-md-6">
                <article className="role-card interviewer-card h-100">
                  <div className="role-card-top">
                    <div className="role-icon interviewer-icon">💼</div>
                    <span className="role-tag interviewer-tag">
                      FOR INTERVIEWERS
                    </span>
                  </div>

                  <h3>I'm an Interviewer</h3>
                  <p>
                    Review interview requests, schedule sessions,
                    and help candidates improve their interview skills.
                  </p>

                  <button
                    className="btn role-button interviewer-button"
                    onClick={() => navigate("/interviewer-dashboard")}
                  >
                    Interviewer Dashboard <span>→</span>
                  </button>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="container d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
          <span>
            <strong>MockMate</strong> © 2026
          </span>
          <span>Learn · Practice · Succeed</span>
        </div>
      </footer>
    </main>
  );
}

export default Home;