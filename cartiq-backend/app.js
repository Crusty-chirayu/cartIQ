const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");

const logger = require("./utils/logger");
const { errorHandler } = require("./middleware/errorHandlerMiddleware");
const requestLogger = require("./middleware/requestLoggerMiddleware");

const app = express();

// ================== MIDDLEWARE ==================
app.use(helmet());

// Manual sanitization middleware
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === "object") {
      for (const key in obj) {
        if (key.includes("$") || key.includes(".")) {
          delete obj[key];
        } else if (typeof obj[key] === "object") {
          sanitize(obj[key]);
        }
      }
    }
    return obj;
  };
  sanitize(req.query);
  sanitize(req.body);
  sanitize(req.params);
  next();
});

app.use(compression());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Webhook raw body
app.use((req, res, next) => {
  if (req.path === "/api/payments/webhook/stripe") {
    express.raw({ type: "application/json" })(req, res, next);
  } else {
    next();
  }
});

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

// ================== ROUTES (FIXED) ==================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/support", require("./routes/supportRoutes"));
app.use("/api/vendor", require("./routes/vendorRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));

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