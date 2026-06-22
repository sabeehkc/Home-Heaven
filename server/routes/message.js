const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");

// Get unique guests who messaged the host for a listing
router.get("/guests/:listingId/:hostId", async (req, res) => {
  try {
    const { listingId, hostId } = req.params;

    const messages = await Message.find({
      listingId,
      $or: [{ senderId: hostId }, { receiverId: hostId }],
    });

    const guestIds = new Set();
    messages.forEach((msg) => {
      if (msg.senderId.toString() !== hostId) guestIds.add(msg.senderId.toString());
      if (msg.receiverId.toString() !== hostId) guestIds.add(msg.receiverId.toString());
    });

    const guests = await User.find({ _id: { $in: Array.from(guestIds) } }).select(
      "firstName lastName profileImagePath"
    );

    res.status(200).json(guests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch guests", error: err.message });
  }
});

// Get messages for a specific listing between two users
router.get("/:listingId/:user1Id/:user2Id", async (req, res) => {
  try {
    const { listingId, user1Id, user2Id } = req.params;

    const messages = await Message.find({
      listingId,
      $or: [
        { senderId: user1Id, receiverId: user2Id },
        { senderId: user2Id, receiverId: user1Id },
      ],
    }).sort({ createdAt: 1 }); // Sort by time

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages", error: err.message });
  }
});

module.exports = router;
