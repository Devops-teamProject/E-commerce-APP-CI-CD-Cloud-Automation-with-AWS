import { useEffect, useState } from "react"; 
import axios from "axios";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../store/cartSlice.js";
import useCartActions from "../cart/useCartActions";
import API from '@/api';

const socket = io(`${API}`, { transports: ["websocket"] });


export default function Products() { 
  const dispatch = useDispatch();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = ["All", "Men's Clothing", "Women's Clothing", "Jewelery", "Electronics"];
  const [products, setProducts] = useState([]);
  const { addItem } = useCartActions();
  useEffect(() => {
    axios
      .get(`${API}/products`)
      .then((res) => setProducts(res.data.products || res.data))
      .catch((err) => console.error("Error fetching products:", err));

    socket.on("new_product", (newProd) => {
      console.log("Product added:", newProd);
      setProducts((prev) => [...prev, newProd]);
    });

    return () => {
      socket.off("new_product");
    };
  }, []);

  return (
    <>
      <h2 className="text-3xl font-bold text-center text-blue-400 mt-8 mb-4">
        Latest Products
      </h2>
      <hr className="w-1/2 mx-auto mb-6 border-gray-300" />

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-md border border-gray-400 transition-all duration-300 
              ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-md scale-105"
                  : "bg-white text-gray-700 hover:bg-blue-100"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6 px-4 md:px-8">
        {products
          .filter((p) =>
            selectedCategory === "All"
              ? true
              : p.category?.toLowerCase() === selectedCategory.toLowerCase()
          )
          .map((p) => (
            <div
              key={p._id}
              className="bg-white shadow-md rounded-xl p-4 flex flex-col justify-between hover:shadow-lg transition-all duration-300"
            >
              <img
                src={p.image}
                alt={p.title}
                className="w-full h-48 object-cover rounded-lg mb-3"
              />

              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-gray-800 truncate">
                  {p.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {p.description}
                </p>
              </div>

              <hr className="my-2" />

              <span className="text-blue-600 font-bold mb-3">${p.price}</span>

              <div className="flex justify-center gap-3 mt-auto">
                <Link
                  to={`/products/${p._id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all duration-300"
                >
                  Buy Now
                </Link>

                <button
                  onClick={() => addItem(p)}
                  className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-all duration-300"
                >
                 Add to Cart
                </button>
              </div>
            </div>
          ))}
      </div>
    </>
  );
}
