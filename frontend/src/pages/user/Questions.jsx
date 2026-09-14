import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

export default function Question() {
    const location = useLocation();
    const navigate = useNavigate();

    const topic = location.state?.topic;
    const topicId = typeof topic === "object" ? topic?.id : (typeof topic === "number" ? topic : null);
    const topicTitle = typeof topic === "object" ? topic?.name : (typeof topic === "string" ? topic : "Practice Test");

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [submittedQuestions, setSubmittedQuestions] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [showIncorrectModal, setShowIncorrectModal] = useState(false);
    const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (!isSubmitted && questions.length > 0) {
                e.preventDefault();
                e.returnValue = "Are you sure you want to exit ?";
                return e.returnValue;
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isSubmitted, questions.length]);

    // Handle back button & mobile swipe-back gesture to trigger exit popup
    useEffect(() => {
        if (isSubmitted || questions.length === 0) return;

        window.history.pushState({ inTest: true }, "", window.location.href);

        const handlePopState = () => {
            if (!isSubmitted) {
                window.history.pushState({ inTest: true }, "", window.location.href);
                setShowExitConfirmModal(true);
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, [isSubmitted, questions.length]);

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            setError("");

            try {
                let url = `${API_BASE_URL}/topics`;
                if (topicId) {
                    url = `${API_BASE_URL}/question/topic/${topicId}`;
                } else {
                    const topicsRes = await axios.get(`${API_BASE_URL}/topics`);
                    if (topicsRes.data && topicsRes.data.length > 0) {
                        const firstId = topicsRes.data[0].id;
                        url = `${API_BASE_URL}/question/topic/${firstId}`;
                    }
                }

                const response = await axios.get(url);
                const rawQuestions = Array.isArray(response.data) ? response.data : [];

                const formatted = rawQuestions.map((q) => ({
                    id: q.id,
                    question: q.question,
                    options: [q.option_a, q.option_b, q.option_c, q.option_d],
                    correctAnswer: q.correct_answer,
                    explanation: q.explanation || "",
                    solution: q.solution || "",
                    difficulty: q.difficulty || "Medium",
                }));

                setQuestions(formatted);
            } catch (err) {
                console.error("Error fetching questions:", err);
                setError("Failed to load questions for this topic. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [topicId]);

    const checkOptionIsCorrect = (q, optionIndex) => {
        if (!q || optionIndex === undefined || optionIndex === null) return false;
        const selectedOptionText = q.options[optionIndex];
        const correctStr = String(q.correctAnswer || "").trim().toLowerCase();
        const optionKeys = ["option_a", "option_b", "option_c", "option_d"];
        const letterKeys = ["a", "b", "c", "d"];

        return (
            correctStr === String(selectedOptionText).trim().toLowerCase() ||
            correctStr === optionKeys[optionIndex] ||
            correctStr === letterKeys[optionIndex]
        );
    };

    const handleSelectOption = (optionIndex) => {
        if (isSubmitted || submittedQuestions[currentQuestion]) return;

        setUserAnswers((prev) => ({
            ...prev,
            [currentQuestion]: optionIndex,
        }));
    };

    const handleSubmitQuestionAnswer = () => {
        const selectedIdx = userAnswers[currentQuestion];
        if (selectedIdx === undefined || selectedIdx === null) return;

        setSubmittedQuestions((prev) => ({
            ...prev,
            [currentQuestion]: true,
        }));

        const isCorrect = checkOptionIsCorrect(activeQuestion, selectedIdx);
        if (!isCorrect) {
            setShowIncorrectModal(true);
        }
    };

    const calculateScore = () => {
        let currentScore = 0;
        questions.forEach((q, idx) => {
            const selectedIdx = userAnswers[idx];
            if (checkOptionIsCorrect(q, selectedIdx)) {
                currentScore++;
            }
        });
        return currentScore;
    };

    const handleFinishTest = () => {
        const finalScore = calculateScore();
        setScore(finalScore);
        setIsSubmitted(true);
    };

    const activeQuestion = questions[currentQuestion];
    const selectedAnswerIndex = userAnswers[currentQuestion];
    const hasSelectedOption = selectedAnswerIndex !== undefined && selectedAnswerIndex !== null;
    const isCurrentQuestionSubmitted = Boolean(submittedQuestions[currentQuestion]);

    return (
        <>
            {/* <Navbar /> */}

            <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
                <div className="mx-auto max-w-6xl">

                    {/* Top Bar */}
                    <div className="mb-2 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-xs">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                                Aptitude Practice Module
                            </p>
                            <h1 className="mt-0.5 text-lg font-semibold text-slate-900">
                                {topicTitle}
                            </h1>
                        </div>

                        {!isSubmitted && (
                            <button
                                onClick={() => setShowExitConfirmModal(true)}
                                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition">
                                Exit Test
                            </button>
                        )}
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="mt-20 flex flex-col items-center justify-center space-y-4">
                            <div className="h-9 w-9 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent"></div>
                            <p className="text-sm text-slate-500">Loading questions...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {!loading && error && (
                        <div className="mx-auto mt-12 max-w-lg rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-xs">
                            <p className="text-sm text-red-600">{error}</p>
                            <button onClick={() => navigate("/user/dashboard")}
                                className="mt-4 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition">
                                Return to Dashboard
                            </button>
                        </div>
                    )}

                    {/* Empty Questions State */}
                    {!loading && !error && questions.length === 0 && (
                        <div className="mx-auto mt-12 max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-xs">
                            <h3 className="text-base font-semibold text-slate-900">No Questions Found</h3>
                            <button
                                onClick={() => navigate("/user/dashboard")}
                                className="cursor-pointer mt-5 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition">
                                Back to Dashboard
                            </button>
                        </div>
                    )}

                    {/* Questions & Main Card */}
                    {!loading && !error && questions.length > 0 && activeQuestion && (
                        <div className="grid gap-6">

                            {/* Question Card */}
                            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8 mt-1">

                                {/* Question Header */}
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                                    <span className="text-xs font-medium text-slate-500">
                                        Question {currentQuestion + 1} of {questions.length}
                                    </span>

                                    <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 capitalize">
                                        {activeQuestion.difficulty}
                                    </span>
                                </div>

                                {/* Question Text */}
                                <h2 className="mt-4 text-lg font-semibold leading-7 text-slate-900">
                                    {activeQuestion.question}
                                </h2>

                                {/* Options */}
                                <div className="mt-5 space-y-3">
                                    {activeQuestion.options.map((option, index) => {
                                        const isSelected = selectedAnswerIndex === index;
                                        const isThisCorrect = checkOptionIsCorrect(activeQuestion, index);

                                        let buttonStyle = "border-slate-200 hover:border-slate-300 hover:bg-slate-50";
                                        let badgeStyle = "bg-slate-100 text-slate-600";
                                        let statusBadge = null;

                                        if (isCurrentQuestionSubmitted || isSubmitted) {
                                            if (isSelected && isThisCorrect) {
                                                buttonStyle = "border-emerald-500 bg-emerald-50/50";
                                                badgeStyle = "bg-emerald-600 text-white";
                                                statusBadge = (
                                                    <span className="ml-auto rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                                                        Correct
                                                    </span>
                                                );
                                            } else if (isSelected && !isThisCorrect) {
                                                buttonStyle = "border-rose-400 bg-rose-50/50";
                                                badgeStyle = "bg-rose-600 text-white";
                                                statusBadge = (
                                                    <span className="ml-auto rounded-md bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700 border border-rose-200">
                                                        Incorrect
                                                    </span>
                                                );
                                            } else if (!isSelected && isThisCorrect) {
                                                buttonStyle = "border-emerald-300 bg-emerald-50/30 border-dashed";
                                                badgeStyle = "bg-emerald-100 text-emerald-700";
                                                statusBadge = (
                                                    <span className="ml-auto text-xs font-medium text-emerald-600">
                                                        Correct Answer
                                                    </span>
                                                );
                                            }
                                        } else if (isSelected) {
                                            buttonStyle = "border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500/30";
                                            badgeStyle = "bg-indigo-600 text-white";
                                        }

                                        return (
                                            <button
                                                key={index}
                                                disabled={isCurrentQuestionSubmitted || isSubmitted}
                                                onClick={() => handleSelectOption(index)}
                                                className={`flex w-full items-center gap-3.5 rounded-lg border p-3.5 text-left transition ${buttonStyle} ${isCurrentQuestionSubmitted || isSubmitted ? "cursor-default" : "cursor-pointer"
                                                    }`}>
                                                <span
                                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold transition ${badgeStyle}`}>
                                                    {String.fromCharCode(65 + index)}
                                                </span>

                                                <span className="text-sm font-normal text-slate-800">
                                                    {option}
                                                </span>

                                                {statusBadge}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Explanation & Solution Card (Only after Submit) */}
                                {(isCurrentQuestionSubmitted || isSubmitted) && (
                                    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-5 transition-all">
                                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-4">
                                            <h3 className="text-sm font-semibold text-slate-800">
                                                Explanation & Solution
                                            </h3>
                                            {checkOptionIsCorrect(activeQuestion, selectedAnswerIndex) ? (
                                                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                                                    Correct Answer
                                                </span>
                                            ) : (
                                                <span className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-md">
                                                    Incorrect Answer
                                                </span>
                                            )}
                                        </div>

                                        {/* Explanation */}
                                        <div className="mb-4">
                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
                                                Explanation
                                            </h4>
                                            <p className="text-sm text-slate-600 font-normal leading-relaxed whitespace-pre-line">
                                                {activeQuestion.explanation && activeQuestion.explanation.trim()
                                                    ? activeQuestion.explanation
                                                    : "No explanation provided for this question."}
                                            </p>
                                        </div>

                                        {/* Solution */}
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
                                                Solution
                                            </h4>
                                            <p className="text-sm text-slate-600 font-normal leading-relaxed whitespace-pre-line">
                                                {activeQuestion.solution && activeQuestion.solution.trim()
                                                    ? activeQuestion.solution
                                                    : "No step-by-step solution provided for this question."}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Navigation Footer */}
                                <div className="flex items-center justify-end border-t border-slate-100 pt-5 mt-6">
                                    {!isCurrentQuestionSubmitted ? (
                                        <button
                                            disabled={!hasSelectedOption}
                                            onClick={handleSubmitQuestionAnswer}
                                            className="cursor-pointer rounded-lg bg-indigo-600 px-10 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 shadow-xs">
                                            Submit
                                        </button>
                                    ) : currentQuestion < questions.length - 1 ? (
                                        <button
                                            onClick={() => {
                                                setShowIncorrectModal(false);
                                                setCurrentQuestion(currentQuestion + 1);
                                            }}
                                            className="cursor-pointer rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 shadow-xs">
                                            Next Question →
                                        </button>
                                    ) : (
                                        <button
                                            disabled={isSubmitted}
                                            onClick={handleFinishTest}
                                            className="cursor-pointer rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 shadow-xs disabled:opacity-50">
                                            Finish Test
                                        </button>
                                    )}
                                </div>
                            </section>
                        </div>
                    )}

                    {/* Incorrect Alert Popup Modal */}
                    {showIncorrectModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs px-4">
                            <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl text-center">

                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 font-bold text-xl border border-rose-200">
                                    !
                                </div>

                                <h3 className="mt-3 text-base font-semibold text-slate-900">
                                    Incorrect Answer
                                </h3>

                                <p className="mt-2 text-sm text-slate-600 font-normal leading-relaxed">
                                    The selected option is incorrect.
                                </p>

                                <button
                                    onClick={() => setShowIncorrectModal(false)}
                                    className="mt-5 w-full cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition">
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Exit Confirmation Modal */}
                    {showExitConfirmModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs px-4">
                            <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 font-bold text-xl border border-amber-200">
                                    !
                                </div>

                                <h3 className="mt-3 text-base font-semibold text-slate-900">
                                    Exit Practice Test?
                                </h3>

                                <p className="mt-2 text-sm text-slate-600 font-normal leading-relaxed">
                                    Are you sure you want to exit ?
                                </p>

                                <div className="mt-5 flex items-center justify-end gap-3">
                                    <button
                                        onClick={() => setShowExitConfirmModal(false)}
                                        className="w-1/2 cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => navigate("/user/dashboard")}
                                        className="w-1/2 cursor-pointer rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition">
                                        Yes, Exit
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Result Modal */}
                    {isSubmitted && (() => {
                        const scorePercentage = Math.round((score / (questions.length || 1)) * 100);
                        const passed = scorePercentage >= 70;

                        return (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs px-4">

                                <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-7 shadow-xl">

                                    {/* Header */}
                                    <div className="text-center">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                                            Test Result
                                        </p>

                                        <h2 className="mt-1 text-xl font-semibold text-slate-900">
                                            Test Completed
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500 font-normal">
                                            Your result for{" "}
                                            <span className="font-medium text-slate-700">
                                                {topicTitle}
                                            </span>
                                        </p>
                                    </div>

                                    {/* Score */}
                                    <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-6 py-5 text-center">
                                        <p className="text-3xl font-bold text-slate-900">
                                            {score}
                                            <span className="ml-1 text-base font-normal text-slate-400">
                                                / {questions.length}
                                            </span>
                                        </p>

                                        <p className="mt-2 text-sm font-semibold text-indigo-600">
                                            Your Score: {scorePercentage}%
                                        </p>

                                        <div className="mt-3 flex justify-center">
                                            <span className={`inline-block rounded-full px-3.5 py-1 text-xs font-semibold ${passed
                                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                                    : "bg-rose-100 text-rose-700 border border-rose-200"
                                                }`}>
                                                {passed ? "Good to Go" : "Needs Improvement"}
                                            </span>
                                        </div>

                                        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                                            Most companies consider approx. 70% score for aptitude rounds.
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-6 space-y-2.5">

                                        <button
                                            onClick={() => {
                                                setIsSubmitted(false);
                                                setUserAnswers({});
                                                setSubmittedQuestions({});
                                                setCurrentQuestion(0);
                                                setShowIncorrectModal(false);
                                            }}
                                            className="w-full cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                                            Retake Test
                                        </button>

                                        <button
                                            onClick={() => navigate("/user/dashboard")}
                                            className="w-full cursor-pointer rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700">
                                            Back to Dashboard
                                        </button>

                                    </div>

                                </div>
                            </div>
                        );
                    })()}

                </div>
            </main>
        </>
    );
}


