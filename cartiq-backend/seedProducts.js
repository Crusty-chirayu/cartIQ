const mongoose = require("mongoose");
require("dotenv").config();
const Product = require("./models/Product");

const products = [
  {
    name: "CartIQ Sneakers",
    description: "Comfortable daily wear sneakers",
    price: 1499,
    category: "footwear",
    brand: "CartIQ",
    image: "https://picsum.photos/400/400?1",
    countInStock: 10,
  },
  {
    name: "Wireless Headphones",
    description: "Bluetooth over-ear headphones",
    price: 1999,
    category: "electronics",
    brand: "CartIQ",
    image: "https://picsum.photos/400/400?2",
    countInStock: 15,
  },
  {
    name: "Minimal Watch",
    description: "Stylish minimalist wrist watch",
    price: 999,
    category: "accessories",
    brand: "CartIQ",
    image: "https://picsum.photos/400/400?3",
    countInStock: 8,
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Product.deleteMany();
    await Product.insertMany(products);

    console.log("Products inserted successfully!");
    process.exit();
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDB();