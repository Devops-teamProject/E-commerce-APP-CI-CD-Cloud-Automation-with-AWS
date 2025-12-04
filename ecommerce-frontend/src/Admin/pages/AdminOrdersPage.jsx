import { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useSelector } from "react-redux";
import API from '@/api';

export default function AdminOrdersPage() {
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const [Orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setOrders(res.data.orders);
      setLoading(false);
      console.log("orders", res.data.orders);
    } catch (err) {
      console.error("Error fetching Orders:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);


  const handleEditButton = (order) => {
    setSelectedOrder(order);
    setIsOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const updated = {status: formData.get("status")};
    console.log("updated", updated)

    try {
      await axios.put(`${API}/orders/${selectedOrder._id}/status`,updated,{
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setOrders((prev) =>
        prev.map((p) =>
          p._id === selectedOrder._id ? { ...p, ...updated } : p
        )
      );

      setIsOpen(false);
      alert("order updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update order");
    }
  };

    const handleDeleteButton = async (id) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete this Product?`
    );
    if (!isConfirmed) return; 

    try {
      await axios.delete(`${API}/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      setOrders((prev) => prev.filter((o) => o._id !== id));
     alert("Deleted successfully");
    } catch (error) {
      console.error("Error Deleting an Order", error);
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-500">Loading...</p>;
 
  return(
      <div className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-3xl font-bold text-blue-500 mb-6 text-center">
            Admin Orders Page
          </h2>

         <hr className="border-gray-700 m-5" />
               
         <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="py-3 border">User name</th>
                  <th className="py-3 border">User Email</th>
                  <th className="py-3 border">order Title</th>
                  <th className="py-3 border">order Quantity</th>
                  <th className="py-3 border">Payment Method</th>
                  <th className="py-3 border">Total Price</th>
                  <th className="py-3 border">Order Status</th>
                  <th className="py-3 border">Edit</th>
                  <th className="py-3 border">Delete</th>
                </tr>
              </thead>

              <tbody>
                  {Orders.map((order) => (
                      order.products.map((item) => (
                        <tr key={item._id} className="border-b hover:bg-gray-50 transition-all duration-200">  
                          <td className="py-3 border">{order.user.name}</td>     
                          <td className="py-3 border">{order.user.email}</td>      
                          <td className="py-3 border">{item.product.title}</td>      
                          <td className="py-3 border">{item.quantity}</td>       
                          <td className="py-3 border">{order.paymentMethod}</td>      
                          <td className="py-3 border">${order.totalPrice.toFixed(2)}</td>
                          <td className="py-3 border">{order.status}</td>
                          <td className="py-3 border">
                            <button className="text-blue-600 hover:underline" onClick={() => handleEditButton(order)}>
                              <FaEdit color="yellow" />
                            </button>
                          </td>

                    
                          <td className="py-3 border">
                            <button className="text-red-600 hover:underline"  onClick={() => handleDeleteButton(order._id)}>
                              <MdDelete color="red" />
                            </button>
                          </td>
                        </tr>
                      ))
                   ))}
              </tbody>
            </table>
         </div>

         {isOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white w-full max-w-lg p-6 rounded shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Edit Order
              </h2>

              <form onSubmit={handleUpdate} className="space-y-3">

                <select
                  name="status"
                  defaultValue={selectedOrder.status}
                  className="w-full border p-2 rounded"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <div className="flex gap-3 justify-center mt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Update
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>

            </div>
          </div>
         )}


      

    </div>
  );
}
