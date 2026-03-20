const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => res.send("MERN Chat Server Running ✅"));

// Socket.IO
const onlineUsers = new Map(); // userId -> socketId

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // User joins with their userId
  socket.on("user:join", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("users:online", Array.from(onlineUsers.keys()));
    console.log(`👤 User ${userId} is online`);
  });

  // Join a private room
  socket.on("room:join", (roomId) => {
    socket.join(roomId);
  });

  // Send message
  socket.on("message:send", async (data) => {
    try {
      const { senderId, receiverId, text, roomId } = data;
      const message = new Message({ sender: senderId, receiver: receiverId, text, roomId });
      await message.save();
      await message.populate("sender", "username avatar");

      // Emit to the room
      io.to(roomId).emit("message:receive", message);
    } catch (err) {
      console.error("Message error:", err.message);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Typing indicator
  socket.on("typing:start", (data) => {
    socket.to(data.roomId).emit("typing:start", { userId: data.userId, username: data.username });
  });

  socket.on("typing:stop", (data) => {
    socket.to(data.roomId).emit("typing:stop", { userId: data.userId });
  });

  // Disconnect
  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("users:online", Array.from(onlineUsers.keys()));
    console.log("❌ User disconnected:", socket.id);
  });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
