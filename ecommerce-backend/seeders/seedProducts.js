import dotenv from "dotenv";
import mongoose from "mongoose";
import axios from "axios";
import connectDB from "../config/db.js";
import Product from "../models/productModel.js";

dotenv.config();
connectDB();

const seedProducts = async () => {
  try {
    await Product.deleteMany();
    const { data } = await axios.get("https://fakestoreapi.com/products");
    await Product.insertMany(data);
    console.log("Products Inserted Successfully");
    process.exit();
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
};

seedProducts();
