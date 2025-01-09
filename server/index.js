const expres = require("express");
const app = expres();
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const cors = require("cors");

const authRoute = require("./routes/auth")

app.use(cors());
app.use(expres.json());
app.use(expres.static("public"));


//Routes
app.use('/auth', authRoute)

//Mongoose SetUp
const PORT = 4001;
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => console.log(`Server runnig on https://localhost:${PORT}`));
  })
  .catch((err) => console.log(`${err} did not connect`));