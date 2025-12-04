import { useSelector, useDispatch } from "react-redux";
import {
  removeFromCart,
  clearCart,
  setCartFromBackend,
} from "../store/cartSlice";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
import { MdDeleteOutline } from "react-icons/md";
import API from '@/api';


export default function Cart() {
  const dispatch = useDispatch();
const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

  useEffect(() => {
    if (!user?.token) return;

    const loadCart = async () => {
      try {
        const res = await axios.get(`${API}/cart`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        console.log("CART FROM BACKEND:", res.data);

        dispatch(setCartFromBackend(res.data.items));
      } catch (err) {
        console.log("Error loading cart:", err.response?.data || err.message);
      }
    };

    loadCart();
  }, [user, dispatch]);
   
  const handleClearCart = async () => {
    try {
      if (user?.token) {
        await axios.delete(`${API}/cart`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
      }

      dispatch(clearCart()); 
    } catch (err) {
      console.log("Error clearing cart:", err.response?.data || err.message);
    }
  };


  const handleRemove = async (productId) => {
    try {
      console.log("user?.token", user?.token);
      if (user?.token) {
       const response = await axios.delete(`${API}/cart/${productId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        console.log(response.data)
      }

      
      dispatch(removeFromCart(productId));
      
    } catch (err) {
      console.log("Error removing item:", err.response?.data || err.message);
    }
  };
console.log("BEFORE CHECKOUT cartItems::", cartItems);


const handleCheckout = async () => {
  try {
    const formattedItems = cartItems.map((item) => ({
      productId: item.product._id,
      quantity: item.quantity,
    }));

    const res = await axios.post(
      `${API}/orders`,
      { items: formattedItems },
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    console.log("ORDER SUCCESS:", res.data);

    
    await axios.delete(`${API}/cart`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });

    
    dispatch(clearCart());

   
    navigate("/orders");
  } catch (err) {
    console.log("Checkout error:", err.response?.data || err.message);
  }
};







  const total = cartItems
    .reduce((acc, item) => acc + item.product.price * item.quantity, 0)
    .toFixed(2);



  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">
          Your Cart is Empty 🛒
        </h2>
        <Link
          to="/products"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-all duration-300"
        >
          Go Shopping
        </Link>
      </div>
    );
  }


  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-blue-500 mb-6 text-center">
        Shopping Cart
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-3 border">Image</th>
              <th className="py-3 border">Title</th>
              <th className="py-3 border">Price</th>
              <th className="py-3 border">Quantity</th>
              <th className="py-3 border">Subtotal</th>
              <th className="py-3 border">Remove</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr
                key={item._id}
                className="border-b hover:bg-gray-50 transition-all duration-200"
              >
                <td className="py-3 border">
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="w-16 h-16 object-cover rounded-md mx-auto"
                  />
                </td>

                <td className="py-3 border font-medium text-gray-800">
                  {item.product.title}
                </td>

                <td className="py-3 border text-gray-600">
                  ${item.product.price}
                </td>

                <td className="py-3 border">{item.quantity}</td>

                <td className="py-3 border font-semibold text-gray-800">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </td>

                <td className="py-3 border">
                  <button
                    onClick={() => handleRemove(item.product._id)}
                    className="text-red-500 hover:text-red-700 transition duration-200"
                  >
                    <MdDeleteOutline color="red" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mt-6 border-t pt-6">
        <div className="mb-4 md:mb-0">
          <button
            onClick={handleClearCart}
            className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-all duration-300"
          >
            Clear Cart
          </button>
        </div>

        <div className="text-right">
          <h3 className="text-2xl font-semibold text-gray-700">
            Total: <span className="text-blue-600">${total}</span>
          </h3>
          <button
            onClick={handleCheckout}
            className="mt-3 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-all duration-300"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
