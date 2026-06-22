const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const Message = require("./models/Message.js");

mongoose.connect(process.env.MONGO_URL, {
  dbName: "home-heaven",
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log("Connected to DB");
  const messages = await Message.find({});
  console.log("All Messages:", messages);
  process.exit(0);
})
.catch(err => {
  console.error("Error", err);
  process.exit(1);
});
