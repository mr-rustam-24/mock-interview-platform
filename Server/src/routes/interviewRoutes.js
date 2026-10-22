
const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
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

router.post("/", authMiddleware,createInterview);
router.get("/pending", authMiddleware,getPendingInterviews);
router.get("/student", authMiddleware,getStudentInterviews);
router.get("/scheduled", authMiddleware,getScheduledInterviews);
router.patch("/:id/schedule", authMiddleware,scheduleInterview);
router.patch("/:id/end", authMiddleware,endInterview);
router.get("/completed",authMiddleware, getCompletedInterviews);

module.exports = router;