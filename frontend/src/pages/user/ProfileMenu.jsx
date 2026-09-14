import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from 'axios'
import { API_BASE_URL } from '../../config/api';

function ProfileMenu() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");

    useEffect(() => {
        const getProfile = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/profile`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                })

                setName(response.data.name)
                // console.log(response.data.name)
            }
            catch (err) {
                console.error(err)
            }
        }

        getProfile();
    }, [])

    return (
        <div className="relative">

            {/* Profile */}
            <button
                onClick={() => setOpen(!open)}
                className=" flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 transition hover:border-indigo-200 hover:bg-indigo-50">
                <div className=" flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                    {name.split(" ")[0]?.[0]}
                    {name.split(" ")[1]?.[0]}
                </div>

                <span className="hidden text-sm font-semibold text-slate-800 sm:block">
                    {name}
                </span>

                <span className="text-slate-400">
                    ▾
                </span>
            </button>


            {/* Dropdown */}
            {open && (
                <div className=" absolute right-0 top-15 z-50 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">

                    <Link
                        to="/user/dashboard/"
                        className=" block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600">
                        Dashboard
                    </Link>

                    <div className="border-t border-slate-100" />

                    <Link
                        to="/user/dashboard/profile"
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
    );
}

export default ProfileMenu;