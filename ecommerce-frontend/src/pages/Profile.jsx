import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { IoSettings } from "react-icons/io5";
import { TbTruckDelivery } from "react-icons/tb";
import { MdLogout } from "react-icons/md";
import { useEffect, useState } from "react";
import  Orders  from "../components/OrdersComponent";
import  Settings  from "../components/SettingsComponent";

 
export default function Profile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("orders");
  console.log("User Created at ==> ", user)
  function handleLogout() {
    dispatch(logout());
    setCartCount(0);
    navigate("/login");
  } 
  return (
    <div class="flex min-h-screen">
      <aside class="bg-gray-600 w-64 p-6">
        <div class="flex items-center gap-2.5">
          <img
            className="w-10 h-10 rounded-full"
            src="/assets/profile/avatar.jpg"
            alt=""
          />
          <div class="font-medium text-heading">
            <div className="text-white">{user?.name}</div>
            <div className="text-sm font-normal text-white">
              {user?.createdAt ? (
                <>
                  Joined in{" "}
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </>
              ) : (
                "Joined recently"
              )}
            </div>
          </div>
        </div>
        <div className="">
          <hr className="border-gray-700 m-5" />
          <ul className="flex flex-col  gap-4 ">
            <li
              className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-500 rounded cursor-pointer"
              onClick={() => setActiveTab("orders")}
            >
              <span>
                <TbTruckDelivery color="white" />
              </span>

              <a href="#main" className="text-lg  text-white">
                My Orders
              </a>
            </li>
            <li
              className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-500 rounded cursor-pointer"
              onClick={() => setActiveTab("settings")}
            >
              <span>
                <IoSettings color="white" />
              </span>
              <a href="#main" className="text-lg  text-white cursor-pointer">
                Settings
              </a>
            </li>
            <li className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-500 rounded cursor-pointer">
              <span>
                <MdLogout color="white" />
              </span>
              <button
                onClick={handleLogout}
                className="text-lg  text-white cursor-pointer"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </aside>
      <main class="flex-1 bg-gray-100">
        <div id="main">
          <div id="main">
            {activeTab === "orders" && <Orders />}
            {activeTab === "settings" && <Settings />}
          </div>
        </div>
      </main>
    </div>
  );
}
