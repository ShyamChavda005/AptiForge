import { Link } from "react-router-dom";

function PageNotFound() {
    return (
        <div className="flex min-h-[80vh] items-center justify-center bg-white px-6">
            <div className="text-center">

                <h1 className="text-8xl font-bold tracking-tight text-indigo-600 sm:text-9xl">
                    404
                </h1>

                <h2 className="mt-6 text-2xl font-bold text-slate-900 sm:text-3xl">
                    Page not found
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
                    The page you're looking for doesn't exist or may have
                    been moved to another location.
                </p>

                <Link to="/" className="mt-7 inline-flex items-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
                    Go back home
                </Link>

            </div>
        </div>
    );
}

export default PageNotFound;