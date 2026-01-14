const http = require('http');
const { Server } = require("socket.io");
const { PORT, MONGO_URI } = require("./configuration");
const app = require("./app");

// Creating HTTP Server for Socket.io
const server = http.createServer(app);

// Initializing Socket.io
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

// API Routes
app.use("/api", require("./services"));

app.get("/", (req, res) => {
    res.send("Welcome to Chat Application API");
});

// Socket Logic
io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // Join a room
    socket.on("join_room", (data) => {
        socket.join(data);
        console.log(`User with ID: ${socket.id} joined room: ${data}`);
    });

    // Send Message
    socket.on("send_message", (data) => {
        socket.to(data.room).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});


server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});