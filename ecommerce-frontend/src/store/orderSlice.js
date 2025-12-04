import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orders: [],
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    getOrdersFromBackend: (state, action) => {
      state.orders = action.payload;
    },
  },
});

export const { getOrdersFromBackend } = orderSlice.actions;
export default orderSlice.reducer;
