const { PORT } = require("./configuration");
const app = require("./app");

// API Routes
app.use("/api", require("./services"));

app.use("/",(req,res) => {
    res.send("Welcome to Chat Application API");
});



app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});
