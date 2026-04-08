const express = require("express")
const router = express.Router()

const {
  registerUser,
  loginUser,
  getProfile
} = require("../controllers/authController")

const { protect } = require("../middleware/authMiddleware")

/* ================= AUTH ================= */

router.post("/register", registerUser)
router.post("/login", loginUser)

/* ================= PROFILE ================= */

router.get("/profile", protect, getProfile)

module.exports = router