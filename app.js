require("dotenv").config();
const express = require("express");
const passport = require("passport");
const User = require("./models/user");
const authRouter = require("./routers/authRouter");
const articleRouter = require("./routers/articleRouter");

const app = express();

app.use(express.json());

require("./utilis/authRelatedFunc");

passport.use(User.createStrategy());

app.use("/auth", authRouter);

app.use("/articles", articleRouter);

app.get("/", (req, res) => {
  res.send("Welcome to My Blog API");
});

app.use((error, req, res, next) => {
  console.log(req.url, error);
  res
    .status(500)
    .json({ status: "error", message: "Internal Server Error", data: null });
});

module.exports = app;
