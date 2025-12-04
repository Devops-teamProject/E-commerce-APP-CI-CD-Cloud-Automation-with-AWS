import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true  },
    quantity: {type: Number, required: true},
    price: { type: Number, required: true },
    category: { type: String }, 
    image: { type: String },
    rating: {
      rate: { type: Number },
      count: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
