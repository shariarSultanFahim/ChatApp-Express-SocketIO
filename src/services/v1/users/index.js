const express = require("express");
const router = express.Router();
const User = require("./model/User");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../../../configuration");

// Middleware to protect routes
const protect = async (req, res, next) => {
	try {
		let token;
		if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
			token = req.headers.authorization.split(" ")[1];
		}

		if (!token) {
			return res.status(401).json({ success: false, error: "Not authorized to access this route" });
		}

		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = await User.findById(decoded.id).select("-password");
		
		if (!req.user) {
			return res.status(401).json({ success: false, error: "User not found" });
		}
		
		next();
	} catch (error) {
		res.status(401).json({ success: false, error: "Not authorized to access this route" });
	}
};

//Get all users
router.get("/all", protect,  async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user by by ID
router.get("/", protect, async (req, res) => {
	try {
		const { id } = req.query;
		
		if (!id) {
			return res.status(400).json({ success: false, error: "Please provide user ID in query parameter" });
		}

		const user = await User.findById(id).select("-password");
		
		if (!user) {
			return res.status(404).json({ success: false, error: "User not found" });
		}
		
		res.status(200).json({ success: true, data: user });
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
});

// Update user by ID
router.put("/", protect, async (req, res) => {
	try {
        const { id } = req.query;
		if (req.user._id.toString() !== id) {
			return res.status(403).json({ success: false, error: "Not authorized to update this user" });
		}

		const { username } = req.body;
		const updateData = {};
		
		if (username) updateData.username = username;

		const user = await User.findByIdAndUpdate(
			id,
			updateData,
			{ new: true, runValidators: true }
		).select("-password");

		if (!user) {
			return res.status(404).json({ success: false, error: "User not found" });
		}

		res.status(200).json({ success: true, data: user });
	} catch (error) {
		res.status(400).json({ success: false, error: error.message });
	}
});

// Update user password
router.put("/password", protect, async (req, res) => {
	try {
        const { id } = req.query;
		// Checking to make sure user is updating their own password
		if (req.user._id.toString() !== id) {
			return res.status(403).json({ success: false, error: "Not authorized to update this user's password" });
		}

		const { currentPassword, newPassword } = req.body;

		if (!currentPassword || !newPassword) {
			return res.status(400).json({ success: false, error: "Please provide current and new password" });
		}

		const user = await User.findById(id);

		if (!user) {
			return res.status(404).json({ success: false, error: "User not found" });
		}

		// Verify current password
		const isMatch = await user.matchPassword(currentPassword);
		if (!isMatch) {
			return res.status(401).json({ success: false, error: "Current password is incorrect" });
		}

		// Update password
		user.password = newPassword;
		await user.save();

		res.status(200).json({ success: true, message: "Password updated successfully" });
	} catch (error) {
		res.status(400).json({ success: false, error: error.message });
	}
});

module.exports = router;
