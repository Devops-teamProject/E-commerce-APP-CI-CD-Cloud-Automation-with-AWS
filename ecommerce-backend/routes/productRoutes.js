import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { body } from "express-validator";
import { protect, admin } from "../middleware/authMiddleware.js"; 

const router = express.Router();

router.route("/")
  .get(getProducts)
  .post(
    protect,
    admin,
    [
      body("title").notEmpty().withMessage("Title is required"),
      body("price").isNumeric().withMessage("Price must be a number"),
      body("description").notEmpty().withMessage("Description is required"),
    ],
    createProduct
  );

router.route("/:id")
  .get(getProductById)
  .put(
    protect,
    admin,
    [
      body("title").optional().isString().withMessage("Title must be a string"),
      body("description").optional().isString().withMessage("Description must be a string"),
      body("price").optional().isNumeric().withMessage("Price must be a number"),
    ],
    updateProduct
  )
  .delete(protect, admin, deleteProduct);

export default router;
 