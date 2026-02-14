require("dotenv").config();
const Joi = require("joi");
const { formatResponse } = require("../utilis/dataFormatter");
const User = require("../models/user");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  const data = req.body;

  const schema = Joi.object({
    email: Joi.string().email().required(),
    first_name: Joi.string().min(2).required(),
    last_name: Joi.string().min(2).required(),
    password: Joi.string().min(6).required(),
  });

  const validationResult = schema.validate(data);

  if (validationResult.error) {
    return res
      .status(400)
      .json(formatResponse(validationResult.error.message, null));
  }

  try {
    const newUser = await User.register(
      new User({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
      }),
      data.password,
    );
    res.status(200).json(
      formatResponse(
        null,
        {
          email: newUser.email,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
        },
        "User registered successfully",
      ),
    );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(
        formatResponse(
          error?.message.replace("username", "email") || "An error occurred",
          null,
        ),
      );
  }
};

const login = async (req, res, next) => {
  const data = req.body;
  const schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });

  const validationResult = schema.validate(data);

  if (validationResult.error) {
    return res.status(400).json(formatResponse(validationResult.error.message));
  }

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.log(err);
      return next(err);
    }

    if (!user) {
      console.log(info);
      return res.status(400).json(formatResponse("Invalid Credentials"));
    }
    const JWT_SECRET = process.env.JWT_SECRET;
    const token = jwt.sign({ _id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const dataToBeSent = {
      user: {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      token: token,
    };
    res
      .status(200)
      .json(formatResponse(null, dataToBeSent, "Login successful"));
  })(req, res, next);
};

module.exports = { signup, login };
