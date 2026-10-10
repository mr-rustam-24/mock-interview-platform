const express = require("express");

const router = express.Router();
const {signup} = require("../controllers/auth.controller");
const {login} = require("../controllers/auth.controller");
// const {forgotPassword} = require("../controller/auth.controller")
// const {resetPassword} = require("../controller/auth.controller");


router.post("/signup",signup);
router.post("/login",login);
// router.post("/forgot-password" , forgotPassword);
// router.post("/reset-password/:token", resetPassword);
module.exports = router;