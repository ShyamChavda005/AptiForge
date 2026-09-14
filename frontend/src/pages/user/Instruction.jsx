import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

export default function Instruction() {
    const redirect = useNavigate();
    const location = useLocation();

    const topic = location.state?.topic;
    const topicId = typeof topic === 'object' ? topic?.id : (typeof topic === 'number' ? topic : null);
    const topicTitle = typeof topic === 'object' ? (topic?.name || "Practice Test") : (topic || "Practice Test");

    const [difficulty, setDifficulty] = useState("Medium");
    const [questionCount, setQuestionCount] = useState(
        typeof topic === 'object' && topic?.questionCount !== undefined ? topic.questionCount : 0
    );

    useEffect(() => {
        if (!topicId) return;

        const fetchTopicDetails = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/question/topic/${topicId}`);
                const questions = Array.isArray(res.data) ? res.data : [];

                setQuestionCount(questions.length);

                if (questions.length > 0) {
                    const diffCounts = {};
                    questions.forEach((q) => {
                        const rawDiff = (q.difficulty || "Medium").trim();
                        const capitalized = rawDiff.charAt(0).toUpperCase() + rawDiff.slice(1).toLowerCase();
                        diffCounts[capitalized] = (diffCounts[capitalized] || 0) + 1;
                    });

                    let dominant = "Medium";
                    let maxCount = 0;
                    Object.keys(diffCounts).forEach((d) => {
                        if (diffCounts[d] > maxCount) {
                            maxCount = diffCounts[d];
                            dominant = d;
                        }
                    });

                    setDifficulty(dominant);
                }
            } catch (err) {
                console.error("Error fetching question details for instructions:", err);
            }
        };

        fetchTopicDetails();
    }, [topicId]);

    const handleStart = () => {
        redirect('/user/dashboard/Questions', { state: { topic: topic } });
    };

    const goBack = () => {
        redirect('/user/dashboard');
    };

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-5">
            <div className="mx-auto max-w-4xl">

                {/* Header */}
                <div className="text-center">
                    <span className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600">
                        Practice Test
                    </span>

                    <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950">
                        Before you begin
                    </h1>

                    <p className="mt-3 text-slate-500">
                        Please read the instructions carefully before starting your practice session.
                    </p>
                </div>


                {/* Test Information */}
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">

                    <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                        <p className="text-sm text-slate-400">Topic</p>
                        <p className="mt-1 font-semibold text-slate-900 truncate">
                            {topicTitle}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                        <p className="text-sm text-slate-400">Questions</p>
                        <p className="mt-1 font-semibold text-slate-900">
                            {questionCount}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                        <p className="text-sm text-slate-400">Difficulty</p>
                        <p className="mt-1 font-semibold text-slate-900 capitalize">
                            {difficulty}
                        </p>
                    </div>

                </div>


                {/* Instructions */}
                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                    <h2 className="text-xl font-semibold text-slate-900">
                        Instructions
                    </h2>

                    <div className="mt-6 space-y-4">

                        {[
                            "Read each question carefully before selecting your answer.",
                            "Choose the best option for each question.",
                            "You can navigate back and forth between questions before submitting.",
                            "Your score will be calculated and presented immediately upon test submission.",
                            "Do not refresh or close the page while the practice test is in progress.",
                        ].map((instruction, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-4"
                            >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600">
                                    {index + 1}
                                </span>

                                <p className="pt-1 text-sm leading-6 text-slate-600">
                                    {instruction}
                                </p>
                            </div>
                        ))}

                    </div>

                </div>


                {/* Navigation Actions */}
                <div className="mt-5 flex flex-col items-center justify-between gap-4 sm:flex-row">

                    <p className="text-sm text-slate-400">
                        Make sure you're ready before starting.
                    </p>

                    <div className="flex w-full items-center justify-end gap-4 sm:w-auto">
                        <button
                            onClick={goBack}
                            className="cursor-pointer w-full rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto shadow-sm"
                        >
                            ← Go back
                        </button>

                        <button
                            onClick={handleStart}
                            className="cursor-pointer w-full rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:w-auto shadow-sm"
                        >
                            Start Practice →
                        </button>
                    </div>

                </div>

            </div>
        </main>
    );
}
