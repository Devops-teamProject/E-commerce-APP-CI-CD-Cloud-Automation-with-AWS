import { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useSelector } from "react-redux";
import API from '@/api';


export default function AdminUsersPage() {
  const { user } = useSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [Users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log("user.token==>", user.token);
  // FETCH USERS
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/users`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      console.log("res.data", res.data);
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading)
    return <p className="text-center mt-10 text-gray-500">Loading...</p>;

  // DELETE USER
  const handleDeleteButton = async (id) => {
    const ok = window.confirm("Are you sure?");
    if (!ok) return;

    try {
      await axios.delete(`${API}/users/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // OPEN EDIT MODAL
  const handleEditButton = (u) => {
    setSelectedUser(u);
    setIsOpen(true);
  };

  // UPDATE USER
const handleUpdate = async (e) => {
  e.preventDefault();

  const form = new FormData(e.target);

  const updated = {
    name: form.get("name"),
    email: form.get("email"),
    role: form.get("role"),
  };

  try {
    await axios.put(
      `${API}/users/${selectedUser._id}`,
      updated,
      { headers: { Authorization: `Bearer ${user.token}` } }
    );

    await fetchUsers();

    setIsOpen(false);
    alert("User updated successfully!");
  } catch (err) {
    console.error("Update failed:", err);
    alert("Failed to update user");
  }
};


  // ADD USER
  const handleAddUser = async (e) => {
    e.preventDefault();

    const form = new FormData(e.target);

    const newUser = {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      role: form.get("role"),
    };

    try {
      await axios.post(`${API}/users/register`, newUser, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      await fetchUsers(); // REFRESH USERS

      setAddOpen(false);
      alert("User added successfully!");
    } catch (err) {
      console.error("Add user error:", err);
      alert("Failed to add user");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-blue-500 mb-6 text-center">
        Admin Users Page
      </h2>

      <hr className="border-gray-700 m-5" />

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setAddOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          + Add User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-3 border">Name</th>
              <th className="py-3 border">Email</th>
              <th className="py-3 border">Role</th>
              <th className="py-3 border">Edit</th>
              <th className="py-3 border">Delete</th>
            </tr>
          </thead>

          <tbody>
            {Array.isArray(Users) &&
              Users.map((u) => (
                <tr
                  key={u._id}
                  className="border-b hover:bg-gray-50 transition-all duration-200"
                >
                  <td className="py-3 border">{u.name}</td>
                  <td className="py-3 border">{u.email}</td>
                  <td className="py-3 border">{u.role}</td>

                  <td className="py-3 border">
                    <button onClick={() => handleEditButton(u)}>
                      <FaEdit color="yellow" />
                    </button>
                  </td>

                  <td className="py-3 border">
                    <button onClick={() => handleDeleteButton(u._id)}>
                      <MdDelete color="red" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {isOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-white w-full max-w-lg p-6 rounded shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">Edit User</h2>

            <form onSubmit={handleUpdate} className="space-y-3">
              <input
                name="name"
                defaultValue={selectedUser.name}
                className="w-full border p-2 rounded"
              />

              <input
                name="email"
                defaultValue={selectedUser.email}
                className="w-full border p-2 rounded"
              />

              <select
                name="role"
                defaultValue={selectedUser.role}
                className="w-full border p-2 rounded"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>

              <div className="flex gap-3 justify-center mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Update
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {addOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-white w-full max-w-lg p-6 rounded shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Add New User
            </h2>

            <form onSubmit={handleAddUser} className="space-y-3">
              <input
                name="name"
                placeholder="Name"
                className="w-full border p-2 rounded"
                required
              />

              <input
                name="email"
                type="email"
                placeholder="Email"
                className="w-full border p-2 rounded"
                required
              />

              <input
                name="password"
                type="password"
                placeholder="Password"
                className="w-full border p-2 rounded"
                required
              />

              <select
                name="role"
                className="w-full border p-2 rounded"
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>

              <div className="flex gap-4 justify-center mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Add User
                </button>

                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
