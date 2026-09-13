import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AdNavbar from "./AdNavbar";

function AdminAddTopic() {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Topic name is required.");
            return;
        }

        try {
            setLoading(true);
            await axios.post("http://localhost:8000/topics/add", {
                name: name.trim(),
            });
            navigate("/admin/dashboard/topics");
        } catch (err) {
            console.error("Error adding topic:", err);
            setError(err.response?.data?.detail || "Failed to add topic. It may already exist.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <AdNavbar />

            <main className="mx-auto max-w-2xl px-6 py-8">

                {/* Header */}
                <div>
                    <Link to="/admin/dashboard/topics" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                        ← Back to Topics
                    </Link>

                    <h1 className="mt-4 text-2xl font-semibold text-slate-900">
                        Add Topic
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Create a new aptitude topic.
                    </p>
                </div>

                {error && (
                    <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-8 rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
                    <label className="text-sm font-medium text-slate-700">
                        Topic Name
                    </label>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Percentage"
                        required
                        className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />

                    {/* Buttons */}
                    <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">

                        <Link to="/admin/dashboard/topics" className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? "Adding..." : "Add Topic"}
                        </button>

                    </div>
                </form>

            </main>
        </div>
    );
}

export default AdminAddTopic;