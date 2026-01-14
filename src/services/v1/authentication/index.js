const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../users/model/User");
const { JWT_SECRET, JWT_EXPIRE } = require("../../../configuration");

router.get("/", (_req, res) => {
    res.send("This is authentication route");
});

router.post("/register", async (req, res) => {

    console.log(req.body);

    try {
        const { username, password, email } = req.body;
        const role = req.body.role || "user";
        const user = await User.create({ username, password, email, role });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
        
        res.status(201).json({ success: true, token });
    } catch (error) {
        console.log(error);
        res.status(400).json({ success: false, error: error.message });
    }
});


router.post("/login", async (req, res) => {
    console.log(req.body);
    try {
        const { username, password } = req.body;
        

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ success: false, error: "Invalid credentials" });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });

        res.status(200).json({ success: true, token, user: { id: user._id, username: user.username, role: user.role } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;