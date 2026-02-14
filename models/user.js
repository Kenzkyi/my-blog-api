const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose").default;

const User = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    password: String,
  },
  { timestamps: true },
);

User.plugin(passportLocalMongoose, { usernameField: "email" });

module.exports = new mongoose.model("User", User);
