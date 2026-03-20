const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const { protect } = require("../middleware/auth");

// Helper: generate consistent roomId for two users
const getRoomId = (id1, id2) => [id1, id2].sort().join("_");

// @GET /api/messages/:userId — get conversation with a user
router.get("/:userId", protect, async (req, res) => {
  try {
    const roomId = getRoomId(req.user._id.toString(), req.params.userId);
    const messages = await Message.find({ roomId })
      .populate("sender", "username avatar")
      .populate("receiver", "username avatar")
      .sort({ createdAt: 1 })
      .limit(100);

    // Mark as read
    await Message.updateMany(
      { roomId, receiver: req.user._id, read: false },
      { read: true }
    );

    res.json({ messages, roomId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/messages — get recent conversations list
router.get("/", protect, async (req, res) => {
  try {
    // Get last message with each user
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: req.user._id }, { receiver: req.user._id }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$roomId",
          lastMessage: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$lastMessage" } },
    ]);

    await Message.populate(messages, [
      { path: "sender", select: "username avatar" },
      { path: "receiver", select: "username avatar" },
    ]);

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
