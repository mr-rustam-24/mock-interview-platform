
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./pages/Home";
import StudentDashboard from "./pages/StudentDashboard";
import InterviewerDashboard from "./pages/InterviewerDashboard";
import VideoCall from "./pages/VideoCall";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/student-dashboard"
          element={<StudentDashboard />}
        />

        <Route
          path="/interviewer-dashboard"
          element={<InterviewerDashboard />}
        />

        <Route
          path="/interview/:interviewId"
          element={<VideoCall />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
