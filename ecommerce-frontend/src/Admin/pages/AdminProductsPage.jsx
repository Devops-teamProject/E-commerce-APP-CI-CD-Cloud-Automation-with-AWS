import { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useSelector } from "react-redux";
import API from '@/api';

export default function AdminProductsPage() {
  const { user } = useSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [Products, setProduct] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

      
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/products`);
      setProduct(res.data.products);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching Products:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  

  if (loading)
    return <p className="text-center mt-10 text-gray-500">Loading...</p>;

  const handleDeleteButton = async (id) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete this Product?`
    );
    if (!isConfirmed) return; 

    try {
      await axios.delete(`${API}/products/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      setProduct((prev) => prev.filter((p) => p._id !== id));
      console.log("Deleted successfully");
    } catch (error) {
      console.error("Error Deleting a Product", error);
    }
  };


  const handleEditButton = (product) => {
    setSelectedProduct(product);
    setIsOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const updated = {
      title: formData.get("title"),
      price: formData.get("price"),
      category: formData.get("category"),
      image: formData.get("image"),
      description: formData.get("description"),
      quantity: formData.get("quantity"),
    };

    try {
      await axios.put(
        `${API}/products/${selectedProduct._id}`,
        updated,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setProduct((prev) =>
        prev.map((p) =>
          p._id === selectedProduct._id ? { ...p, ...updated } : p
        )
      );

      setIsOpen(false);
      alert("Product updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update product");
    }
  };


  const handleAddProduct = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const newProduct = {
      title: formData.get("title"),
      price: formData.get("price"),
      description: formData.get("description"),
      category: formData.get("category"),
      image: formData.get("image"),
      quantity: formData.get("quantity"),
    };

    try {
      await axios.post(`${API}/products`, newProduct, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      // الحل النهائي — إعادة تحميل المنتجات كلها
      await fetchProducts();

      setAddOpen(false);
      alert("Product added successfully!");
    } catch (err) {
      console.error("Add Product Error:", err);
      alert("Failed to add product");
    }
  };


  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-blue-500 mb-6 text-center">
        Admin Products Page
      </h2>

      <hr className="border-gray-700 m-5" />

     
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setAddOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
        >
          Add Product
        </button>
      </div>

      
      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-3 border">Image</th>
              <th className="py-3 border">Title</th>
              <th className="py-3 border">Price</th>
              <th className="py-3 border">Quantity</th>
              <th className="py-3 border">Description</th>
              <th className="py-3 border">Category</th>
              <th className="py-3 border">Edit</th>
              <th className="py-3 border">Delete</th>
            </tr>
          </thead>

          <tbody>
            {Products.map((product) => (
              <tr
                key={product._id}
                className="border-b hover:bg-gray-50 transition-all duration-200"
              >
                <td className="py-3 border">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-16 h-16 object-cover rounded-md mx-auto"
                  />
                </td>

                <td className="py-3 border font-medium text-gray-600">
                  {product.title}
                </td>

                <td className="py-3 border text-gray-600">${product.price}</td>

                <td className="py-3 border">{product.quantity}</td>

                <td className="py-3 border">{product.description}</td>

                <td className="py-3 border">{product.category}</td>

                <td className="py-3 border text-center">
                  <button onClick={() => handleEditButton(product)}>
                    <FaEdit color="yellow" />
                  </button>
                </td>

                <td className="py-3 border">
                  <button onClick={() => handleDeleteButton(product._id)}>
                    <MdDelete color="red" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      
      {isOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white w-full max-w-lg p-6 rounded shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Edit Product
            </h2>

            <form onSubmit={handleUpdate} className="space-y-3">
              <input
                type="text"
                name="title"
                defaultValue={selectedProduct.title}
                className="w-full border p-2 rounded"
              />

              <input
                type="text"
                name="price"
                defaultValue={selectedProduct.price}
                className="w-full border p-2 rounded"
              />

              <input
                type="text"
                name="category"
                defaultValue={selectedProduct.category}
                className="w-full border p-2 rounded"
              />

              <input
                type="text"
                name="image"
                defaultValue={selectedProduct.image}
                className="w-full border p-2 rounded"
              />

              <input
                type="text"
                name="quantity"
                defaultValue={selectedProduct.quantity}
                className="w-full border p-2 rounded"
              />

              <textarea
                name="description"
                defaultValue={selectedProduct.description}
                className="w-full border p-2 rounded"
                rows={4}
              ></textarea>

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

      
      {addOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white w-full max-w-lg p-6 rounded shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Add New Product
            </h2>

            <form onSubmit={handleAddProduct} className="space-y-3">
              <input
                name="title"
                placeholder="Title"
                className="w-full border p-2 rounded"
                required
              />

              <input
                name="price"
                placeholder="Price"
                type="number"
                step="0.01"
                className="w-full border p-2 rounded"
                required
              />

              <input
                name="quantity"
                placeholder="Quantity"
                type="number"
                className="w-full border p-2 rounded"
              />

              <input
                name="category"
                placeholder="Category"
                className="w-full border p-2 rounded"
              />

              <input
                name="image"
                placeholder="Image URL"
                className="w-full border p-2 rounded"
              />

              <textarea
                name="description"
                placeholder="Description"
                className="w-full border p-2 rounded"
                rows={4}
              ></textarea>

              <div className="flex gap-4 justify-center mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Add Product
                </button>
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
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
