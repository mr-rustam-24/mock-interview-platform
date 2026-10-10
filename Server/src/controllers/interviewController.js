
const Interview = require("../models/Interview");

// Create a new interview request.
exports.createInterview = async (req, res) => {
  try {
    const { studentName, studentEmail, topic, notes } = req.body;

    if (!studentName || !studentEmail || !topic) {
      return res.status(400).json({
        success: false,
        message: "Student name, email, and topic are required.",
      });
    }

    const interview = await Interview.create({
      studentName,
      studentEmail,
      topic,
      notes: notes || "",
    });

    return res.status(201).json({
      success: true,
      message: "Interview request created successfully.",
      interview,
    });
  } catch (error) {
    console.error("Create interview error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create interview request.",
    });
  }
};

// Get all pending interview requests.
exports.getPendingInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ status: "pending" })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    console.error("Get pending interviews error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch interview requests.",
    });
  }
};

// Schedule a pending interview.
exports.scheduleInterview = async (req, res) => {
  try {
    const { scheduledAt } = req.body;

    if (!scheduledAt || Number.isNaN(Date.parse(scheduledAt))) {
      return res.status(400).json({
        success: false,
        message: "A valid interview date and time are required.",
      });
    }

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview request not found.",
      });
    }

    if (interview.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending interviews can be scheduled.",
      });
    }

    const date = new Date(scheduledAt);

    if (date <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "The interview date must be in the future.",
      });
    }

    interview.scheduledAt = date;
    interview.status = "scheduled";

    await interview.save();

    return res.status(200).json({
      success: true,
      message: "Interview scheduled successfully.",
      interview,
    });
  } catch (error) {
    console.error("Schedule interview error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to schedule interview.",
    });
  }
};

// Get interviews belonging to a student by email.
exports.getStudentInterviews = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Student email is required.",
      });
    }

    const interviews = await Interview.find({
      studentEmail: email.trim().toLowerCase(),
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    console.error("Get student interviews error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student interviews.",
    });
  }
};

// Get all scheduled interviews.
exports.getScheduledInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({
      status: "scheduled",
    }).sort({ scheduledAt: 1 });

    return res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    console.error("Get scheduled interviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch scheduled interviews.",
    });
  }
};


 // End a scheduled interview.
exports.endInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found.",
      });
    }

    if (interview.status !== "scheduled") {
      return res.status(400).json({
        success: false,
        message: "Only scheduled interviews can be completed.",
      });
    }

    interview.status = "completed";
    await interview.save();

    return res.status(200).json({
      success: true,
      message: "Interview completed successfully.",
      interview,
    });
  } catch (error) {
    console.error("End interview error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to end interview.",
    });
  }
};



exports.getCompletedInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({
      status: "completed",
    }).sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    console.error("Get completed interviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch completed interviews.",
    });
  }
};


