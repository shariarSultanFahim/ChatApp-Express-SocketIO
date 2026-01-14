const http = require('http');
const mongoose = require('mongoose');
const { Server } = require("socket.io");
const { PORT, MONGO_URI } = require("./configuration");
const app = require("./app");

// Creating HTTP Server
const server = http.createServer(app);

// Initializing Socket.io
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

// Connecting to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// API Routes
app.use("/api", require("./services"));

app.get("/", (req, res) => {
    res.send("Welcome to Chat Application API");
});

// Socket Logic
io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // Example: Join a room
    socket.on("join_room", (data) => {
        socket.join(data);
        console.log(`User with ID: ${socket.id} joined room: ${data}`);
    });

    // Example: Send Message
    socket.on("send_message", (data) => {
        // Here you would typically save to MongoDB using the Message model
        socket.to(data.room).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});

// Start Server
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});