
require("dotenv").config();

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();


const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.0.190:5173",
  "https://mock-interview-platform-blue-rho.vercel.app",
];

// 1. Middleware
app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use(express.json());


// 2. Create HTTP server
const server = http.createServer(app);

// 3. Initialize Socket.IO

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH"],
  },
});


// 4. Health-check endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Mock Interview Server is running",
  });
});

// 5. Connect interview API routes
const interviewRoutes = require("./routes/interviewRoutes");

app.use("/api/interviews", interviewRoutes);

// 6. Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

// 7. Socket.IO connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join the interview room
  socket.on("join-room", (roomId) => {
    if (typeof roomId !== "string" || !roomId.trim()) {
      return;
    }

    const existingClients = io.sockets.adapter.rooms.get(roomId);

    const anotherParticipant =
      existingClients &&
      [...existingClients].some((id) => id !== socket.id);

    socket.join(roomId);

    console.log(`${socket.id} joined room: ${roomId}`);

    if (anotherParticipant) {
      socket.emit("peer-ready");
      socket.to(roomId).emit("peer-ready");

      console.log("Both participants joined:", roomId);
    }
  });

  // Relay WebRTC offer
  socket.on("send-offer", ({ roomId, offer } = {}) => {
    if (!roomId || !offer || !socket.rooms.has(roomId)) {
      return;
    }

    socket.to(roomId).emit("receive-offer", { offer });
    console.log("Offer relayed:", roomId);
  });

  // Relay WebRTC answer
  socket.on("send-answer", ({ roomId, answer } = {}) => {
    if (!roomId || !answer || !socket.rooms.has(roomId)) {
      return;
    }

    socket.to(roomId).emit("receive-answer", { answer });
    console.log("Answer relayed:", roomId);
  });

  // Relay ICE candidates
  socket.on(
    "send-ice-candidate",
    ({ roomId, candidate } = {}) => {
      if (!roomId || !candidate || !socket.rooms.has(roomId)) {
        return;
      }

      socket.to(roomId).emit("receive-ice-candidate", {
        candidate,
      });
    }
  );

  
  // Notify the other participant when someone explicitly ends the interview.
  socket.on("end-interview", ({ roomId } = {}) => {
    if (typeof roomId !== "string" || !roomId.trim()) {
      return;
    }

    // Only a participant who joined this room can end its call.
    if (!socket.rooms.has(roomId)) {
      return;
    }

    // Notify the other participant without notifying the sender.
    socket.to(roomId).emit("interview-ended");

    console.log(`Interview ended by ${socket.id} in room: ${roomId}`);
  });

  // Notify the other participant when someone leaves
  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      if (roomId === socket.id) continue;

      socket.to(roomId).emit("peer-disconnected");
      console.log(`${socket.id} leaving room: ${roomId}`);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("User disconnected:", socket.id, reason);
  });
});

// 8. Start server
const PORT = process.env.PORT || 9000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});