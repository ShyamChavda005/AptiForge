import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AdNavbar from "./AdNavbar";
import { API_BASE_URL } from "../../config/api";

function GenerateQuestion() {
    const navigate = useNavigate();

    const [topics, setTopics] = useState([]);
    const [loadingTopics, setLoadingTopics] = useState(true);

    // Form inputs
    const [selectedTopicId, setSelectedTopicId] = useState("");
    const [difficulty, setDifficulty] = useState("Medium");
    const [count, setCount] = useState(3);

    // AI Generation state
    const [step, setStep] = useState("config"); // "config" | "generating" | "review"
    const [generatedQuestions, setGeneratedQuestions] = useState([]);
    const [savingStatus, setSavingStatus] = useState({}); // { index: boolean }
    const [savedStatus, setSavedStatus] = useState({});   // { index: boolean }
    const [bulkSaving, setBulkSaving] = useState(false);

    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Fetch topics on mount
    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/topics`);
                setTopics(res.data || []);
                if (res.data && res.data.length > 0) {
                    setSelectedTopicId(res.data[0].id.toString());
                }
            } catch (err) {
                console.error("Error loading topics:", err);
                setError("Failed to load topics. Please check backend connection.");
            } finally {
                setLoadingTopics(false);
            }
        };

        fetchTopics();
    }, []);

    // Handle AI generation request
    const handleGenerate = async (e) => {
        if (e) e.preventDefault();
        setError("");
        setSuccessMsg("");

        if (!selectedTopicId) {
            setError("Please select a topic first.");
            return;
        }

        const selectedTopicObj = topics.find((t) => t.id.toString() === selectedTopicId.toString());
        const topicName = selectedTopicObj ? selectedTopicObj.name : "Aptitude";

        setStep("generating");

        try {
            const token = localStorage.getItem("Adtoken");
            const res = await axios.post(
                `${API_BASE_URL}/admin/generate-questions`,
                {
                    topic_id: parseInt(selectedTopicId),
                    topic_name: topicName,
                    difficulty: difficulty,
                    count: parseInt(count),
                },
                {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                }
            );

            const questionsList = Array.isArray(res.data)
                ? res.data
                : (res.data?.questions || []);

            if (questionsList && questionsList.length > 0) {
                setGeneratedQuestions(questionsList);
                setSavedStatus({});
                setSavingStatus({});
                setStep("review");
            } else {
                setError("AI did not return any questions. Please try again.");
                setStep("config");
            }
        } catch (err) {
            console.error("AI Generation error:", err);
            setError(err.response?.data?.detail || "Failed to generate questions.");
            setStep("config");
        }
    };

    // Update field value for a generated question item
    const handleItemChange = (index, field, value) => {
        const updated = [...generatedQuestions];
        updated[index] = { ...updated[index], [field]: value };
        setGeneratedQuestions(updated);
    };

    // Remove single question item from review list
    const handleDiscardItem = (index) => {
        const updated = generatedQuestions.filter((_, i) => i !== index);
        setGeneratedQuestions(updated);

        // Reset status objects
        const newSaved = {};
        const newSaving = {};
        updated.forEach((_, i) => {
            if (savedStatus[i < index ? i : i + 1]) newSaved[i] = true;
            if (savingStatus[i < index ? i : i + 1]) newSaving[i] = true;
        });
        setSavedStatus(newSaved);
        setSavingStatus(newSaving);

        if (updated.length === 0) {
            setStep("config");
        }
    };

    // Save single question to DB
    const handleSaveSingle = async (index) => {
        const q = generatedQuestions[index];
        if (!q) return;

        setError("");
        setSavingStatus((prev) => ({ ...prev, [index]: true }));

        try {
            const payload = {
                topic_id: parseInt(q.topic_id || selectedTopicId),
                question: q.question.trim(),
                option_a: q.option_a.trim(),
                option_b: q.option_b.trim(),
                option_c: q.option_c.trim(),
                option_d: q.option_d.trim(),
                correct_answer: q.correct_answer,
                explanation: (q.explanation || "").trim(),
                solution: (q.solution || "").trim(),
                difficulty: q.difficulty || difficulty,
            };

            await axios.post(`${API_BASE_URL}/question/topic/add`, payload);
            setSavedStatus((prev) => ({ ...prev, [index]: true }));
            setSuccessMsg(`Question #${index + 1} saved successfully!`);
        } catch (err) {
            console.error("Error saving question:", err);
            setError(err.response?.data?.detail || `Failed to save Question #${index + 1}.`);
        } finally {
            setSavingStatus((prev) => ({ ...prev, [index]: false }));
        }
    };

    // Save all unsaved questions to DB
    const handleApproveAll = async () => {
        setError("");
        setSuccessMsg("");
        setBulkSaving(true);

        const unsavedIndexes = generatedQuestions
            .map((_, i) => i)
            .filter((i) => !savedStatus[i]);

        if (unsavedIndexes.length === 0) {
            setSuccessMsg("All questions have already been saved to the database!");
            setBulkSaving(false);
            return;
        }

        let savedCount = 0;
        let failCount = 0;

        for (const idx of unsavedIndexes) {
            const q = generatedQuestions[idx];
            setSavingStatus((prev) => ({ ...prev, [idx]: true }));
            try {
                const payload = {
                    topic_id: parseInt(q.topic_id || selectedTopicId),
                    question: q.question.trim(),
                    option_a: q.option_a.trim(),
                    option_b: q.option_b.trim(),
                    option_c: q.option_c.trim(),
                    option_d: q.option_d.trim(),
                    correct_answer: q.correct_answer,
                    explanation: (q.explanation || "").trim(),
                    solution: (q.solution || "").trim(),
                    difficulty: q.difficulty || difficulty,
                };
                await axios.post(`${API_BASE_URL}/question/topic/add`, payload);
                setSavedStatus((prev) => ({ ...prev, [idx]: true }));
                savedCount++;
            } catch (err) {
                console.error(`Error saving index ${idx}:`, err);
                failCount++;
            } finally {
                setSavingStatus((prev) => ({ ...prev, [idx]: false }));
            }
        }

        setBulkSaving(false);

        if (failCount === 0) {
            setSuccessMsg(`Successfully approved and inserted all ${savedCount} questions into database! Redirecting...`);
            setTimeout(() => {
                navigate("/admin/dashboard/questions");
            }, 1800);
        } else {
            setError(`Saved ${savedCount} questions, but ${failCount} failed. Please review remaining items.`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <AdNavbar />

            <main className="mx-auto max-w-6xl px-6 py-8">

                {/* Header */}
                <div className="mb-6">
                    <Link to="/admin/dashboard/questions" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                        ← Back to Questions
                    </Link>

                    <div className="mt-3 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                Question Generator
                            </h1>
                        </div>

                        {step === "review" && (
                            <button
                                onClick={() => setStep("config")}
                                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm cursor-pointer">
                                Change Topic
                            </button>
                        )}
                    </div>
                </div>

                {/* Status Messages */}
                {error && (
                    <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-200 shadow-sm flex items-center justify-between">
                        <div>{error}</div>
                        <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 font-bold ml-4">✕</button>
                    </div>
                )}

                {successMsg && (
                    <div className="mb-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 border border-emerald-200 shadow-sm flex items-center justify-between">
                        <div>{successMsg}</div>
                        <button onClick={() => setSuccessMsg("")} className="text-emerald-400 hover:text-emerald-600 font-bold ml-4">✕</button>
                    </div>
                )}

                {/* STEP 1: CONFIGURATION FORM */}
                {step === "config" && (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">
                            Generator Parameters
                        </h2>

                        <form onSubmit={handleGenerate} className="space-y-6">

                            {/* Topic Select */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Select Database Topic
                                </label>
                                <select value={selectedTopicId}
                                    onChange={(e) => setSelectedTopicId(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    required>
                                    {loadingTopics ? (
                                        <option value="">Loading topics...</option>
                                    ) : topics.length === 0 ? (
                                        <option value="">No topics available</option>
                                    ) : (
                                        topics.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            {/* Difficulty */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Target Difficulty
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {["Easy", "Medium", "Hard"].map((d) => (
                                        <button key={d} type="button" onClick={() => setDifficulty(d)}
                                            className={`rounded-lg py-2.5 text-sm font-semibold border transition cursor-pointer ${
                                                difficulty === d
                                                    ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                            }`}>
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Question Count */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    How Many Questions?
                                </label>
                                <div className="grid grid-cols-4 gap-3">
                                    {[1, 3, 5, 10].map((num) => (
                                        <button key={num} type="button" onClick={() => setCount(num)}
                                            className={`rounded-lg py-2.5 text-sm font-semibold border transition cursor-pointer ${
                                                count === num
                                                    ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                            }`}>
                                            {num} {num === 1 ? "Question" : "Questions"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4 border-t border-slate-100 flex justify-end">
                                <button type="submit" disabled={loadingTopics || !selectedTopicId} className="w-full sm:w-auto rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 shadow-sm disabled:opacity-50 cursor-pointer">
                                    Generate Questions
                                </button>
                            </div>

                        </form>
                    </div>
                )}

                {/* STEP 2: GENERATING ANIMATION */}
                {step === "generating" && (
                    <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                            <svg className="h-7 w-7 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                        <h3 className="mt-5 text-xl font-bold text-slate-900">
                            Generating Aptitude Questions...
                        </h3>
                    </div>
                )}

                {/* STEP 3: REVIEW & EDIT CREATED QUESTIONS */}
                {step === "review" && (
                    <div className="space-y-6">

                        {/* Top Action Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">
                                    Review & Edit Generated Questions
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Review - Modify - Save
                                </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <button onClick={handleGenerate} className="rounded-lg border border-slate-200 bg-white px-8 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer">
                                    Regenerate
                                </button>
                                <button onClick={handleApproveAll} disabled={bulkSaving || Object.keys(savedStatus).length === generatedQuestions.length} className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer">
                                    {bulkSaving ? "Saving..." : "Approve All"}
                                </button>
                            </div>
                        </div>

                        {/* Questions Review List */}
                        {generatedQuestions.map((q, idx) => {
                            const isSaved = savedStatus[idx];
                            const isSaving = savingStatus[idx];
                            const correctOptKey = `option_${q.correct_answer ? q.correct_answer.toLowerCase() : "a"}`;
                            const correctOptText = q[correctOptKey] || "";

                            return (
                                <div key={idx}
                                    className={`rounded-xl border transition-all duration-200 bg-white p-6 shadow-sm ${
                                        isSaved ? "border-emerald-300 ring-1 ring-emerald-200 bg-emerald-50/10" : "border-slate-200"
                                    }`}>
                                    {/* Question Header Badge & Save status */}
                                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                                                #{idx + 1}
                                            </span>
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                {q.difficulty} • Topic #{q.topic_name || selectedTopicId}
                                            </span>
                                        </div>

                                        {isSaved ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700">
                                                Inserted into AptiForge
                                            </span>
                                        ) : (
                                            <button type="button" onClick={() => handleDiscardItem(idx)} className="text-sm font-medium text-slate-100 rounded-t rounded-b bg-rose-500 px-4 py-1.5 transition-colors cursor-pointer">
                                                Discard
                                            </button>
                                        )}
                                    </div>

                                    {/* Editable Fields */}
                                    <div className="space-y-4">
                                        {/* Question Text */}
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                                Question Statement
                                            </label>
                                            <textarea
                                                value={q.question}
                                                onChange={(e) => handleItemChange(idx, "question", e.target.value)}
                                                disabled={isSaved}
                                                rows={3}
                                                className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none disabled:bg-slate-50"
                                            />
                                        </div>

                                        {/* 4 Options Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {["a", "b", "c", "d"].map((opt) => (
                                                <div key={opt}>
                                                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                                                        Option {opt.toUpperCase()}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={q[`option_${opt}`]}
                                                        onChange={(e) => handleItemChange(idx, `option_${opt}`, e.target.value)}
                                                        disabled={isSaved}
                                                        className={`w-full rounded-lg border p-2.5 text-sm outline-none disabled:bg-slate-50 ${
                                                            q.correct_answer === opt.toUpperCase()
                                                                ? "border-emerald-400 bg-emerald-50/50 font-medium text-emerald-950"
                                                                : "border-slate-200 text-slate-800"
                                                        }`}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Generated Answer Display Card */}
                                        <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3.5 flex items-center justify-between">
                                            <div className="text-xs font-medium text-emerald-900">
                                                <span className="font-semibold text-emerald-950">Generated Correct Answer:</span>{" "}
                                                <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded mr-1">
                                                    Option {q.correct_answer}
                                                </span>
                                                <span className="text-emerald-800 font-medium">({correctOptText})</span>
                                            </div>
                                        </div>

                                        {/* Correct Answer & Difficulty Selectors */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                                    Correct Option
                                                </label>
                                                <select
                                                    value={q.correct_answer}
                                                    onChange={(e) => handleItemChange(idx, "correct_answer", e.target.value)}
                                                    disabled={isSaved}
                                                    className="w-full rounded-lg border border-slate-200 p-2.5 text-sm text-slate-800 outline-none disabled:bg-slate-50"
                                                >
                                                    <option value="A">Option A</option>
                                                    <option value="B">Option B</option>
                                                    <option value="C">Option C</option>
                                                    <option value="D">Option D</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                                    Difficulty
                                                </label>
                                                <select
                                                    value={q.difficulty}
                                                    onChange={(e) => handleItemChange(idx, "difficulty", e.target.value)}
                                                    disabled={isSaved}
                                                    className="w-full rounded-lg border border-slate-200 p-2.5 text-sm text-slate-800 outline-none disabled:bg-slate-50"
                                                >
                                                    <option value="Easy">Easy</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="Hard">Hard</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Explanation */}
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                                Explanation
                                            </label>
                                            <textarea
                                                value={q.explanation || ""}
                                                onChange={(e) => handleItemChange(idx, "explanation", e.target.value)}
                                                disabled={isSaved}
                                                rows={2}
                                                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 disabled:bg-slate-50"
                                                placeholder="Explanation for correct answer..."
                                            />
                                        </div>

                                        {/* Solution */}
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                                Step-by-Step Solution
                                            </label>
                                            <textarea
                                                value={q.solution || ""}
                                                onChange={(e) => handleItemChange(idx, "solution", e.target.value)}
                                                disabled={isSaved}
                                                rows={2}
                                                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 disabled:bg-slate-50"
                                                placeholder="Detailed step-by-step solution..."
                                            />
                                        </div>
                                    </div>

                                    {/* Item Action Footer */}
                                    <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
                                        {isSaved ? (
                                            <span className="text-xs font-semibold text-emerald-600">
                                                Saved to Database
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleSaveSingle(idx)}
                                                disabled={isSaving}
                                                className="rounded-lg bg-indigo-600 px-8 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition cursor-pointer">
                                                {isSaving ? "Saving..." : "Save"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                    </div>
                )}

            </main>
        </div>
    );
}

export default GenerateQuestion;