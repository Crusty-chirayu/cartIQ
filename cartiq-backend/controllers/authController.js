const User = require("../models/User")
const generateToken = require("../utils/generateToken")

/* ================= REGISTER ================= */

const registerUser = async (req, res) => {

  try {

    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      })
    }

    const userExists = await User.findOne({ email })

    if (userExists) {
      return res.status(400).json({
        message: "User already exists"
      })
    }

    const user = await User.create({
      name,
      email,
      password
    })

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user)
    })

  } catch (error) {

    console.error("REGISTER ERROR:", error)

    res.status(500).json({
      message: "Registration failed"
    })

  }

}

/* ================= LOGIN ================= */

const loginUser = async (req, res) => {

  try {

    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password"
      })
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user)
    })

  } catch (error) {

    console.error("LOGIN ERROR:", error)

    res.status(500).json({
      message: "Login failed"
    })

  }

}

/* ================= GET PROFILE ================= */

const getProfile = async (req, res) => {

  res.json(req.user)

}

module.exports = {
  registerUser,
  loginUser,
  getProfile
}