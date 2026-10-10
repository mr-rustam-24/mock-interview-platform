import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { Link } from "react-router-dom";
import "../../css/Navbar.css";

function Home() {
  const navigate = useNavigate();

  return (
    <main className="home-page">
      <nav className="home-nav">
        <div className="home-logo">
          <span className="logo-icon">M</span>
          <span>MockMate</span>
        </div>
        <span className="nav-label">Mock Interview Platform</span>

            <ul className="navbar-nav ms-auto align-items-center auth-nav-links">

              <li className="nav-item">

                <Link
                  className="nav-link"
                  to="/login"
                >
                  Login
                </Link>

              </li>


              <li className="nav-item">

                <Link
                  className="nav-link dc-signup-link"
                  to="/signup"
                >
                  Signup
                </Link>

              </li>

            </ul>

      </nav>

      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">
            YOUR CAREER STARTS HERE
          </span>

          <h1>
            Practice today.
            <br />
            <span>Perform tomorrow.</span>
          </h1>

          <p className="hero-description">
            A better way to prepare for interviews.
            Connect with interviewers, practice your skills,
            and build confidence for your next opportunity.
          </p>

          <h2 className="role-heading">
            How would you like to continue?
          </h2>

          <div className="role-cards">
            <article className="role-card student-card">
              <div className="role-icon">🎓</div>
              <h3>I'm a Student</h3>
              <p>
                Request mock interviews, practice your
                skills, and prepare for your dream job.
              </p>
              <button
                className="role-button student-button"
                onClick={() => navigate("/student-dashboard")}
              >
                Student Dashboard <span>→</span>
              </button>
            </article>

            <article className="role-card interviewer-card">
              <div className="role-icon">💼</div>
              <h3>I'm an Interviewer</h3>
              <p>
                Review interview requests, schedule sessions,
                and conduct mock interviews.
              </p>
              <button
                className="role-button interviewer-button"
                onClick={() => navigate("/interviewer-dashboard")}
              >
                Interviewer Dashboard <span>→</span>
              </button>
            </article>
          </div>
        </div>

        <div className="hero-decoration">
          <div className="decoration-circle circle-one"></div>
          <div className="decoration-circle circle-two"></div>
          <div className="floating-card">
            <span className="floating-icon">✓</span>
            <div>
              <strong>Practice with confidence</strong>
              <p>Your next opportunity awaits.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <span>MockMate © 2026</span>
        <span>Learn · Practice · Succeed</span>
      </footer>
    </main>
  );
}

export default Home;
