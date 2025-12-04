import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import AdminNavbar from "./AdminNavbar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
   
      <Sidebar />

      <div className="flex-1 flex flex-col">
       
        <AdminNavbar />

       
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
