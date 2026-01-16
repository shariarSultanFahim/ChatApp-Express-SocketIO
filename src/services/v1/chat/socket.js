const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../users/model/User");
const Message = require("./model/Message");
const Room = require("./model/Room");
const { JWT_SECRET } = require("../../../configuration");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    try {
      // Client should send token in auth object: { auth: { token: "..." } }
      const token =
        socket.handshake.auth.token || socket.handshake.headers.token;

      if (!token) {
        return next(new Error("Authentication error: Token required"));
      }

      // Verify JWT
      const decoded = jwt.verify(token, JWT_SECRET);

      // Find user and attach to socket instance
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.user.username} (${socket.id})`);

    // Join a room
    socket.on("join_room", async (room) => {
      try {
        if (!room) return;

        // Check if room exists in database
        let roomData = await Room.findOne({ name: room });

        if (!roomData) {
          // Create new room if it doesn't exist
          roomData = await Room.create({
            name: room,
            description: "",
            members: [socket.user._id],
            createdBy: socket.user._id,
          });
          console.log(`Room created: ${room} by ${socket.user.username}`);
        } else {
          // Add user to members if not already a member
          if (!roomData.members.includes(socket.user._id)) {
            roomData.members.push(socket.user._id);
            await roomData.save();
            console.log(`User ${socket.user.username} added to room: ${room}`);
          }
        }

        // Join the socket room
        socket.join(room);
        console.log(`User ${socket.user.username} joined room: ${room}`);
        socket.to(room).emit("notification", `${socket.user.username} joined`);
      } catch (error) {
        console.error("Join room error:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // Send Message
    socket.on("send_message", async (data) => {
      try {
        const { room, content, type, attachmentUrl } = data;

        if (!room) return;

        // Save to Database
        const newMessage = await Message.create({
          sender: socket.user._id,
          content: content || "",
          room: room,
          type: type || "text",
          attachmentUrl: attachmentUrl || null,
        });

        console.log(
          `Message from ${socket.user.username} in room ${room}: ${content}`
        );

        const populatedMessage = await newMessage.populate(
          "sender",
          "username email"
        );

        // Broadcast to room (including sender)
        io.to(room).emit("receive_message", populatedMessage);
      } catch (error) {
        console.error("Message Error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected", socket.id);
    });
  });

  return io;
};

module.exports = initSocket;
