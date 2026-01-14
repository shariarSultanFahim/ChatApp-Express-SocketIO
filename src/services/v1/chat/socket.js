const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../users/model/User"); 
const Message = require("./model/Message");
const { JWT_SECRET } = require("../../../configuration");

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", 
            methods: ["GET", "POST"]
        }
    });

    io.use(async (socket, next) => {
        try {
            // Client should send token in auth object: { auth: { token: "..." } }
            const token = socket.handshake.auth.token || socket.handshake.headers.token;

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
        socket.on("join_room", (room) => {
            if (!room) return;
            socket.join(room);
            console.log(`User ${socket.user.username} joined room: ${room}`);
            socket.to(room).emit("notification", `${socket.user.username} joined`);
        });

        // Send Message
        socket.on("send_message", async (data) => {
            try {
                const { room, content } = data;

                if (!room || !content) return;

                // Save to Database
                const newMessage = await Message.create({
                    sender: socket.user._id,
                    content: content,
                    room: room
                });

                
                const populatedMessage = await newMessage.populate("sender", "username email");

                // Broadcast to room (excluding sender)
                socket.to(room).emit("receive_message", populatedMessage);
                

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