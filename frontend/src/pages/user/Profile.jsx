import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

export default function Profile() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [changePassword, setChangePassword] = useState(false);

    const [user, setUser] = useState({
        name: "",
        email: "",
        role: "",
        status: "",
        created_at: "",
    });

    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getProfile = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/profile`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    }
                });
                setUser(response.data);
            } catch (err) {
                console.error("Error fetching profile:", err);
            }
        };

        getProfile();
    }, []);

    const handleOpenModal = () => {
        setEditName(user.name || "");
        setEditEmail(user.email || "");
        setChangePassword(false);
        setPassword("");
        setConfirmPassword("");
        setError("");
        setIsModalOpen(true);
    };

    const handleUpdate = async (e) => {
        if (e) e.preventDefault();
        setError("");
        setSuccess("");

        if (!editName.trim()) {
            setError("Full Name is required.");
            return;
        }

        if (!editEmail.trim()) {
            setError("Email is required.");
            return;
        }

        const payload = {
            fullname: editName.trim(),
            email: editEmail.trim(),
        };

        if (changePassword) {
            if (!password) {
                setError("Please enter a new password.");
                return;
            }
            if (password !== confirmPassword) {
                setError("Passwords do not match.");
                return;
            }
            if (password.length < 6) {
                setError("Password must be at least 6 characters long.");
                return;
            }
            payload.password = password;
        }

        try {
            setLoading(true);
            const response = await axios.put(`${API_BASE_URL}/profile`, payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            setUser(response.data);
            setIsModalOpen(false);
            setSuccess("Profile updated successfully!");
        } catch (err) {
            console.error("Error updating profile:", err);
            const detail = err.response?.data?.detail;
            if (Array.isArray(detail)) {
                setError(detail.map(d => d.msg).join(", "));
            } else if (typeof detail === "string") {
                setError(detail);
            } else {
                setError("Failed to update profile. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-white px-6 py-10">
                <div className="mx-auto max-w-3xl">

                    {/* Notification Alert */}
                    {success && (
                        <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm">
                            <span>{success}</span>
                            <button onClick={() => setSuccess("")} className="cursor-pointer text-slate-500 hover:text-slate-700">
                                ✕
                            </button>
                        </div>
                    )}

                    {/* Profile Header */}
                    <div className="text-center">

                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-indigo-50 text-3xl font-bold text-indigo-600 ring-8 ring-indigo-50/50">
                            {user.name ? user.name.split(" ")[0]?.[0] : ""}
                            {user.name ? user.name.split(" ")[1]?.[0] : ""}
                        </div>

                        <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">
                            {user.name || "User"}
                        </h1>

                        {user.role && (
                            <span className="mt-4 inline-flex rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-600">
                                {user.role}
                            </span>
                        )}
                    </div>


                    {/* Profile Information */}
                    <div className="mt-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="flex items-center justify-between mt-7 mx-5">
                            <span className="text-sm text-slate-500"></span>

                            {user.status && (
                                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-600">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                    {user.status}
                                </span>
                            )}
                        </div>

                        <div className="border-b border-slate-200 px-6 py-5">
                            <h2 className="font-semibold text-slate-900">
                                Personal Information
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                Your account information
                            </p>
                        </div>


                        <div className="divide-y divide-slate-100">

                            <div className="flex items-center justify-between px-6 py-5">
                                <span className="text-sm text-slate-500">
                                    Full Name
                                </span>

                                <span className="text-sm font-medium text-slate-900">
                                    {user.name || "N/A"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between px-6 py-5">
                                <span className="text-sm text-slate-500">
                                    Email
                                </span>

                                <span className="text-sm font-medium text-slate-900">
                                    {user.email || "N/A"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between px-6 py-5">
                                <span className="text-sm text-slate-500">
                                    Member Since
                                </span>

                                <span className="text-sm font-medium text-slate-900">
                                    {user.created_at
                                        ? new Date(user.created_at).toLocaleString("en-IN", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "numeric",
                                            minute: "2-digit",
                                            hour12: true,
                                        })
                                        : "N/A"}
                                </span>
                            </div>

                        </div>
                    </div>


                    {/* Account */}
                    <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 px-6 py-5">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">
                                Account Settings
                            </h3>

                            <p className="mt-1 text-xs text-slate-400">
                                Manage your account preferences
                            </p>
                        </div>

                        <button onClick={handleOpenModal} className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600">
                            Edit Profile
                        </button>
                    </div>


                    {/* Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

                            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-900">
                                            Edit Profile
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-400">
                                            Update your account information
                                        </p>
                                    </div>

                                    <button onClick={() => setIsModalOpen(false)} className="cursor-pointer text-xl text-slate-400 transition hover:text-slate-700">
                                        ✕
                                    </button>
                                </div>

                                {error && (
                                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                                        {error}
                                    </div>
                                )}

                                {/* Form */}
                                <div className="mt-6 space-y-5">

                                    {/* Name */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-700">
                                            Full Name
                                        </label>

                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            placeholder="Enter full name"
                                            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                        />
                                    </div>


                                    {/* Email */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-700">
                                            Email
                                        </label>

                                        <input
                                            type="email"
                                            value={editEmail}
                                            onChange={(e) => setEditEmail(e.target.value)}
                                            placeholder="Enter email address"
                                            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                        />
                                    </div>

                                    <div>

                                        {/* Change Password Button */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setChangePassword(!changePassword);
                                                setPassword("");
                                                setConfirmPassword("");
                                                setError("");
                                            }}
                                            className="cursor-pointer rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
                                        >
                                            {changePassword ? "Cancel Password Change" : "Change Password"}
                                        </button>


                                        {/* Password Section */}
                                        {changePassword && (
                                            <div className="mt-5 space-y-5 border-t border-slate-200 pt-5">

                                                {/* New Password */}
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                                        New Password
                                                    </label>

                                                    <input
                                                        type="password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        placeholder="Enter your new password"
                                                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                                    />
                                                </div>


                                                {/* Confirm Password */}
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                                        Confirm Password
                                                    </label>

                                                    <input
                                                        type="password"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        placeholder="Confirm your new password"
                                                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                                    />
                                                </div>

                                            </div>
                                        )}

                                    </div>

                                </div>


                                {/* Actions */}
                                <div className="mt-7 flex justify-end gap-3">

                                    <button onClick={() => setIsModalOpen(false)} className="cursor-pointer rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                                        Cancel
                                    </button>

                                    <button
                                        onClick={handleUpdate}
                                        disabled={loading}
                                        className="cursor-pointer rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {loading ? "Saving..." : "Save Changes"}
                                    </button>

                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}