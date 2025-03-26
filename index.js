const express = require("express");
// const mongoose = require("mongoose");
require("dotenv").config();


const connectDatabase = require("./config");
const booksRoute = require("./routes/bookRoute");
const userRoute = require("./routes/userRoute");
const cors = require("cors");
const PORT = 5001;
const app = express();

app.use(express.json());
app.use(cors());
connectDatabase();
// app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.get("/", (request, response) => {
  console.log(request);
  return response.status(234).send("welcome to Mern Stack");
});

app.use("/user", userRoute);

app.use("/books", booksRoute);
// app.use("/user", userRoute);

app.listen(PORT, () => {
  console.log(`App is listening to port ${PORT}`);
});
