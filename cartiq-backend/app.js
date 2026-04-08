const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");

const logger = require("./utils/logger");
const { errorHandler } = require("./middleware/errorHandlerMiddleware");
const requestLogger = require("./middleware/requestLoggerMiddleware");

const app = express();

// ================== MIDDLEWARE ==================
app.use(helmet());
app.use(mongoSanitize());
app.use(compression());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const morganStream = {
  write: (message) => logger.info(message.trim()),
};
app.use(morgan("combined", { stream: morganStream }));
app.use(requestLogger());

// ================== HEALTH ==================
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// ================== SAFE ROUTE LOADER ==================
const safeRoute = (path, routePath) => {
  try {
    const route = require(routePath);

    if (typeof route !== "function") {
      console.log(`❌ ${routePath} is NOT a router`);
      return;
    }

    console.log(`✅ Loaded ${routePath}`);
    app.use(path, route);
  } catch (err) {
    console.log(`❌ Failed to load ${routePath}`);
    console.log(err.message);
  }
};

// ================== ROUTES ==================
safeRoute("/api/auth", "./routes/authRoutes");
safeRoute("/api/products", "./routes/productRoutes");
safeRoute("/api/cart", "./routes/cartRoutes");
safeRoute("/api/orders", "./routes/orderRoutes");
safeRoute("/api/wishlist", "./routes/wishlistRoutes");
safeRoute("/api/reviews", "./routes/reviewRoutes");
safeRoute("/api/ai", "./routes/aiRoutes");
safeRoute("/api/support", "./routes/supportRoutes");
safeRoute("/api/vendor", "./routes/vendorRoutes");
safeRoute("/api/admin", "./routes/adminRoutes");
safeRoute("/api/payments", "./routes/paymentRoutes");

// ================== 404 ==================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ================== ERROR ==================
app.use(errorHandler);

module.exports = app;