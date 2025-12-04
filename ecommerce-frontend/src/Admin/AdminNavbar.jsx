import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";

export default function AdminNavbar() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      
      <div className="text-xl font-bold text-blue-600">E-Shop Admin</div>

      
      <div className="flex items-center gap-4">
        <span className="font-medium text-gray-700">{user?.name}</span>

        <img
          src="https://i.pravatar.cc/40"
          alt="avatar"
          className="w-10 h-10 rounded-full"
        />

        <button
          onClick={() => dispatch(logout())}
          className="bg-red-500 text-white px-3 py-1 rounded-md"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
 