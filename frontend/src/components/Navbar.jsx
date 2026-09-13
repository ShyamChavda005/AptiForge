import { Link } from "react-router-dom";
import ProfileMenu from "../pages/user/ProfileMenu";
import AdProfilMenu from "../pages/admin/AdProfileMenu";

function Navbar() {
    return (
        <>
            <nav className="sticky top-0 border-b border-slate-300 bg-white">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

                    <div href="/" className="flex items-center gap-2">
                        <div className="group flex h-13 w-13 cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-2xl font-bold text-white shadow-sm transition-all duration-300 hover:scale-105 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200">
                            <span className="transition-transform duration-300 group-hover:scale-110">
                                A
                            </span>
                        </div>

                        <Link to="/">
                            <span className="text-2xl font-bold tracking-tight text-slate-900">
                                AptiForge
                            </span>
                        </Link>
                    </div>


                    {localStorage.getItem("isUserLogin") === "true" ? (
                        <ProfileMenu />
                    ) : localStorage.getItem("isAdminLogin") === "true" ? (
                        <AdProfilMenu />
                    ) : (
                        <Link
                            to="/login"
                            className="rounded-lg w-30 text-center bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </nav >
        </>
    )
}

export default Navbar;