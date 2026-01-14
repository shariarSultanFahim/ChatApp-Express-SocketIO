const express = require("express");
const router = express.Router();

const Message = require("./model/Message");
const Room = require("./model/Room");

const protect = require("../../../auth.middleware");

// Get all chat rooms (admin only)
router.get("/rooms", protect, async (req, res) => {
    console.log(req.user);
	try {
		if (req.user.role !== 'admin') {
			return res.status(403).json({ success: false, error: "Only admin can access this route" });
		}

		const rooms = await Room.find()
			.populate('createdBy', 'username email')
			.populate('members', 'username email');

		res.status(200).json({ 
			success: true, 
			count: rooms.length,
			data: rooms 
		});
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
});

// Get list of chat rooms user is in
router.get("/my-rooms", protect, async (req, res) => {
	try {
		const rooms = await Room.find({ members: req.user._id })
			.populate('createdBy', 'username email')
			.populate('members', 'username email');

		res.status(200).json({ 
			success: true, 
			count: rooms.length,
			data: rooms 
		});
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
});

// Get chat history for a room (ordered by timestamp)
router.get("/history", protect, async (req, res) => {
    
	try {
        const {roomName} = req.query;

		// Check if user is member of the room
		const room = await Room.findOne({ name: roomName });
		
		if (!room) {
			return res.status(404).json({ success: false, error: "Room not found" });
		}

		const isMember = room.members.includes(req.user._id);
		if (!isMember && req.user.role !== 'admin') {
			return res.status(403).json({ success: false, error: "You are not a member of this room" });
		}

		const messages = await Message.find({ room: roomName })
			.populate('sender', 'username email')
			.sort({ createdAt: -1 }) 

		const totalMessages = await Message.countDocuments({ room: roomName });

		res.status(200).json({ 
			success: true, 
			count: messages.length,
			total: totalMessages,
			data: messages 
		});
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
});

router.get("/", (_req, res) => {
	res.status(200).json({ success: true, message: "This is chat route" });
});

module.exports = router;