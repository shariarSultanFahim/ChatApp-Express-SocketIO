const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true },
    room: { type: String },
    type: {
      type: String,
      enum: ["text", "image"],
      default: "text",
    },
    attachmentUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
