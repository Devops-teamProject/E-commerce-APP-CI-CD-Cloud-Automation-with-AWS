import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import API from '@/api';


export default function Orders() {
  const { user } = useSelector((state) => state.auth);
const [orders, setOrders] = useState([]);

useEffect(() => {
  const loadOrders = async () => {
    try {
      const res = await axios.get(`${API}/orders/my`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      setOrders(res.data.orders); 
    } catch (err) {
      console.log("Error:", err.response?.data || err.message);
    }
  };

  loadOrders();
}, []);

  return (
    <div className="max-w-4xl mx-auto my-10">
      <h2 className="text-3xl font-bold text-blue-600 mb-6">My Orders</h2>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="p-4 border rounded-lg mb-4 shadow">
            <h3 className="text-xl font-semibold">Order #{order._id}</h3>
            <p>Status: {order.status}</p>
            <p>Total: ${order.totalPrice}</p>
          </div>
        ))
      )}
    </div>
  );
}
