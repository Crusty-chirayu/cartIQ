const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

const {
  protect,
  authorizeRoles
} = require("../middleware/authMiddleware");

/* ================= GET ALL PRODUCTS ================= */

router.get("/", async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("user", "name email");

    res.json(products);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

/* ================= SELLER PRODUCTS ================= */
/* MUST BE BEFORE :id ROUTE */

router.get(
  "/my-products",
  protect,
  authorizeRoles("seller", "admin"),
  async (req, res) => {
    try {
      const products = await Product.find({
        user: req.user._id
      });

      res.json(products);
    } catch (error) {
      console.error("MY PRODUCTS ERROR:", error);
      res.status(500).json({
        message: "Failed to fetch seller products"
      });
    }
  }
);

/* ================= GET SINGLE PRODUCT ================= */

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("user", "name email");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

/* ================= CREATE PRODUCT ================= */
/* ONLY SELLER OR ADMIN */

router.post(
  "/",
  protect,
  authorizeRoles("seller", "admin"),
  async (req, res) => {
    try {
      console.log("Incoming product data:", req.body);

      const {
        name,
        description,
        price,
        image,
        category,
        countInStock
      } = req.body;

      if (!name || !price) {
        return res.status(400).json({
          message: "Name and price are required"
        });
      }

      const product = new Product({
        name,
        description,
        price,
        image,
        category,
        countInStock,
        user: req.user._id   // 🔥 seller ownership
      });

      const createdProduct = await product.save();

      res.status(201).json(createdProduct);

    } catch (error) {
      console.error("CREATE PRODUCT ERROR:", error);

      res.status(500).json({
        message: "Failed to create product",
        error: error.message
      });
    }
  }
);

/* ================= UPDATE PRODUCT ================= */
/* ONLY OWNER OR ADMIN */

router.put(
  "/:id",
  protect,
  authorizeRoles("seller", "admin"),
  async (req, res) => {
    try {
      const {
        name,
        description,
        price,
        image,
        category,
        countInStock
      } = req.body;

      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // 🔥 Only owner or admin can update
      if (
        product.user.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          message: "Not authorized to update this product"
        });
      }

      product.name = name;
      product.description = description;
      product.price = price;
      product.image = image;
      product.category = category;
      product.countInStock = countInStock;

      const updatedProduct = await product.save();

      res.json(updatedProduct);

    } catch (error) {
      console.error("UPDATE PRODUCT ERROR:", error);

      res.status(500).json({
        message: "Update failed",
        error: error.message
      });
    }
  }
);

/* ================= DELETE PRODUCT ================= */
/* ONLY ADMIN */

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      await product.deleteOne();

      res.json({ message: "Product deleted" });

    } catch (error) {
      console.error("DELETE PRODUCT ERROR:", error);

      res.status(500).json({
        message: "Delete failed",
        error: error.message
      });
    }
  }
);

module.exports = router;