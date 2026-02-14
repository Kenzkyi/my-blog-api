require("dotenv").config();
const passport = require("passport");
const User = require("../models/user");

const jwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

passport.use(
  new jwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (jwt_info, done) => {
      try {
        const user = await User.findById(jwt_info._id);
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    },
  ),
);
