import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AdNavbar from "./AdNavbar";
import DataTablePagination from "../../components/DataTablePagination";

function AdminTopics() {
    const [topics, setTopics] = useState([]);
    const [topicCounts, setTopicCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [editingTopic, setEditingTopic] = useState(null);
    const [editName, setEditName] = useState("");
    const [editSubmitting, setEditSubmitting] = useState(false);

    const fetchTopics = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await axios.get("http://localhost:8000/topics");
            const topicsData = res.data || [];
            setTopics(topicsData);

            // Fetch question counts for each topic
            const counts = {};
            await Promise.all(
                topicsData.map(async (t) => {
                    try {
                        const countRes = await axios.get(
                            `http://localhost:8000/admin/total-question-topic?tid=${t.id}`
                        );
                        counts[t.id] = countRes.data;
                    } catch (e) {
                        counts[t.id] = 0;
                    }
                })
            );
            setTopicCounts(counts);
        } catch (err) {
            console.error("Error fetching topics:", err);
            setError("Failed to load topics.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTopics();
    }, []);

    // Delete topic
    const handleDelete = async (topicId, topicName) => {
        if (!window.confirm(`Are you sure you want to delete topic "${topicName}" and all its questions?`)) {
            return;
        }

        try {
            await axios.delete(`http://localhost:8000/topics/delete?topic_id=${topicId}`);
            setTopics((prev) => prev.filter((t) => t.id !== topicId));
            if (paginatedTopics.length === 1 && safeCurrentPage > 1) {
                setCurrentPage(safeCurrentPage - 1);
            }
        } catch (err) {
            console.error("Error deleting topic:", err);
            alert(err.response?.data?.detail || "Failed to delete topic.");
        }
    };

    // Edit topic handlers
    const handleEditOpen = (topic) => {
        setEditingTopic(topic);
        setEditName(topic.name);
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        if (!editName.trim()) return;

        try {
            setEditSubmitting(true);
            await axios.put(`http://localhost:8000/topics/update?tid=${editingTopic.id}`, {
                name: editName.trim(),
            });

            setTopics((prev) =>
                prev.map((t) => (t.id === editingTopic.id ? { ...t, name: editName.trim() } : t))
            );
            setEditingTopic(null);
        } catch (err) {
            console.error("Error updating topic:", err);
            alert(err.response?.data?.detail || "Failed to update topic.");
        } finally {
            setEditSubmitting(false);
        }
    };

    // Filter & Paginate
    const filteredTopics = topics.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );

    const totalPages = Math.ceil(filteredTopics.length / itemsPerPage) || 1;
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
    const paginatedTopics = filteredTopics.slice(
        (safeCurrentPage - 1) * itemsPerPage,
        safeCurrentPage * itemsPerPage
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <AdNavbar />

            <main className="mx-auto max-w-7xl px-6 py-8">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-indigo-600 mb-3">
                            <Link to="/admin/dashboard" className="p-1.5 text-slate-100 bg-indigo-500 rounded-full mr-1"> Admin </Link> / Topics
                        </p>

                        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
                            Topics Management
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage aptitude topics, edit titles, and view question counts.
                        </p>
                    </div>

                    <Link to="/admin/dashboard/add-topic" className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 shadow-sm">
                        + Add Topic
                    </Link>
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
                                placeholder="Search topic name..."
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
                            {filteredTopics.length} {filteredTopics.length === 1 ? "Topic" : "Topics Total"}
                        </span>
                    </div>
                </div>

                {/* Topics Table */}
                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">

                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        #
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Topic Name
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Total Questions
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-sm text-slate-500">
                                            Loading topics...
                                        </td>
                                    </tr>
                                ) : paginatedTopics.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-sm text-slate-500">
                                            {searchQuery ? "No topics match your search query." : "No topics found. Click '+ Add Topic' to create one."}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedTopics.map((t, idx) => (
                                        <tr key={t.id} className="hover:bg-slate-50/80 transition">
                                            <td className="px-6 py-4 text-xs font-bold text-slate-500">
                                                {(safeCurrentPage - 1) * itemsPerPage + idx + 1}
                                            </td>

                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {t.name}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                                    {topicCounts[t.id] ?? 0} Questions
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEditOpen(t)}
                                                        className="text-xs bg-indigo-600 hover:bg-indigo-700 cursor-pointer rounded-lg px-3.5 py-1.5 text-white font-semibold transition shadow-2xs"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(t.id, t.name)}
                                                        className="text-xs bg-rose-600 hover:bg-rose-700 cursor-pointer rounded-lg px-3.5 py-1.5 text-white font-semibold transition shadow-2xs"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>

                        </table>
                    </div>

                    {/* Pagination */}
                    <DataTablePagination
                        currentPage={safeCurrentPage}
                        totalRecords={filteredTopics.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={(p) => setCurrentPage(p)}
                        onItemsPerPageChange={(num) => { setItemsPerPage(num); setCurrentPage(1); }}
                    />
                </div>

                {/* Edit Topic Modal */}
                {editingTopic && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h2 className="text-xl font-bold text-slate-900">Edit Topic</h2>
                                <button
                                    onClick={() => setEditingTopic(null)}
                                    className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleEditSave} className="mt-4">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                                    Topic Name
                                </label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    required
                                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />

                                <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setEditingTopic(null)}
                                        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editSubmitting}
                                        className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 cursor-pointer disabled:opacity-50 shadow-sm"
                                    >
                                        {editSubmitting ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}

export default AdminTopics;