import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AdNavbar from "./AdNavbar";

function AdminAddQuestion() {
    const [topics, setTopics] = useState([]);
    const [loadingTopics, setLoadingTopics] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const [form, setForm] = useState({
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

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const res = await axios.get("http://localhost:8000/topics");
                setTopics(res.data || []);
            } catch (err) {
                console.error("Error loading topics:", err);
                setError("Failed to load topics list.");
            } finally {
                setLoadingTopics(false);
            }
        };

        fetchTopics();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.topic_id) {
            setError("Please select a topic.");
            return;
        }

        if (!form.question.trim() || !form.option_a.trim() || !form.option_b.trim() || !form.option_c.trim() || !form.option_d.trim()) {
            setError("Please fill in all fields.");
            return;
        }

        if (!form.correct_answer) {
            setError("Please select the correct answer.");
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                topic_id: parseInt(form.topic_id),
                question: form.question.trim(),
                option_a: form.option_a.trim(),
                option_b: form.option_b.trim(),
                option_c: form.option_c.trim(),
                option_d: form.option_d.trim(),
                correct_answer: form.correct_answer,
                explanation: form.explanation.trim(),
                solution: form.solution.trim(),
                difficulty: form.difficulty,
            };

            await axios.post("http://localhost:8000/question/topic/add", payload);
            navigate("/admin/dashboard/questions");
        } catch (err) {
            console.error("Error adding question:", err);
            setError(err.response?.data?.detail || "Failed to add question.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <AdNavbar />

            <main className="mx-auto max-w-4xl px-6 py-8">

                {/* Header */}
                <div>
                    <Link to="/admin/dashboard/questions" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                        ← Back to Questions
                    </Link>


                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="mt-4 text-2xl font-semibold text-slate-900">
                                Add Question
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Create a new aptitude question for your question bank.
                            </p>
                        </div>

                        <Link to="/admin/dashboard/add-questions/generate-question" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:from-purple-700 hover:to-indigo-700 shadow-md cursor-pointer shrink-0">
                            Generate with AI
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-8 rounded-xl border border-slate-200 bg-white p-6 sm:p-8">

                    {/* Topic & Difficulty */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                        <FormField label="Topic">
                            <select name="topic_id" value={form.topic_id} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" required>
                                <option value="">
                                    {loadingTopics ? "Loading topics..." : "Select topic"}
                                </option>
                                {topics.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        <FormField label="Difficulty">
                            <select name="difficulty" value={form.difficulty} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </FormField>

                    </div>

                    {/* Question */}
                    <div className="mt-6">
                        <FormField label="Question">
                            <textarea name="question" value={form.question} onChange={handleChange} rows="4" placeholder="Enter the question..." className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none" required/>
                        </FormField>
                    </div>

                    {/* Options */}
                    <div className="mt-6">
                        <label className="text-sm font-medium text-slate-700">
                            Options
                        </label>

                        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">

                            <input name="option_a" value={form.option_a} onChange={handleChange} placeholder="Option A" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" required/>

                            <input name="option_b" value={form.option_b} onChange={handleChange} placeholder="Option B" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" required/>

                            <input name="option_c" value={form.option_c} onChange={handleChange} placeholder="Option C" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" required/>

                            <input name="option_d" value={form.option_d} onChange={handleChange} placeholder="Option D" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" required/>

                        </div>
                    </div>

                    {/* Correct Answer */}
                    <div className="mt-6">
                        <FormField label="Correct Answer">
                            <select name="correct_answer" value={form.correct_answer} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" required>
                                <option value="">Select correct answer</option>
                                <option value="A">Option A</option>
                                <option value="B">Option B</option>
                                <option value="C">Option C</option>
                                <option value="D">Option D</option>
                            </select>
                        </FormField>
                    </div>

                    {/* Explanation */}
                    <div className="mt-6">
                        <FormField label="Explanation">
                            <textarea name="explanation" value={form.explanation} onChange={handleChange} rows="3" placeholder="Enter explanation for the answer..." className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"/>
                        </FormField>
                    </div>

                    {/* Solution */}
                    <div className="mt-6">
                        <FormField label="Step-by-Step Solution">
                            <textarea name="solution" value={form.solution} onChange={handleChange} rows="3" placeholder="Enter step-by-step solution..." className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"/>
                        </FormField>
                    </div>

                    {/* Buttons */}
                    <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">

                        <Link to="/admin/dashboard/questions" className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                            Cancel
                        </Link>

                        <button type="submit" disabled={submitting} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer">
                            {submitting ? "Adding..." : "Add Question"}
                        </button>

                    </div>

                </form>
            </main>
        </div>
    );
}

function FormField({ label, children }) {
    return (
        <div>
            <label className="text-sm font-medium text-slate-700">
                {label}
            </label>

            <div className="mt-2">
                {children}
            </div>
        </div>
    );
}

export default AdminAddQuestion;