import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import ProductDetails from "./pages/ProductDetails";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import Aboutus from "./pages/about"
import Contactus from "./pages/contact"
import AdminLayout from "./Admin/AdminLayout";
import AdminProductsPage from "./Admin/pages/AdminProductsPage";
import AdminUsersPage from "./Admin/pages/AdminUsersPage";
import AdminOrdersPage from "./Admin/pages/AdminOrdersPage";
import RequireAdmin from "./Admin/RequireAdmin";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";


export default function App() {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="">
      {!isAdminRoute && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contactus />} />
        <Route path="/about" element={<Aboutus />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="*" element={<NotFound />}/>
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
        </Route>
      </Routes>

      {!isAdminRoute && <Footer />}
    </div>
  );
}
