const http = require('http');
const mongoose = require('mongoose');
const { PORT, MONGO_URI } = require("./configuration");
const app = require("./app");
const initSocket = require("./services/v1/chat/socket");

// Creating HTTP Server for Socket.io
const server = http.createServer(app);


mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Initializing Socket.io
const io = initSocket(server);


app.use("/api", require("./services"));

app.get("/", (req, res) => {
    res.send("Welcome to Chat Application API");
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});