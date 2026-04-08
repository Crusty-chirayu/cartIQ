const express = require("express")
const router = express.Router()
const Order = require("../models/Order")

/* ================= CREATE ORDER ================= */

router.post("/", async (req, res) => {

  try {

    const { items, totalPrice } = req.body

    const order = new Order({
      items,
      totalPrice,
      status: "Pending"
    })

    const createdOrder = await order.save()

    res.status(201).json(createdOrder)

  } catch (error) {

    console.error("CREATE ORDER ERROR:", error)

    res.status(500).json({
      message: "Failed to create order"
    })

  }

})

/* ================= GET ALL ORDERS ================= */

router.get("/", async (req, res) => {

  try {

    const orders = await Order.find({}).sort({ createdAt: -1 })

    res.json(orders)

  } catch (error) {

    console.error("GET ORDERS ERROR:", error)

    res.status(500).json({
      message: "Failed to fetch orders"
    })

  }

})

/* ================= UPDATE ORDER STATUS ================= */

router.put("/:id", async (req, res) => {

  try {

    const { status } = req.body

    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      })
    }

    order.status = status

    const updatedOrder = await order.save()

    res.json(updatedOrder)

  } catch (error) {

    console.error("UPDATE ORDER ERROR:", error)

    res.status(500).json({
      message: "Failed to update order"
    })

  }

})

module.exports = router