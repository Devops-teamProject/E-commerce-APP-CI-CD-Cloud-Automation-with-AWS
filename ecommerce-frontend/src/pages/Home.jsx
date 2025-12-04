import { useEffect, useState } from "react";
import axios from "axios";
import { GiReturnArrow } from "react-icons/gi";
import { RiSecurePaymentLine } from "react-icons/ri";
import { FaShuttleVan } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";
import API from '@/api';




export default function Home() {
  
 const categories = [
   {
     name: "Men's Clothing",
     slug: "men's clothing",
     image: "/assets/categories/men.png",
   },
   {
     name: "Women's Clothing",
     slug: "women's clothing",
     image: "/assets/categories/Womens.jpg",
   },
   {
     name: "Electronics",
     slug: "electronics",
     image: "/assets/categories/electronics.jpg",
   },
   {
     name: "Jewelry",
     slug: "jewelery",
     image: "/assets/categories/jewellery.jpg",
   },
 ];

  const [products, setProduct] = useState([]);
  useEffect(() => {
    axios
      .get(`${API}/products`)
      .then((res) => {
        console.log("API response:", res.data.products); 
        setProduct(res.data.products);
      })
      .catch((err) => console.error("Error fetching product:", err));
  }, []);

   const featured = categories.map((cat) =>
     products.find((p) => p.category === cat.slug)
   );

  return (
    <div className="w-full">
      <section className="w-full h-[80vh]">
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 3000 }}
          loop={true}
          className="w-full h-full"
        >
          <SwiperSlide>
            <div
              className="w-full h-full bg-cover bg-center flex items-center justify-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1664455340023-214c33a9d0bd?w=1600')",
              }}
            >
              <div className="text-center text-white bg-black/40 p-6 rounded-lg">
                <h2 className="text-4xl font-bold mb-4">Discover Your Style</h2>
                <p className="text-lg mb-4">
                  Shop the latest trends with our exclusive collection
                </p>
                <a
                  href="/products"
                  className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Shop Now
                </a>
              </div>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div
              className="w-full h-full bg-cover bg-center flex items-center justify-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1674027392887-751d6396b710?w=1600')",
              }}
            >
              <div className="text-center text-white bg-black/40 p-6 rounded-lg">
                <h2 className="text-4xl font-bold mb-4">Fresh Arrivals</h2>
                <p className="text-lg mb-4">Upgrade your wardrobe today</p>
                <a
                  href="/products"
                  className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Explore
                </a>
              </div>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div
              className="w-full h-full bg-cover bg-center flex items-center justify-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1605086998852-18371cfd9b2e?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
              }}
            >
              <div className="text-center text-white bg-black/40 p-6 rounded-lg">
                <h2 className="text-4xl font-bold mb-4">Newer Collection</h2>
                <p className="text-lg mb-4">Upgrade your Quality Of Life</p>
                <a
                  href="/products"
                  className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Browse
                </a>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>

      <section className="w-full  bg-blue-200">
        <h2 className="text-4xl font-bold  text-purple text-center">
          Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
          {categories.map((cat) => (
            <div
              className="p-8 bg-white shadow-md rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
              key={cat.name}
            >
              <img
                className="w-full h-50 object-cover"
                src={cat.image}
                alt={cat.slug}
              />

              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">{cat.name}</h3>

                <a
                  className="inline-block bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-700"
                  href="/products"
                >
                  Shop Now
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="w-full  bg-grey-300">
        <h2 className="text-4xl font-bold  text-purple text-center">
          Featured Products
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
          {featured.map((f) => {
            if (!f) return null;
            return (
              <div
                className="p-8 bg-white shadow-md rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                key={f._id}
              >
                <img
                  className="w-full h-50 object-cover"
                  src={f.image}
                  alt={f.title}
                />

                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>

                  <a
                    className="inline-block bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-700"
                    href={`/products/${f._id}`}
                  >
                    Shop Now
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <section className="w-full  bg-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 p-4">
          <div className="grid grid-cols-2 p-8 bg-white shadow-md rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform">
            <div className="text-left">
              <FaShuttleVan color="goldenrod" size="6em" />
            </div>
            <div className="text-center mt-9 mr-10">
              <h3 className="text-lg font-semibold">Fast Delivery</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 p-8 bg-white shadow-md rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform">
            <div>
              <RiSecurePaymentLine color="goldenrod" size="6em" />
            </div>
            <div className="text-center mt-9 mr-10">
              <h3 className="text-lg font-semibold mb-2">Secure Payment</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 p-8 bg-white shadow-md rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform">
            <div>
              <GiReturnArrow color="goldenrod" size="6em" />
            </div>
            <div className="text-center mt-9 mr-10">
              <h3 className="text-lg font-semibold mb-2">Easy Returns</h3>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
