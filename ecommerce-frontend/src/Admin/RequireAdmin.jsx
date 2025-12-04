import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function RequireAdmin({ children }) {
  const { user } = useSelector((state) => state.auth);

  if (!user) return <Navigate to="/login" />;
  if (user.role !== "admin") return <Navigate to="/" />;

  return children; 
}
