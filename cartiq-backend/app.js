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
// Manual sanitization middleware for security (prevents NoSQL injection)
app.use((req, res, next) => {
  // Sanitize req.query, req.body, req.params to remove $ and . characters
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key.includes('$') || key.includes('.')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
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

// CRITICAL: Store raw body for webhook signature verification
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
safeRoute("/api/categories", "./routes/categoryRoutes");
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