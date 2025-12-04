import { useSelector, useDispatch } from "react-redux";
import { getOrdersFromBackend } from "../store/orderSlice";
import { useEffect } from "react";
import axios from "axios";
import API from '@/api';



export default function Orders() {
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.auth);
    const { orders } = useSelector((state) => state.order);

      useEffect(() => {
        if (!user?.token) return;

        const order = async () => {
          try {
            const res = await axios.get(`${API}/orders/my`, {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            });

            console.log("Orders FROM BACKEND:", res.data);

            dispatch(getOrdersFromBackend(res.data.orders));
          } catch (err) {
            console.log(
              "Error loading Orders:",
              err.response?.data || err.message
            );
          }
        };

        order();
      }, [user, dispatch]);




if (orders.length === 0) {
    console.log("Orders", orders.length)
    return (
      <>
        <div className="text-3xl font-bold text-blue-500 mb-6 text-center">
          Sorry you don't have any Orders
        </div>
        <hr className="border-gray-700 m-5" />
      </>
    );
}else{
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-blue-500 mb-6 text-center">
        My Orders
      </h2>
      <hr className="border-gray-700 m-5" />
      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-3 border">Image</th>
              <th className="py-3 border">Title</th>
              <th className="py-3 border">Price</th>
              <th className="py-3 border">Quantity</th>
              <th className="py-3 border">Payment Method</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
                order.products.map((item) => (
              <tr key={order._id} className="border-b hover:bg-gray-50 transition-all duration-200">
                <td className="py-3 border">
                  <img src={item.product.image} alt={order.products.title} className="w-16 h-16 object-cover rounded-md mx-auto" />
                </td>
                <td className="py-3 border font-medium text-gray-800">{item.product.title}</td>
                <td className="py-3 border text-gray-600">${item.product.price}</td>
                <td className="py-3 border">{item.quantity}</td>
                <td className="py-3 border font-semibold text-gray-800">${order.paymentMethod}</td>
              </tr>

                ))
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
}
