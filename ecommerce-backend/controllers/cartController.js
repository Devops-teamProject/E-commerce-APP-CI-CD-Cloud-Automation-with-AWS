import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";


export const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product", "title price image");
    if (!cart) return res.status(404).json({ message: "Cart is empty" });
    res.json(cart);
  } catch (error) {
    next(error);
  } 
};


export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [], totalPrice: 0 });
    }

   
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    cart.totalPrice = await calculateTotal(cart.items);

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

// Helper function to calculate total
async function calculateTotal(items) {
  let total = 0;
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (product) total += product.price * item.quantity;
  }
  return total;
}

//Update quantity
export const updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (i) => i.product.toString() === productId
    );
    if (!item) return res.status(404).json({ message: "Item not in cart" });

    item.quantity = quantity;
    cart.totalPrice = await calculateTotal(cart.items);
    await cart.save();
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

//Remove item from cart 
export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );
    cart.totalPrice = await calculateTotal(cart.items);
    await cart.save();
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

//Clear cart
export const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ message: "Cart cleared" });
  } catch (error) {
    next(error);
  }
};
