import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../css/Login.css"
import api from "../../api/Axios";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      alert("Login Successful");

      localStorage.setItem("token", response.data.token);

      navigate("/contest");
    } catch (error) {
      alert("Invalid Email or Password");
      console.log(error);
    }
  };

  return (
    <div className="login-page">
      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="card shadow p-4" style={{ width: "400px" }}>
          <h2 className="text-center mb-3">Welcome Back 👋</h2>

          <p className="text-center text-muted">
            Login to continue Debug Contest
          </p>

          <form onSubmit={handleLogin}>
            {/* Email */}

            <div className="mb-3">
              <label className="form-label">Email</label>

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
              <label className="form-label">Password</label>

              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Link to="/forgot-password">Forgot Password</Link>
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>
          </form>

          <p className="text-center mt-3">
            Don't have an account?
            <Link to="/signup"> Signup</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
