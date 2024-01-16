const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync");
const { saveRedirectUrl } = require("../middleware");
const userControllers = require("../controllers/users");


router.route("/signup")
.get(userControllers.renderSignUpForm)
.post( wrapAsync(userControllers.signUp));

router.route("/login")
.get(userControllers.renderLoginForm)
.post(
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userControllers.login
);

router.get("/logout", userControllers.logout);
module.exports = router;
