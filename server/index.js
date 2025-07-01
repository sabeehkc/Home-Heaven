const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const cors = require("cors");

const authRoute = require("./routes/auth.js");

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

//Routes
app.use("/auth", authRoute);

//Mongoose SetUp
const PORT = 4001;
mongoose
  .connect(process.env.MONGO_URL, {
    dbName: "home-heaven",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server runnig on https://localhost:${PORT}`)
    );
  })
  .catch((err) => console.log(`${err} did not connect`));
