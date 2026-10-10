import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/Axios.jsx";
import "../../css/Signup.css"

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/signup", {
        name,
        email,
        password,
      });

      alert(response.data.message);

      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Signup Failed");
      console.log(error);
    }
  };

  return (
    <div className="signup-page">
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div
        className="card shadow p-4"
        style={{ width: "400px" }}
      >
        <h2 className="text-center mb-3">
          Create Account
        </h2>

        <p className="text-center text-muted">
          Join Debug Contest Platform
        </p>

        <form onSubmit={handleSignup}>
          {/* Name */}

          <div className="mb-3">
            <label className="form-label">
              Name
            </label>

            <input
              type="text"
              className="form-control"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email */}

          <div className="mb-3">
            <label className="form-label">
              Email
            </label>

            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}

          <div className="mb-3">
            <label className="form-label">
              Password
            </label>

            <input
              type="password"
              className="form-control"
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
          >
            Signup
          </button>
        </form>

        <p className="text-center mt-3">
          Already have an account?
          <Link to="/login"> Login</Link>
        </p>
      </div>
    </div>
     </div>
  );
}

export default Signup;