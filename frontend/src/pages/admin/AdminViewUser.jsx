import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AdNavbar from "./AdNavbar";
import DataTablePagination from "../../components/DataTablePagination";

function AdminViewUser() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [viewUser, setViewUser] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await axios.get("http://localhost:8000/admin/users");
            setUsers(res.data || []);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("Failed to load registered users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleStatusToggle = async (user) => {
        const currentStatus = (user.status || "Active").toLowerCase();
        const newStatus = currentStatus === "active" ? "Blocked" : "Active";
        const actionName = newStatus === "Blocked" ? "block" : "activate";

        if (!window.confirm(`Are you sure you want to ${actionName} user "${user.fullname || user.email}"?`)) {
            return;
        }

        try {
            setUpdatingId(user.id);
            await axios.put(`http://localhost:8000/admin/users/${user.id}/status?status=${newStatus}`);
            // Update local state directly for instant feedback
            setUsers((prev) =>
                prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
            );
            if (viewUser && viewUser.id === user.id) {
                setViewUser({ ...viewUser, status: newStatus });
            }
        } catch (err) {
            console.error(`Error updating status for user ${user.id}:`, err);
            alert(err.response?.data?.detail || "Failed to update user status.");
        } finally {
            setUpdatingId(null);
        }
    };

    // Filter & Paginate
    const filteredUsers = users.filter((u) => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return true;
        return (
            (u.fullname && u.fullname.toLowerCase().includes(query)) ||
            (u.email && u.email.toLowerCase().includes(query)) ||
            (u.role && u.role.toLowerCase().includes(query)) ||
            (u.status && u.status.toLowerCase().includes(query))
        );
    });

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
    const paginatedUsers = filteredUsers.slice(
        (safeCurrentPage - 1) * itemsPerPage,
        safeCurrentPage * itemsPerPage
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <AdNavbar />

            <main className="mx-auto max-w-7xl px-6 py-8">

                {/* Header */}
                <div>
                    <p className="text-sm font-medium text-indigo-600 mb-3">
                        <Link to="/admin/dashboard" className="p-1.5 text-slate-100 bg-indigo-500 rounded-full mr-1"> Admin </Link> / Users
                    </p>

                    <h1 className="mt-1 text-2xl font-semibold text-slate-900">
                        Users Management
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        View registered users, monitor account statuses, and manage access rights.
                    </p>
                </div>

                {error && (
                    <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
                        {error}
                    </div>
                )}

                {/* Control / Search Bar */}
                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                placeholder="Search by name, email, or role..."
                                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-5 pr-4 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        <span className="rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 border border-indigo-100">
                            {filteredUsers.length} {filteredUsers.length === 1 ? "User" : "Users Registered"}
                        </span>
                    </div>
                </div>

                {/* Users Table */}
                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">

                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        #
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        User
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Email
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Role
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Status
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-500">
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : paginatedUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-500">
                                            {searchQuery ? "No registered users match your search query." : "No registered users found."}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedUsers.map((u, idx) => {
                                        const isBlocked = (u.status || "").toLowerCase() === "blocked";
                                        return (
                                            <tr key={u.id} className="hover:bg-slate-50/80 transition">
                                                <td className="px-6 py-4 text-xs font-bold text-slate-500">
                                                    {(safeCurrentPage - 1) * itemsPerPage + idx + 1}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {u.fullname || "N/A"}
                                                    </p>
                                                </td>

                                                <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                                                    {u.email}
                                                </td>

                                                <td className="px-6 py-4 text-xs text-slate-600 capitalize">
                                                    {u.role}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                                        isBlocked
                                                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    }`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${isBlocked ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                                                        {isBlocked ? "Blocked" : "Active"}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-xs text-slate-600 capitalize">
                                                    {u.created_at}
                                                </td>

                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setViewUser(u)}
                                                            className="text-xs bg-slate-700 hover:bg-slate-800 cursor-pointer rounded-lg px-3.5 py-1.5 text-white font-semibold transition shadow-2xs"
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            onClick={() => handleStatusToggle(u)}
                                                            disabled={updatingId === u.id}
                                                            className={`text-xs font-semibold cursor-pointer rounded-lg px-3.5 py-1.5 text-white transition disabled:opacity-50 shadow-2xs ${
                                                                isBlocked
                                                                    ? 'bg-emerald-600 hover:bg-emerald-700'
                                                                    : 'bg-amber-600 hover:bg-amber-700'
                                                            }`}
                                                        >
                                                            {updatingId === u.id
                                                                ? "Updating..."
                                                                : isBlocked
                                                                ? "Activate"
                                                                : "Block"}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>

                        </table>
                    </div>

                    {/* Pagination */}
                    <DataTablePagination
                        currentPage={safeCurrentPage}
                        totalRecords={filteredUsers.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={(p) => setCurrentPage(p)}
                        onItemsPerPageChange={(num) => { setItemsPerPage(num); setCurrentPage(1); }}
                    />
                </div>

                {/* View User Detail Modal */}
                {viewUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h2 className="text-xl font-bold text-slate-900">User Profile Details</h2>
                                <button
                                    onClick={() => setViewUser(null)}
                                    className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="mt-4 space-y-3">
                                <div>
                                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Full Name</span>
                                    <p className="text-sm font-semibold text-slate-800">{viewUser.fullname}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Email Address</span>
                                    <p className="text-sm font-semibold text-slate-800">{viewUser.email}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Role</span>
                                    <p className="text-sm font-semibold text-slate-800 capitalize">{viewUser.role}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Account Status</span>
                                    <p className={`text-sm font-bold ${
                                        (viewUser.status || "").toLowerCase() === "blocked"
                                            ? "text-rose-600"
                                            : "text-emerald-600"
                                    }`}>
                                        {viewUser.status || "Active"}
                                    </p>
                                </div>
                                {viewUser.created_at && (
                                    <div>
                                        <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Registered On</span>
                                        <p className="text-sm font-semibold text-slate-800">
                                            {new Date(viewUser.created_at).toLocaleString("en-IN", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                                hour: "numeric",
                                                minute: "2-digit",
                                                hour12: true,
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex justify-between items-center pt-3 border-t border-slate-100">
                                <button
                                    onClick={() => handleStatusToggle(viewUser)}
                                    className={`rounded-xl px-4 py-2 text-xs font-semibold text-white cursor-pointer ${
                                        (viewUser.status || "").toLowerCase() === "blocked"
                                            ? "bg-emerald-600 hover:bg-emerald-700"
                                            : "bg-amber-600 hover:bg-amber-700"
                                    }`}
                                >
                                    {(viewUser.status || "").toLowerCase() === "blocked" ? "Activate Account" : "Block Account"}
                                </button>

                                <button
                                    onClick={() => setViewUser(null)}
                                    className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}

export default AdminViewUser;