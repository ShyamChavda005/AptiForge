import { Link } from 'react-router-dom'
import AdProfileMenu from './AdProfileMenu'

export default function AdNavbar() {
    return (
        <>
            <div className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

                    <div>
                        <Link to="/">
                            <p className="text-md font-medium text-indigo-600">
                                AptiForge
                            </p>
                        </Link>

                        <h1 className="mt-1 text-2xl font-bold text-slate-900">
                            Admin Dashboard
                        </h1>
                    </div>

                    <div className="group flex h-13 w-13 cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-2xl font-bold text-white shadow-sm">
                        <AdProfileMenu />
                    </div>

                </div>
            </div>
        </>
    )
}