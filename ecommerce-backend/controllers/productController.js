import Product from "../models/productModel.js";
import asyncHandler from "express-async-handler";


export const getProducts = async (req, res, next) => {
  try {
    const pageSize = 5; 
    const page = Number(req.query.page) || 1; 

   
    const keyword = req.query.keyword
      ? {
          title: { $regex: req.query.keyword, $options: "i" },
        }
      : {};

 
    const count = await Product.countDocuments({ ...keyword });

    const products = await Product.find({ ...keyword })
  
    
    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      totalProducts: count,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
});


export const createProduct = asyncHandler(async (req, res) => {
  const product = new Product(req.body);
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});



export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  Object.assign(product, req.body);
  const updated = await product.save();
  res.json(updated);
});
 

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  await product.deleteOne();
  res.json({ message: "Product deleted" });
});
