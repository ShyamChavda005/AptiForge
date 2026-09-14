import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import AdNavbar from "./AdNavbar";
import DataTablePagination from "../../components/DataTablePagination";
import { API_BASE_URL } from "../../config/api";

function AdminQuestions() {
    const location = useLocation();
    const [questions, setQuestions] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filtering & Pagination state
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTopic, setSelectedTopic] = useState("All Topics");
    const [selectedDifficulty, setSelectedDifficulty] = useState("All Difficulties");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // View & Edit modals
    const [viewingQuestion, setViewingQuestion] = useState(null);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [editForm, setEditForm] = useState({
        topic_id: "",
        question: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "",
        explanation: "",
        solution: "",
        difficulty: "Medium",
    });

    // AI Generator State
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiStep, setAiStep] = useState("form"); // "form" | "generating" | "review"
    const [aiForm, setAiForm] = useState({
        topic_id: "",
        difficulty: "Medium",
        count: 3,
    });
    const [generatedQuestions, setGeneratedQuestions] = useState([]);
    const [aiError, setAiError] = useState("");
    const [savingIndex, setSavingIndex] = useState(null);
    const [savingAll, setSavingAll] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");
            const [qRes, tRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/questions`),
                axios.get(`${API_BASE_URL}/topics`),
            ]);
            setQuestions(qRes.data || []);
            setTopics(tRes.data || []);
        } catch (err) {
            console.error("Error fetching questions:", err);
            setError("Failed to load questions from server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get("ai") === "true") {
            setShowAiModal(true);
            setAiStep("form");
        }
    }, [location.search]);

    // AI Generator Handlers
    const handleGenerateAi = async (e) => {
        e.preventDefault();
        if (!aiForm.topic_id) {
            alert("Please select a topic for question generation.");
            return;
        }
        const selectedT = topics.find((t) => t.id === parseInt(aiForm.topic_id));
        const topicName = selectedT ? selectedT.name : "General Aptitude";

        try {
            setAiStep("generating");
            setAiError("");
            const res = await axios.post(`${API_BASE_URL}/admin/generate-questions`, {
                topic_id: parseInt(aiForm.topic_id),
                topic_name: topicName,
                difficulty: aiForm.difficulty,
                count: parseInt(aiForm.count),
            });
            setGeneratedQuestions(res.data || []);
            setAiStep("review");
        } catch (err) {
            console.error("AI Generation error:", err);
            setAiError("Failed to generate questions using AI. Please try again.");
            setAiStep("form");
        }
    };

    const handleSaveSingleGenerated = async (q, index) => {
        try {
            setSavingIndex(index);
            await axios.post(`${API_BASE_URL}/question/topic/add`, {
                topic_id: parseInt(q.topic_id),
                question: q.question,
                option_a: q.option_a,
                option_b: q.option_b,
                option_c: q.option_c,
                option_d: q.option_d,
                correct_answer: q.correct_answer,
                explanation: q.explanation || "",
                solution: q.solution || "",
                difficulty: q.difficulty || "Medium",
            });
            setGeneratedQuestions((prev) => prev.filter((_, idx) => idx !== index));
            fetchData();
        } catch (err) {
            console.error("Error saving generated question:", err);
            alert(err.response?.data?.detail || "Failed to save question to database.");
        } finally {
            setSavingIndex(null);
        }
    };

    const handleSaveAllGenerated = async () => {
        if (generatedQuestions.length === 0) return;
        try {
            setSavingAll(true);
            for (const q of generatedQuestions) {
                await axios.post(`${API_BASE_URL}/question/topic/add`, {
                    topic_id: parseInt(q.topic_id),
                    question: q.question,
                    option_a: q.option_a,
                    option_b: q.option_b,
                    option_c: q.option_c,
                    option_d: q.option_d,
                    correct_answer: q.correct_answer,
                    explanation: q.explanation || "",
                    solution: q.solution || "",
                    difficulty: q.difficulty || "Medium",
                });
            }
            setGeneratedQuestions([]);
            fetchData();
            setShowAiModal(false);
            alert("All generated questions have been saved to the database!");
        } catch (err) {
            console.error("Error saving all questions:", err);
            alert("Some questions failed to save. Please review remaining questions.");
        } finally {
            setSavingAll(false);
        }
    };

    const handleUpdateGeneratedItem = (index, field, value) => {
        setGeneratedQuestions((prev) =>
            prev.map((q, idx) => (idx === index ? { ...q, [field]: value } : q))
        );
    };

    const handleDiscardGeneratedItem = (index) => {
        setGeneratedQuestions((prev) => prev.filter((_, idx) => idx !== index));
    };

    // Filter Logic
    const filteredQuestions = questions.filter((q) => {
        const matchesSearch =
            !searchQuery.trim() ||
            (q.question && q.question.toLowerCase().includes(searchQuery.trim().toLowerCase()));

        const matchesTopic =
            selectedTopic === "All Topics" ||
            q.topic === selectedTopic ||
            q.topic_id === parseInt(selectedTopic) ||
            String(q.topic_id) === String(selectedTopic);

        const matchesDifficulty =
            selectedDifficulty === "All Difficulties" ||
            q.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase();

        return matchesSearch && matchesTopic && matchesDifficulty;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage) || 1;
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
    const paginatedQuestions = filteredQuestions.slice(
        (safeCurrentPage - 1) * itemsPerPage,
        safeCurrentPage * itemsPerPage
    );

    // Filter reset handlers
    const handleTopicChange = (e) => {
        setSelectedTopic(e.target.value);
        setCurrentPage(1);
    };

    const handleDifficultyChange = (e) => {
        setSelectedDifficulty(e.target.value);
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setSelectedTopic("All Topics");
        setSelectedDifficulty("All Difficulties");
        setSearchQuery("");
        setCurrentPage(1);
    };

    // Delete Question Handler
    const handleDelete = async (qid) => {
        if (!window.confirm("Are you sure you want to delete this question?")) return;

        try {
            await axios.delete(`${API_BASE_URL}/question/topic/delete?qid=${qid}`);
            setQuestions((prev) => prev.filter((q) => q.id !== qid));
            if (paginatedQuestions.length === 1 && safeCurrentPage > 1) {
                setCurrentPage(safeCurrentPage - 1);
            }
        } catch (err) {
            console.error("Error deleting question:", err);
            alert(err.response?.data?.detail || "Failed to delete question.");
        }
    };

    // Edit Question Handlers
    const handleEditOpen = (q) => {
        setEditingQuestion(q);
        setEditForm({
            topic_id: q.topic_id ? String(q.topic_id) : "",
            question: q.question || "",
            option_a: q.option_a || "",
            option_b: q.option_b || "",
            option_c: q.option_c || "",
            option_d: q.option_d || "",
            correct_answer: q.correct_answer || "",
            explanation: q.explanation || "",
            solution: q.solution || "",
            difficulty: q.difficulty || "Medium",
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editForm.topic_id) {
            alert("Please select a topic.");
            return;
        }

        try {
            setEditSubmitting(true);
            const payload = {
                topic_id: parseInt(editForm.topic_id),
                question: editForm.question.trim(),
                option_a: editForm.option_a.trim(),
                option_b: editForm.option_b.trim(),
                option_c: editForm.option_c.trim(),
                option_d: editForm.option_d.trim(),
                correct_answer: editForm.correct_answer,
                explanation: editForm.explanation ? editForm.explanation.trim() : "",
                solution: editForm.solution ? editForm.solution.trim() : "",
                difficulty: editForm.difficulty,
            };

            await axios.put(
                `${API_BASE_URL}/question/topic/update?qid=${editingQuestion.id}`,
                payload
            );

            const updatedTopicObj = topics.find((t) => t.id === parseInt(editForm.topic_id));
            const updatedTopicName = updatedTopicObj ? updatedTopicObj.name : editingQuestion.topic;

            setQuestions((prev) =>
                prev.map((q) =>
                    q.id === editingQuestion.id
                        ? {
                            ...q,
                            ...payload,
                            topic: updatedTopicName,
                        }
                        : q
                )
            );

            setEditingQuestion(null);
        } catch (err) {
            console.error("Error updating question:", err);
            alert(err.response?.data?.detail || "Failed to update question.");
        } finally {
            setEditSubmitting(false);
        }
    };

    const isFiltered =
        selectedTopic !== "All Topics" ||
        selectedDifficulty !== "All Difficulties" ||
        searchQuery.trim() !== "";

    return (
        <div className="min-h-screen bg-slate-50">
            <AdNavbar />

            <main className="mx-auto max-w-7xl px-6 py-8">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-indigo-600 mb-3">
                            <Link to="/admin/dashboard" className="p-1.5 text-slate-100 bg-indigo-500 rounded-full mr-1"> Admin </Link> / Questions
                        </p>

                        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
                            Questions
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage aptitude questions.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link to="/admin/dashboard/add-questions/generate-question"
                            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 shadow-sm cursor-pointer">
                            Generate with AI
                        </Link>

                        <Link to="/admin/dashboard/add-questions" className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
                            Add Question
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
                        {error}
                    </div>
                )}

                {/* Filter and Control Bar */}
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 sm:py-4 shadow-2xs">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        {/* Search Input */}
                        <div className="relative flex-1 min-w-[240px]">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Search by question statement..."
                                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-5 pr-4 py-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100" />
                            {searchQuery && (
                                <button onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Dropdown Filters & Clear Filter */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Topic Filter */}
                            <div className="flex items-center gap-1.5">
                                {/* <label className="text-xs font-semibold text-slate-600">Topic:</label> */}
                                <select
                                    value={selectedTopic}
                                    onChange={handleTopicChange}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-2xs cursor-pointer">
                                    <option value="All Topics">All Topics</option>
                                    {topics.map((t) => (
                                        <option key={t.id} value={t.name}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Difficulty Filter */}
                            <div className="flex items-center gap-1.5">
                                {/* <label className="text-xs font-semibold text-slate-600">Difficulty:</label> */}
                                <select
                                    value={selectedDifficulty}
                                    onChange={handleDifficultyChange}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-2xs cursor-pointer">
                                    <option value="All Difficulties">All Difficulties</option>
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>

                            {/* Count Badge & Clear */}
                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
                                {filteredQuestions.length} {filteredQuestions.length === 1 ? "Found" : "Found"}
                            </span>

                            {isFiltered && (
                                <button
                                    onClick={handleClearFilters}
                                    className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition cursor-pointer underline ml-1"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Questions Table */}
                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
                    <div className="overflow-x-auto p-1">
                        <table className="w-full text-center border-collapse">
                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        ID
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Question
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Explanation
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Solution
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Topic
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Difficulty
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 text-center">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-sm text-slate-500">
                                            Loading questions...
                                        </td>
                                    </tr>
                                ) : paginatedQuestions.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-sm text-slate-500">
                                            {isFiltered ? (
                                                <div>
                                                    <p className="font-semibold text-slate-700">No questions match your selected filters.</p>
                                                    <button
                                                        onClick={handleClearFilters}
                                                        className="mt-2 inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                                                    >
                                                        Reset Filters
                                                    </button>
                                                </div>
                                            ) : (
                                                "No questions found. Click '+ Add Question' to create one."
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedQuestions.map((q) => (
                                        <tr key={q.id} className="hover:bg-slate-50/80 transition">
                                            <td className="px-6 py-4 text-xs font-bold text-slate-500">
                                                #{q.id}
                                            </td>

                                            <td className="max-w-xs px-6 py-4">
                                                <p className="line-clamp-2 text-sm font-medium text-slate-800" title={q.question}>
                                                    {q.question}
                                                </p>
                                            </td>

                                            <td className="max-w-xs px-6 py-4">
                                                <p className="truncate text-xs text-slate-600" title={q.explanation || "No explanation provided"}>
                                                    {q.explanation || <span className="italic text-slate-400">None</span>}
                                                </p>
                                            </td>

                                            <td className="max-w-xs px-6 py-4">
                                                <p className="truncate text-xs text-slate-600" title={q.solution || "No solution provided"}>
                                                    {q.solution || <span className="italic text-slate-400">None</span>}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                                                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-700">
                                                    {q.topic}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${q.difficulty?.toLowerCase() === 'easy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                                        q.difficulty?.toLowerCase() === 'hard' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                                            'bg-amber-50 text-amber-700 border border-amber-200'
                                                    }`}>
                                                    {q.difficulty}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setViewingQuestion(q)}
                                                        className="text-xs bg-slate-700 hover:bg-slate-800 cursor-pointer rounded-lg px-3 py-1.5 text-white font-semibold transition shadow-2xs"
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        onClick={() => handleEditOpen(q)}
                                                        className="text-xs bg-indigo-600 hover:bg-indigo-700 cursor-pointer rounded-lg px-3 py-1.5 text-white font-semibold transition shadow-2xs"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(q.id)}
                                                        className="text-xs bg-rose-600 hover:bg-rose-700 cursor-pointer rounded-lg px-3 py-1.5 text-white font-semibold transition shadow-2xs"
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
                        totalRecords={filteredQuestions.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={(p) => setCurrentPage(p)}
                        onItemsPerPageChange={(num) => { setItemsPerPage(num); setCurrentPage(1); }}
                    />
                </div>

                {/* View Question Detail Modal */}
                {viewingQuestion && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 overflow-y-auto">
                        <div className="w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-100">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-3">
                                    <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 border border-indigo-100">
                                        #{viewingQuestion.id}
                                    </span>
                                    <h2 className="text-xl font-bold text-slate-900">Question Details</h2>
                                </div>
                                <button
                                    onClick={() => setViewingQuestion(null)}
                                    className="text-slate-400 hover:text-slate-600 transition cursor-pointer p-1.5 rounded-lg hover:bg-slate-100"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Badges & Meta */}
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                    Topic: <strong className="text-slate-900">{viewingQuestion.topic}</strong>
                                </span>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${viewingQuestion.difficulty?.toLowerCase() === 'easy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                        viewingQuestion.difficulty?.toLowerCase() === 'hard' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                            'bg-amber-50 text-amber-700 border border-amber-200'
                                    }`}>
                                    Difficulty: <strong>{viewingQuestion.difficulty}</strong>
                                </span>
                            </div>

                            {/* Question Text */}
                            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-5">
                                <p className="text-xs uppercase font-semibold tracking-wider text-slate-400 mb-1.5">Question Statement</p>
                                <p className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed whitespace-pre-line">
                                    {viewingQuestion.question}
                                </p>
                            </div>

                            {/* Options Grid */}
                            <div className="mt-5">
                                <p className="text-xs uppercase font-semibold tracking-wider text-slate-400 mb-2.5">Options</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        { key: "A", val: viewingQuestion.option_a },
                                        { key: "B", val: viewingQuestion.option_b },
                                        { key: "C", val: viewingQuestion.option_c },
                                        { key: "D", val: viewingQuestion.option_d },
                                    ].map((opt) => {
                                        const isCorrect = viewingQuestion.correct_answer === opt.key;
                                        return (
                                            <div
                                                key={opt.key}
                                                className={`flex items-start gap-3 rounded-xl p-3.5 border transition ${isCorrect
                                                        ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium ring-1 ring-emerald-200"
                                                        : "bg-white border-slate-200 text-slate-700"
                                                    }`}
                                            >
                                                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${isCorrect ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                                                    }`}>
                                                    {opt.key}
                                                </span>
                                                <span className="text-sm pt-0.5 leading-snug flex-1">{opt.val}</span>
                                                {isCorrect && (
                                                    <span className="text-xs font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full shrink-0">
                                                        Correct
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Explanation */}
                            {viewingQuestion.explanation && (
                                <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1">Explanation</p>
                                    <p className="text-sm text-indigo-950 leading-relaxed whitespace-pre-line">
                                        {viewingQuestion.explanation}
                                    </p>
                                </div>
                            )}

                            {/* Solution */}
                            {viewingQuestion.solution && (
                                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Step-by-Step Solution</p>
                                    <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                                        {viewingQuestion.solution}
                                    </p>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
                                <button
                                    onClick={() => setViewingQuestion(null)}
                                    className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 cursor-pointer shadow-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Question Modal */}
                {editingQuestion && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 overflow-y-auto py-6">
                        <div className="w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto border border-slate-100">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <h2 className="text-xl font-bold text-slate-900">Edit Question #{editingQuestion.id}</h2>
                                <button
                                    onClick={() => setEditingQuestion(null)}
                                    className="text-slate-400 hover:text-slate-600 cursor-pointer p-1.5 rounded-lg hover:bg-slate-100"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="mt-5 space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1">Topic</label>
                                        <select
                                            value={editForm.topic_id}
                                            onChange={(e) => setEditForm({ ...editForm, topic_id: e.target.value })}
                                            required
                                            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                        >
                                            <option value="">Select Topic</option>
                                            {topics.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1">Difficulty</label>
                                        <select
                                            value={editForm.difficulty}
                                            onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                                            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1">Question Statement</label>
                                    <textarea
                                        value={editForm.question}
                                        onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                                        rows="3"
                                        required
                                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600">Option A</label>
                                        <input
                                            type="text"
                                            value={editForm.option_a}
                                            onChange={(e) => setEditForm({ ...editForm, option_a: e.target.value })}
                                            required
                                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600">Option B</label>
                                        <input
                                            type="text"
                                            value={editForm.option_b}
                                            onChange={(e) => setEditForm({ ...editForm, option_b: e.target.value })}
                                            required
                                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600">Option C</label>
                                        <input
                                            type="text"
                                            value={editForm.option_c}
                                            onChange={(e) => setEditForm({ ...editForm, option_c: e.target.value })}
                                            required
                                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600">Option D</label>
                                        <input
                                            type="text"
                                            value={editForm.option_d}
                                            onChange={(e) => setEditForm({ ...editForm, option_d: e.target.value })}
                                            required
                                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1">Correct Answer Option</label>
                                    <select
                                        value={editForm.correct_answer}
                                        onChange={(e) => setEditForm({ ...editForm, correct_answer: e.target.value })}
                                        required
                                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    >
                                        <option value="">Select Correct Answer</option>
                                        <option value="A">Option A</option>
                                        <option value="B">Option B</option>
                                        <option value="C">Option C</option>
                                        <option value="D">Option D</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1">Explanation</label>
                                    <textarea
                                        value={editForm.explanation}
                                        onChange={(e) => setEditForm({ ...editForm, explanation: e.target.value })}
                                        rows="2"
                                        placeholder="Explanation..."
                                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1">Step-by-Step Solution</label>
                                    <textarea
                                        value={editForm.solution}
                                        onChange={(e) => setEditForm({ ...editForm, solution: e.target.value })}
                                        rows="2"
                                        placeholder="Solution..."
                                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    />
                                </div>

                                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setEditingQuestion(null)}
                                        className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editSubmitting}
                                        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 cursor-pointer disabled:opacity-50 shadow-sm"
                                    >
                                        {editSubmitting ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* AI Question Generator Modal */}
                {showAiModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 overflow-y-auto">
                        <div className="w-full max-w-3xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-100">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 font-bold">
                                        AI
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">AI Question Generator</h2>
                                        <p className="text-xs text-slate-500">Powered by Gemini AI - Review & Edit before saving to Database</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowAiModal(false)}
                                    className="text-slate-400 hover:text-slate-600 transition cursor-pointer p-1.5 rounded-lg hover:bg-slate-100"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Step 1: Form */}
                            {aiStep === "form" && (
                                <form onSubmit={handleGenerateAi} className="mt-5 space-y-5">
                                    {aiError && (
                                        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-200">
                                            {aiError}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        {/* Topic */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Database Topic</label>
                                            <select
                                                value={aiForm.topic_id}
                                                onChange={(e) => setAiForm({ ...aiForm, topic_id: e.target.value })}
                                                required
                                                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                            >
                                                <option value="">Select Topic</option>
                                                {topics.map((t) => (
                                                    <option key={t.id} value={t.id}>
                                                        {t.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Difficulty */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Difficulty Level</label>
                                            <select
                                                value={aiForm.difficulty}
                                                onChange={(e) => setAiForm({ ...aiForm, difficulty: e.target.value })}
                                                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                            >
                                                <option value="Easy">Easy</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Hard">Hard</option>
                                            </select>
                                        </div>

                                        {/* Question Count */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">How Many Questions?</label>
                                            <select
                                                value={aiForm.count}
                                                onChange={(e) => setAiForm({ ...aiForm, count: e.target.value })}
                                                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                            >
                                                <option value="1">1 Question</option>
                                                <option value="3">3 Questions</option>
                                                <option value="5">5 Questions</option>
                                                <option value="10">10 Questions</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => setShowAiModal(false)}
                                            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 cursor-pointer shadow-md"
                                        >
                                            Generate Questions
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Step 2: Loading / Generating */}
                            {aiStep === "generating" && (
                                <div className="py-12 text-center">
                                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4 animate-bounce text-xl font-bold">
                                        🤖
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Gemini AI is crafting questions...</h3>
                                    <p className="mt-1.5 text-sm text-slate-500 max-w-md mx-auto">
                                        Generating aptitude questions with distinct options, explanations, and step-by-step solutions for your review.
                                    </p>
                                </div>
                            )}

                            {/* Step 3: Admin Review & Edit Interface */}
                            {aiStep === "review" && (
                                <div className="mt-5 space-y-6">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
                                        <div>
                                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Admin Review</span>
                                            <p className="text-sm font-semibold text-slate-900">
                                                {generatedQuestions.length} AI Generated Questions Pending Approval
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Edit any field below before inserting into database. Questions are only added to DB when approved.
                                            </p>
                                        </div>

                                        <div className="flex gap-2 shrink-0">
                                            <button
                                                onClick={() => setAiStep("form")}
                                                className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                                            >
                                                + Generate More
                                            </button>

                                            {generatedQuestions.length > 0 && (
                                                <button
                                                    onClick={handleSaveAllGenerated}
                                                    disabled={savingAll}
                                                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
                                                >
                                                    {savingAll ? "Saving All..." : "✓ Approve All & Save to DB"}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {generatedQuestions.length === 0 ? (
                                        <div className="py-8 text-center text-slate-500 text-sm">
                                            All generated questions have been processed! Click "+ Generate More" to generate additional questions.
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {generatedQuestions.map((q, idx) => (
                                                <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 shadow-xs space-y-4">
                                                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                                                                {idx + 1}
                                                            </span>
                                                            <span className="text-xs font-semibold text-slate-600">
                                                                Topic: <strong className="text-slate-900">{q.topic_name}</strong>
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${q.difficulty?.toLowerCase() === 'easy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                                                    q.difficulty?.toLowerCase() === 'hard' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                                                        'bg-amber-50 text-amber-700 border border-amber-200'
                                                                }`}>
                                                                {q.difficulty}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Question Textarea */}
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                                            Question Statement
                                                        </label>
                                                        <textarea
                                                            value={q.question}
                                                            onChange={(e) => handleUpdateGeneratedItem(idx, "question", e.target.value)}
                                                            rows="2"
                                                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm outline-none focus:border-indigo-500"
                                                        />
                                                    </div>

                                                    {/* Options Grid */}
                                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-600">Option A</label>
                                                            <input
                                                                type="text"
                                                                value={q.option_a}
                                                                onChange={(e) => handleUpdateGeneratedItem(idx, "option_a", e.target.value)}
                                                                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-600">Option B</label>
                                                            <input
                                                                type="text"
                                                                value={q.option_b}
                                                                onChange={(e) => handleUpdateGeneratedItem(idx, "option_b", e.target.value)}
                                                                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-600">Option C</label>
                                                            <input
                                                                type="text"
                                                                value={q.option_c}
                                                                onChange={(e) => handleUpdateGeneratedItem(idx, "option_c", e.target.value)}
                                                                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-600">Option D</label>
                                                            <input
                                                                type="text"
                                                                value={q.option_d}
                                                                onChange={(e) => handleUpdateGeneratedItem(idx, "option_d", e.target.value)}
                                                                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Correct Answer */}
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                                            Correct Answer Option
                                                        </label>
                                                        <select
                                                            value={q.correct_answer}
                                                            onChange={(e) => handleUpdateGeneratedItem(idx, "correct_answer", e.target.value)}
                                                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                                        >
                                                            <option value="A">Option A</option>
                                                            <option value="B">Option B</option>
                                                            <option value="C">Option C</option>
                                                            <option value="D">Option D</option>
                                                        </select>
                                                    </div>

                                                    {/* Explanation & Solution */}
                                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-600">Explanation</label>
                                                            <textarea
                                                                value={q.explanation}
                                                                onChange={(e) => handleUpdateGeneratedItem(idx, "explanation", e.target.value)}
                                                                rows="2"
                                                                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-600">Step-by-Step Solution</label>
                                                            <textarea
                                                                value={q.solution}
                                                                onChange={(e) => handleUpdateGeneratedItem(idx, "solution", e.target.value)}
                                                                rows="2"
                                                                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Item Actions */}
                                                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-200/80">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDiscardGeneratedItem(idx)}
                                                            className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                                                        >
                                                            Discard
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleSaveSingleGenerated(q, idx)}
                                                            disabled={savingIndex === idx}
                                                            className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
                                                        >
                                                            {savingIndex === idx ? "Saving..." : "✓ Approve & Save to DB"}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
                                        <button
                                            onClick={() => setShowAiModal(false)}
                                            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 cursor-pointer"
                                        >
                                            Done Reviewing
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}

export default AdminQuestions;