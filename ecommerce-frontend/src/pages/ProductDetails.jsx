import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import useCartActions from "../cart/useCartActions";
import API from '@/api';



import axios from "axios";
export default function ProductDetails() {
  const { addItem } = useCartActions();
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    axios.get(`${API}/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.error("Error fetching product:", err));
  }, [id]);

  if (!product) return <p className="text-center mt-10 text-gray-500">Loading...</p>;

  return (
    <>
      <div class="bg-gray-100">
        <div class="container mx-auto px-4 py-8">
          <div class="flex flex-wrap -mx-4">
            <div class="w-full md:w-1/2 px-4 mb-8">
              <img
                src={product.image}
                alt="Product"
                class="w-100 h-auto rounded-lg shadow-md mb-2"
                id="mainImage"
              />
              <div class="flex gap-4 py-4 justify-center overflow-x-auto"></div>
            </div>

            <div class="w-full md:w-1/2 px-4">
              <h2 class="text-3xl font-bold mb-2">{product.title}</h2>
              <p class="text-gray-600 mb-4">{product.category}</p>
              <div class="mb-4">
                <span class="text-2xl font-bold mr-2">{product.price}</span>
              </div>

              <p class="text-gray-700 mb-6">{product.description}</p>

              <div class="mb-6">
                <label
                  for="quantity"
                  class="block text-sm font-medium text-gray-700 mb-1"
                >
                  Quantity:
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-12 text-center rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>


              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => addItem(product, quantity)}
                  className="bg-indigo-600 flex gap-2 items-center text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 3h1.386c..."
                    />
                  </svg>
                  Add to Cart
                </button>
              </div>

              <div>
                <h3 class="text-lg font-semibold mb-2">Key Features:</h3>
                <ul class="list-disc list-inside text-gray-700">
                  <li>Rating - {product.rating.rate}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
