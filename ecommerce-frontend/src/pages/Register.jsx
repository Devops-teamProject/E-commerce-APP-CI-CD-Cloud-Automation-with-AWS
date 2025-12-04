import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/authSlice";
import API from '@/api';




export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await axios.post(
      `${API}/users/register`,
      form,
      { validateStatus: () => true }
    );

    if (res.status === 201) {
      dispatch(
        loginSuccess({
          id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          token: res.data.token,
        })
      );

      navigate("/");
      return;
    }

    setMsg(res.data.message || "Error registering");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="flex flex-col lg:flex-row bg-gray-800 rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl">
       
        <div className="lg:w-1/2 hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=800&q=80"
            alt="Register"
            className="w-full h-full object-cover"
          />
        </div>

       
        <div className="w-full lg:w-1/2 p-10 flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-white mb-6 text-center">
            Create an Account
          </h1>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Name"
              className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />

            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />

            <button className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition">
              Register
            </button>
          </form>

          {msg && <p className="text-red-400 mt-3 text-center">{msg}</p>}

          <p className="text-gray-400 text-center mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-cyan-300 underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

