import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import { logout } from "../store/authSlice";
import API from '@/api';

 
export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
const { cartItems } = useSelector((state) => state.cart);

  const [cartCount, setCartCount] = useState(0);

  function handleLogout() {
    dispatch(logout());
    setCartCount(0);
    navigate("/login");
  }


  useEffect(() => {

    if (!user || !user.token) {
      setCartCount(0);
      return;
    }

   
    const loadCart = async () => {
      try {
        const res = await axios.get(`${API}/cart`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        // res.data.items = array of cart items
        setCartCount(res.data.items?.length || 0);
        console.log("User cart:", res.data);
      } catch (err) {
        console.log("Error loading cart:", err.response?.data || err.message);
        setCartCount(0);
      }
    };

    loadCart();
  }, [user]); 

  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-gray-900 text-white shadow">
      <div className="flex items-center font-bold text-xl">
        <Link to="/">E-Shop</Link>
      </div>

      <div className="flex-1 flex justify-center gap-8">
        <Link to="/" className="text-gray-300 hover:text-white transition">
          Home
        </Link>
        <Link
          to="/products"
          className="text-gray-300 hover:text-white transition"
        >
          Products
        </Link>
        <Link to="/about" className="text-gray-300 hover:text-white transition">
          About
        </Link>
        <Link
          to="/contact"
          className="text-gray-300 hover:text-white transition"
        >
          Contact
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm">
              Hi, <span className="font-bold">{user.name}</span>
            </span>

            <Link
              to="/cart"
              className="flex items-center gap-1 text-sm hover:text-blue-300 transition"
            >
              <span>Cart</span>
              <span className="font-bold">({cartItems.length})</span>
            </Link>

            <Link
              to="/profile"
              className="text-sm hover:text-blue-300 transition"
            >
              Profile
            </Link>

            <button
              onClick={handleLogout}
              className="text-sm text-red-400 hover:text-red-300 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm hover:text-blue-300 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm hover:text-blue-300 transition"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
