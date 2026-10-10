
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import "./VideoCall.css";

const SERVER_URL = "http://192.168.0.190:9000";
const socket = io("http://192.168.0.190:9000");

export default function VideoCall() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingCandidatesRef = useRef([]);

  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [status, setStatus] = useState("Connecting...");
  const [callEnded, setCallEnded] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const interviewId =
    pathParts[0] === "interview" ? pathParts[1] : null;

  const roomId = params.get("roomId") || interviewId;
  const role =
    params.get("role") === "interviewer" ? "interviewer" : "student";

  // Stop local media and close the WebRTC connection.
  function cleanupCall() {
    const peer = peerConnectionRef.current;

    if (peer && peer.signalingState !== "closed") {
      peer.close();
    }

    peerConnectionRef.current = null;

    localStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    localStreamRef.current = null;
    pendingCandidatesRef.current = [];

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setCameraOn(false);
    setMicOn(false);
    setCallEnded(true);
  }

  useEffect(() => {
    if (!roomId) {
      setStatus("Missing interview room ID");
      return;
    }

    let active = true;
    let makingOffer = false;

    const socket = io(SERVER_URL);
    socketRef.current = socket;

    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
      ],
    });

    peerConnectionRef.current = peer;

    async function startCall() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        stream.getTracks().forEach((track) => {
          peer.addTrack(track, stream);
        });

        setStatus("Waiting for participant");
        socket.emit("join-room", roomId);
      } catch (error) {
        console.error("Camera/microphone error:", error);

        if (active) {
          setStatus("Allow camera and microphone access");
        }
      }
    }

    peer.ontrack = (event) => {
      if (active && remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setStatus("Connected");
      }
    };

    peer.onicecandidate = (event) => {
      if (active && event.candidate) {
        socket.emit("send-ice-candidate", {
          roomId,
          candidate: event.candidate,
        });
      }
    };

    peer.onconnectionstatechange = () => {
      if (!active) return;

      const states = {
        connected: "Connected",
        disconnected: "Connection interrupted",
        failed: "Connection failed",
        closed: "Call ended",
      };

      if (states[peer.connectionState]) {
        setStatus(states[peer.connectionState]);
      }
    };

    async function addCandidate(candidate) {
      if (!active) return;

      if (!peer.remoteDescription) {
        pendingCandidatesRef.current.push(candidate);
        return;
      }

      try {
        await peer.addIceCandidate(candidate);
      } catch (error) {
        console.error("ICE candidate error:", error);
      }
    }

    async function flushCandidates() {
      const candidates = [...pendingCandidatesRef.current];
      pendingCandidatesRef.current = [];

      for (const candidate of candidates) {
        if (!active) return;

        try {
          await peer.addIceCandidate(candidate);
        } catch (error) {
          console.error("Queued ICE candidate error:", error);
        }
      }
    }

    socket.on("peer-ready", async () => {
      if (!active || role !== "student" || makingOffer) return;
      if (peer.signalingState !== "stable") return;

      try {
        makingOffer = true;

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        socket.emit("send-offer", {
          roomId,
          offer: peer.localDescription,
        });
      } catch (error) {
        console.error("Offer error:", error);
      } finally {
        makingOffer = false;
      }
    });

    socket.on("receive-offer", async ({ offer }) => {
      if (!active || role !== "interviewer") return;
      if (peer.signalingState !== "stable") return;

      try {
        await peer.setRemoteDescription(offer);
        await flushCandidates();

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.emit("send-answer", {
          roomId,
          answer: peer.localDescription,
        });
      } catch (error) {
        console.error("Answer creation error:", error);
      }
    });

    socket.on("receive-answer", async ({ answer }) => {
      if (!active || role !== "student") return;
      if (peer.signalingState !== "have-local-offer") return;

      try {
        await peer.setRemoteDescription(answer);
        await flushCandidates();
      } catch (error) {
        console.error("Remote answer error:", error);
      }
    });

    socket.on("receive-ice-candidate", ({ candidate }) => {
      if (candidate) addCandidate(candidate);
    });

    // When the other participant ends the interview, close this call too.
    socket.on("interview-ended", () => {
      if (!active) return;

      setStatus("Interview completed");
      cleanupCall();
      socket.disconnect();
    });

    socket.on("peer-disconnected", () => {
      if (active && !callEnded) {
        setStatus("Participant disconnected");
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);

      if (active) {
        setStatus("Server connection failed");
      }
    });

    startCall();

    return () => {
      active = false;

      socket.removeAllListeners();
      socket.disconnect();

      if (peer.signalingState !== "closed") {
        peer.close();
      }

      localStreamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });

      localStreamRef.current = null;
      peerConnectionRef.current = null;
      pendingCandidatesRef.current = [];

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    };
  }, [roomId, role]);

  function toggleCamera() {
    const next = !cameraOn;

    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = next;
    });

    setCameraOn(next);
  }

  function toggleMicrophone() {
    const next = !micOn;

    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = next;
    });

    setMicOn(next);
  }

  async function endCall() {
    if (callEnded) return;

    setStatus("Ending interview...");

    try {
      const response = await fetch(
        `${SERVER_URL}/api/interviews/${interviewId}/end`,
        { method: "PATCH" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not complete interview.");
      }

      // Notify the other participant before disconnecting the socket.
      socketRef.current?.emit("end-interview", { roomId });

      setStatus("Interview completed");
      cleanupCall();

      socketRef.current?.disconnect();
    } catch (error) {
      console.error("End interview error:", error);
      setStatus("Could not update interview status");
    }
  }

  return (
    <main className="call-page">
      <header className="call-header">
        <div className="brand">
          <div className="brand-icon">M</div>
          <div>
            <h1>Mock Interview</h1>
            <p>Practice. Improve. Succeed.</p>
          </div>
        </div>

        <div className="room-info">
          <span className="live-dot" />
          <span>{status}</span>
          <span className="room-id">Room: {roomId || "N/A"}</span>
        </div>
      </header>

      <section className="call-content">
        <div className="call-heading">
          <div>
            <p className="eyebrow">LIVE INTERVIEW SESSION</p>
            <h2>Your interview room</h2>
            <p>
              Communicate clearly and make the most of your practice session.
            </p>
          </div>

          <span className="role-badge">
            {role === "student" ? "Student" : "Interviewer"}
          </span>
        </div>

        <section className="video-grid">
          <div className="video-card local-card">
            <video ref={localVideoRef} autoPlay playsInline muted />

            <div className="video-label">
              <div className="avatar self-avatar">Y</div>
              <div>
                <strong>You</strong>
                <p>{micOn ? "Microphone on" : "Microphone muted"}</p>
              </div>
            </div>

            <span className="you-badge">YOU</span>
          </div>

          <div className="video-card remote-card">
            <video ref={remoteVideoRef} autoPlay playsInline />

            <div className="video-label">
              <div className="avatar">P</div>
              <div>
                <strong>Interview participant</strong>
                <p>{status}</p>
              </div>
            </div>

            <span className="video-status">{status}</span>
          </div>
        </section>

        <section className="call-toolbar">
          <div className="toolbar-note">
            <strong>Call controls</strong>
            <p>Manage your camera, microphone, or end the session.</p>
          </div>

          <div className="toolbar-actions">
            <button
              type="button"
              className={`control-button ${!cameraOn ? "control-off" : ""}`}
              onClick={toggleCamera}
              disabled={callEnded}
            >
              <span>{cameraOn ? "📷" : "🚫"}</span>
              {cameraOn ? "Camera on" : "Camera off"}
            </button>

            <button
              type="button"
              className={`control-button ${!micOn ? "control-off" : ""}`}
              onClick={toggleMicrophone}
              disabled={callEnded}
            >
              <span>{micOn ? "🎙️" : "🔇"}</span>
              {micOn ? "Mute mic" : "Unmute mic"}
            </button>

            <button
              type="button"
              className="end-call-button"
              onClick={endCall}
              disabled={callEnded}
            >
              {callEnded ? "Call ended" : "End call"}
            </button>
          </div>
        </section>

        <footer className="call-footer">
          <span>Mock Interview Platform</span>
          <span>
            Role: {role} · Room: {roomId || "N/A"}
          </span>
        </footer>
      </section>
    </main>
  );
}
