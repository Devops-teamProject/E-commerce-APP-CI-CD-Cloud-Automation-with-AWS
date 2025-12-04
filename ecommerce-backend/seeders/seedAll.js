import dotenv from "dotenv";
import mongoose from "mongoose";
import axios from "axios";
import connectDB from "../config/db.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import bcrypt from "bcryptjs";

dotenv.config();
connectDB();

const seedAll = async () => {
  try {
    await Product.deleteMany();
    await User.deleteMany();
    await Order.deleteMany();

    const users = await User.insertMany([
      {
        name: "Admin User",
        email: "admin@example.com",
        password: bcrypt.hashSync("123456", 10),
        role: "admin",
      },
      {
        name: "Test User",
        email: "user@example.com",
        password: bcrypt.hashSync("123456", 10),
      },
    ]);

    const adminUser = users[0]._id;
    const normalUser = users[1]._id;

    const { data } = await axios.get("https://fakestoreapi.com/products");
    const products = await Product.insertMany(data);

    await Order.create({
      user: normalUser,
      products: [
        { product: products[0]._id, quantity: 1 },
        { product: products[2]._id, quantity: 2 },
      ],
      totalPrice: products[0].price * 1 + products[2].price * 2,
      paymentMethod: "cash",
    });

    console.log("All data seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedAll();
