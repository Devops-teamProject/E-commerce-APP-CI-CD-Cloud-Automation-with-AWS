import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import Cart from "../models/cartModel.js";

export const createOrder = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No products in order" });
    }

    let orderItems = [];
    let totalPrice = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.productId}`,
        });
      }

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });

      totalPrice += product.price * item.quantity;
    }

    const order = new Order({
      user: req.user._id,
      products: orderItems,
      totalPrice,
      status: "Pending",
    });

    const saved = await order.save();
    await Cart.findOneAndDelete({ user: req.user._id });

    res.status(201).json({
      message: "Order created successfully",
      order: saved,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate(
      "products.product",
      "title price image"
    );

    res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};


export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("products.product", "title price");

    res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};



export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status || order.status;
    await order.save();

    res.status(200).json({
      message: "Order status updated",
      order,
    });
  } catch (error) {
    next(error);
  }
};  

export const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.deleteOne();

    res.json({ message: "Order deleted successfully" });

  } catch (error) {
    next(error);
  }
};

