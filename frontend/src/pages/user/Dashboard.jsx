import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar'
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

function Dashboard() {
    const redirect = useNavigate();
    const [name, setName] = useState("");
    const [topics, setTopic] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            redirect("/login");
            return;
        }

        const fetchDashboardData = async () => {
            setLoading(true);
            setError("");
            try {
                const profileRes = await axios.get(`${API_BASE_URL}/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setName(profileRes.data.name);

                const topicsRes = await axios.get(`${API_BASE_URL}/topics`);
                const rawTopics = Array.isArray(topicsRes.data) ? topicsRes.data : [];

                const topicsWithCounts = await Promise.all(
                    rawTopics.map(async (t) => {
                        try {
                            const countRes = await axios.get(`${API_BASE_URL}/admin/total-question-topic?tid=${t.id}`);
                            return {
                                ...t,
                                questionCount: typeof countRes.data === "number" ? countRes.data : 0
                            };
                        } catch (err) {
                            console.error(`Error fetching count for topic ${t.id}:`, err);
                            return { ...t, questionCount: 0 };
                        }
                    })
                );

                setTopic(topicsWithCounts);

            } catch (err) {
                console.error("Dashboard data load error:", err);
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.setItem('isUserLogin', 'false');
                    redirect('/login');
                } else {
                    setError("Failed to load dashboard data. Please try again.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [redirect]);

    const handleClick = (topic) => {
        redirect('/user/dashboard/instruction', { state: { topic: topic } });
    };

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-slate-50 px-6 py-16">
                <div className="mx-auto max-w-6xl">

                    {/* Welcome */}
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                            Welcome, <span className="text-indigo-600">{name || "User"}</span>
                        </h1>

                        <p className="mt-3 text-slate-500">
                            Choose a topic and start practicing to improve your skills.
                        </p>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="mt-16 flex flex-col items-center justify-center space-y-4">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                            <p className="text-sm font-medium text-slate-500">Loading topics...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {!loading && error && (
                        <div className="mx-auto mt-10 max-w-md rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm font-medium text-red-600 shadow-sm">
                            {error}
                        </div>
                    )}

                    {/* Empty Topics */}
                    {!loading && !error && topics.length === 0 && (
                        <div className="mx-auto mt-12 max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                                📚
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-slate-900">No Topics Available</h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Practice topics will appear here once added by the administrator.
                            </p>
                        </div>
                    )}

                    {/* Topics Grid */}
                    {!loading && !error && topics.length > 0 && (
                        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">

                            {topics.map((topic, index) => {
                                const topicTitle = typeof topic === 'object' ? topic.name : topic;
                                const topicKey = typeof topic === 'object' ? (topic.id || index) : index;

                                return (
                                    <div
                                        key={topicKey} className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md">

                                        <div>
                                            <div className="flex items-center justify-between">
                                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white shadow-sm">
                                                    {String(index + 1).padStart(2, "0")}
                                                </span>

                                                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                                                    Created by Admin
                                                </span>
                                            </div>

                                            <div className="mt-6">
                                                <h3 className="text-xl font-semibold text-slate-900 transition-colors group-hover:text-indigo-600">
                                                    {topicTitle}
                                                </h3>

                                                <p className="mt-2 text-sm text-slate-400">
                                                    {topic.questionCount !== undefined ? `${topic.questionCount} ${topic.questionCount === 1 ? 'Question' : 'Questions'}` : '0 Questions'}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            className="cursor-pointer mt-6 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 shadow-sm hover:shadow"
                                            onClick={() => handleClick(topic)}>
                                            Start Practice →
                                        </button>

                                    </div>
                                );
                            })}

                        </div>
                    )}

                </div>
            </main>
        </>
    );
}

export default Dashboard;