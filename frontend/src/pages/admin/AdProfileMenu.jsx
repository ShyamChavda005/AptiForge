import {Link} from 'react-router-dom'
import { useEffect, useState } from 'react';
import axios from 'axios'

export default function AdProfilMenu() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const token = localStorage.getItem("Adtoken");
                const response = await axios.get("http://localhost:8000/admin/profile", {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                });
                if (response.data && response.data.fullname) {
                    setName(response.data.fullname);
                }
            } catch (err) {
                console.error("Error loading admin profile:", err);
            }
        };

        loadData();
    }, []);

    const initial = name ? name.trim().split(" ")[0]?.[0]?.toUpperCase() || "A" : "A";

    return (
        <>
            <div className="relative">

                {/* Profile */}
                <button
                    onClick={() => setOpen(!open)}
                    className="cursor-pointer flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 transition hover:border-indigo-200 hover:bg-indigo-50">
                    <div className=" flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                       {initial}
                    </div>

                    <span className="hidden text-sm font-semibold text-slate-800 sm:block">
                        {name || "Admin"}
                    </span>

                    <span className="text-slate-400">
                        ▾
                    </span>
                </button>


                {/* Dropdown */}
                {open && (
                    <div className=" absolute right-0 top-15 z-50 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">

                        <Link
                            to="/admin/dashboard/"
                            className=" block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600">
                            Dashboard
                        </Link>

                        <div className="border-t border-slate-100" />

                        <Link
                            to="/admin/dashboard/profile"
                            className=" block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600">
                            Profile
                        </Link>

                        <div className="border-t border-slate-100" />

                        <Link
                            to="/logout"
                            className=" block px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50">
                            Logout
                        </Link>

                    </div>
                )}

            </div>
        </>
    )
}