import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => { 
      const itemExists = state.cartItems.find(
        (item) => item.product._id === action.payload._id
      );

      if (!itemExists) {
        state.cartItems.push({
          product: action.payload,
          quantity: action.payload.qty || 1,
        });

      }
    },
   removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.product._id !== action.payload
      );
    },

    clearCart: (state) => {
      state.cartItems = [];
    },
    setCartFromBackend: (state, action) => {
      state.cartItems = action.payload || [];
    },
  },
});

export const { addToCart, removeFromCart, clearCart, setCartFromBackend } =
  cartSlice.actions;
export default cartSlice.reducer; 
