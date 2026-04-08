require("dotenv").config()

const express = require("express")
const cors = require("cors")

const connectDB = require("./config/db")

/* ================= ROUTES ================= */

const productRoutes = require("./routes/productRoutes")
const uploadRoutes = require("./routes/uploadRoutes")
const orderRoutes = require("./routes/orderRoutes")
const aiRoutes = require("./routes/aiRoutes")
const authRoutes = require("./routes/authRoutes")

/* ================= INIT ================= */

connectDB()

const app = express()

/* ================= MIDDLEWARE ================= */

app.use(cors())
app.use(express.json())

/* ================= API ROUTES ================= */

app.use("/api/products", productRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/ai", aiRoutes)
app.use("/api/auth", authRoutes)

/* ================= ROOT ================= */

app.get("/", (req, res) => {
  res.send("CartIQ Backend is running 🚀")
})

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})