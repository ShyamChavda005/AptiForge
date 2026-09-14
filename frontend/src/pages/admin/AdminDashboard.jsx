import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AdNavbar from "./AdNavbar";
import { API_BASE_URL } from "../../config/api";

function AdminDashboard() {
    const [stats, setStats] = useState({
        users: 0,
        questions: 0,
        topics: 0,
        questions_per_topic: 0,
    });

    useEffect(() => {
        const getDashboardStats = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("Adtoken")}`,
                    },
                };

                const [usersRes, topicsRes, questionsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/admin/total-user`, config),
                    axios.get(`${API_BASE_URL}/admin/total-topic`, config),
                    axios.get(`${API_BASE_URL}/admin/total-questions`, config),
                ]);

                const totalTopics = typeof topicsRes.data === "number" ? topicsRes.data : 0;
                const totalQns = typeof questionsRes.data === "number" ? questionsRes.data : 0;
                const avgPerTopic = totalTopics > 0 ? (totalQns / totalTopics).toFixed(1) : 0;

                setStats({
                    users: typeof usersRes.data === "number" ? usersRes.data : 0,
                    topics: totalTopics,
                    questions: totalQns,
                    questions_per_topic: avgPerTopic,
                });
            } catch (error) {
                console.error("Dashboard stats error:", error.response?.data?.detail || error.message);
            }
        };

        getDashboardStats();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            <AdNavbar />

            <main className="mx-auto max-w-7xl px-6 py-5">

                {/* Overview */}
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                        Overview
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage AptiForge content and users from one place.
                    </p>
                </div>

                {/* Stats */}
                <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Users" value={stats.users} />
                    <StatCard title="Total Questions" value={stats.questions} />
                    <StatCard title="Total Topics" value={stats.topics} />
                    <StatCard title="Total Question Per Topic" value={stats.questions_per_topic} />
                </div>

                {/* Management */}
                <div className="mt-12">
                    <h2 className="text-xl font-semibold text-slate-900">
                        Manage Platform
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage questions, topics and registered users.
                    </p>

                    <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        <AdminCard title="Questions" description="Create, update and remove aptitude questions." link="/admin/dashboard/questions" button="Manage Questions"/>

                        <AdminCard title="Topics" description="Manage aptitude topics and their questions." link="/admin/dashboard/topics" button="Manage Topics"/>

                        <AdminCard title="Users" description="View registered users and manage accounts." link="/admin/dashboard/users" button="Manage Users"/>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-12">
                    <h2 className="text-xl font-semibold text-slate-900">
                        Quick Actions
                    </h2>

                    <div className="mt-5 flex flex-wrap gap-3">
                        <Link
                            to="/admin/dashboard/add-questions/generate-question"
                            className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 shadow-sm cursor-pointer"
                        >
                            Generate Questions with AI
                        </Link>

                        <Link to="/admin/dashboard/add-questions" className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
                            + Add Question
                        </Link>

                        <Link to="/admin/dashboard/topics" className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600">
                            + Add Topic
                        </Link>
                    </div>
                </div>

            </main>
        </div>
    );
}

function StatCard({ title, value }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-medium text-slate-500">{title}</p>

            <p className="mt-3 text-3xl font-bold text-slate-900">
                {value}
            </p>
        </div>
    );
}

function AdminCard({ title, description, link, button }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900">
                {title}
            </h3>

            <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                {description}
            </p>

            <Link
                to={link}
                className="mt-5 inline-flex rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            >
                {button} →
            </Link>
        </div>
    );
}

export default AdminDashboard;