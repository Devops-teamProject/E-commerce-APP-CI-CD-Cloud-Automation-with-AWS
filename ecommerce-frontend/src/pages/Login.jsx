import { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../store/authSlice";
import { useNavigate, Link } from "react-router-dom";
import API from '@/api';


export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) navigate("/");
  }, [token]);

  async function handleLogin(e) {
    e.preventDefault();

    const res = await axios.post(
      `${API}/users/login`,
      form,
      { validateStatus: () => true }
    );

    if (res.status === 200) {
      dispatch(
        loginSuccess({
          id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          token: res.data.token,
          createdAt: res.data.createdAt,
          role: res.data.role,
        })
      );

      navigate(res.data.role === "admin" ? "/admin" : "/");
      return;
    }

    setError("Invalid credentials");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="flex flex-col lg:flex-row bg-gray-800 rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl">
      
        <div className="lg:w-1/2 hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=800&q=80"
            alt="Login"
            className="w-full h-full object-cover"
          />
        </div>

      
        <div className="w-full lg:w-1/2 p-10 flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-white mb-6 text-center">
            Welcome Back
          </h1>

          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
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
              Login
            </button>
          </form>

          {error && <p className="text-red-400 mt-3 text-center">{error}</p>}

          <p className="text-gray-400 text-center mt-4">
            Don't have an account?{" "}
            <Link to="/register" className="text-cyan-300 underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}



