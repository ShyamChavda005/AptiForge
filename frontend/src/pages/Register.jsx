import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

function Register() {
    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const showError = (msg) => {
        setError(msg);
        setTimeout(() => {
            setError("");
        }, 4000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");

        if (!fullname.trim()) {
            showError("Please enter your full name.");
            return;
        }

        if (!email.trim()) {
            showError("Please enter your email address.");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.trim())) {
            showError("Please enter a valid email address.");
            return;
        }

        if (!password) {
            showError("Please create a password.");
            return;
        }

        if (password.length < 6) {
            showError("Password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            showError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post("http://localhost:8000/users", {
                fullname: fullname.trim(),
                email: email.trim(),
                password: password,
                role: "user",
                status: "Active",
            });

            if (response.data) {
                setSuccessMsg("Account created successfully! Redirecting to sign in...");
                setTimeout(() => {
                    navigate("/login");
                }, 1500);
            }
        } catch (err) {
            console.error("Registration error:", err);
            if (err.response?.data?.detail) {
                showError(err.response.data.detail);
            } else if (err.request) {
                showError("Unable to connect to backend server.");
            } else {
                showError("Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6 py-8">
                <div className="w-full max-w-md">

                    {/* Heading */}
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white shadow-sm">
                            A
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Create your account
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Start improving your aptitude skills today
                        </p>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="mb-4 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            <span>{error}</span>
                            <button onClick={() => setError("")} className="font-bold text-rose-400 hover:text-rose-600 ml-2 cursor-pointer">
                                ✕
                            </button>
                        </div>
                    )}

                    {successMsg && (
                        <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            <span>{successMsg}</span>
                            <button onClick={() => setSuccessMsg("")} className="font-bold text-emerald-400 hover:text-emerald-600 ml-2 cursor-pointer">
                                ✕
                            </button>
                        </div>
                    )}

                    {/* Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
                                    Full name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={fullname}
                                    onChange={(e) => setFullname(e.target.value)}
                                    placeholder="Enter your full name"
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create a password"
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                                <p className="mt-2 text-xs text-slate-400">
                                    Use at least 8 characters.
                                </p>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-700">
                                    Confirm password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your password"
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            {/* Register Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 cursor-pointer"
                            >
                                {loading ? "Creating Account..." : "Create account"}
                            </button>

                        </form>

                        {/* Login Link */}
                        <p className="mt-6 text-center text-sm text-slate-500">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="font-semibold text-indigo-600 transition hover:text-indigo-700"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default Register;