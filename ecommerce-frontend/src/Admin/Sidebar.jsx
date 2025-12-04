import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkClasses = ({ isActive }) =>
    `block px-4 py-3 rounded-md mb-2 transition ${
      isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <div className="w-64 bg-white shadow-md p-4">
      <h2 className="text-xl font-semibold mb-6">Admin Panel</h2>

      <nav>
        <NavLink to="products" className={linkClasses}>
          Products
        </NavLink>

        <NavLink to="users" className={linkClasses}>
          Users
        </NavLink>

        <NavLink to="orders" className={linkClasses}>
          Orders
        </NavLink>
      </nav>
    </div>
  );
}
