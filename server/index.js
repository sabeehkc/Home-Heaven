const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const cors = require("cors");

const authRoutes = require("./routes/auth.js");
const listingRoutes = require("./routes/listing.js");
const bookingRoutes = require("./routes/booking.js");
const userRoutes = require("./routes/user.js");
const messageRoutes = require("./routes/message.js");
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/Message.js");

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

//Routes
app.use("/auth", authRoutes);
app.use("/properties", listingRoutes);
app.use("/bookings", bookingRoutes);
app.use("/users", userRoutes);
app.use("/messages", messageRoutes);

// Socket.io Setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this in production
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a specific room based on listing and users
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  // Handle incoming messages
  socket.on("send_message", async (data) => {
    try {
      // Save message to database
      const newMessage = new Message({
        listingId: data.listingId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        text: data.text,
      });
      await newMessage.save();

      // Broadcast to the room
      io.to(data.room).emit("receive_message", newMessage);
    } catch (err) {
      console.log("Error saving message", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

//Mongoose SetUp
const PORT = 4001;
mongoose
  .connect(process.env.MONGO_URL, {
    dbName: "home-heaven",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    server.listen(PORT, () =>
      console.log(`Server runnig on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.log(`${err} did not connect`));
