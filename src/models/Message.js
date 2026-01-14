const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    // Room Field Goes Here if needed
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);