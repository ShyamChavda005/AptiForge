import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const showError = (message) => {
        setError(message);

        setTimeout(() => {
            setError("");
        }, 3000);
    };

    const handleForm = async (e) => {
        e.preventDefault();
        setError("");

        if (!email.trim()) {
            showError("Please enter your email address.");
            return;
        }

        if (!password.trim()) {
            showError("Please enter your password.");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            showError("Please enter a valid email address.");
            return;
        }

        try {
            setLoading(true);

            const data = await axios.post(
                `${API_BASE_URL}/login/users`,
                { email, password }
            );

            if (data.data["require_otp"]) {
                //  User Role
                if (data.data["message"] === "OTP sent successfully") {
                    navigate("/login/Otp", { state: { email: email } })
                }
                else {
                    showError("OTP Not Sent.");
                }
            } else {
                // Admin Role
                localStorage.setItem("Adtoken", data.data["token"]);
                localStorage.setItem("isAdminLogin", "true");
                navigate("/admin/dashboard")
            }
        } catch (err) {
            if (err.response?.status === 401) {
                showError("Invalid email or password.");
            } else if (err.response?.status === 422) {
                showError("Please enter valid login information.");
            } else if (err.response?.status == 403) {
                showError("Email Blocked by Administrator !");
            } else if (err.request) {
                showError("Unable to connect to the server.");
            } else {
                showError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="flex justify-center px-6 py-10">
                <div className="w-full max-w-md">

                    <h1 className="mb-5 text-center text-3xl font-bold text-slate-900">
                        Welcome back
                    </h1>

                    {/* Error */}
                    {error && (
                        <div className="mb-4 flex justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            <span>{error}</span>

                            <button onClick={() => setError("")} className="ml-4 font-bold">
                                x
                            </button>
                        </div>
                    )}

                    <div className="rounded-2xl border border-slate-300 bg-white p-8 shadow-sm">

                        <form onSubmit={handleForm} className="space-y-5">

                            {/* Email */}
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Email address
                                </label>

                                <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"/>
                            </div>

                            {/* Password */}
                            <div>
                                <div className="mb-2 flex justify-between">
                                    <label className="text-sm font-medium">
                                        Password
                                    </label>

                                    {/* <Link
                                        to="/forgot-password"
                                        className="text-sm font-medium text-indigo-600"
                                    >
                                        Forgot password?
                                    </Link> */}
                                </div>

                                <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"/>
                            </div>

                            {/* Remember */}
                            <div className="flex items-center gap-2">
                                <input id="remember" type="checkbox" />

                                <label htmlFor="remember" className="text-sm text-slate-600">
                                    Remember me
                                </label>
                            </div>

                            {/* Submit */}
                            <button type="submit" disabled={loading} className="w-full cursor-pointer rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
                                {loading ? "Signing in..." : "Sign in"}
                            </button>

                        </form>

                        <p className="mt-6 text-center text-sm text-slate-500">
                            Don't have an account?{" "}
                            <Link to="/signup" className="font-semibold text-indigo-600">
                                Create an account
                            </Link>
                        </p>

                    </div>
                </div>
            </main>
        </div>
    );
}
