
const express = require("express");
const {
  createInterview,
  getPendingInterviews,
  scheduleInterview,
  getStudentInterviews,
  getScheduledInterviews,
  getCompletedInterviews,
  endInterview,
} = require("../controllers/interviewController");

const router = express.Router();

router.post("/", createInterview);
router.get("/pending", getPendingInterviews);
router.get("/student", getStudentInterviews);
router.get("/scheduled", getScheduledInterviews);
router.patch("/:id/schedule", scheduleInterview);
router.patch("/:id/end", endInterview);
router.get("/completed", getCompletedInterviews);

module.exports = router;