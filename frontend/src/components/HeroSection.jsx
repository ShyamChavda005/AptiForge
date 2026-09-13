import { Link } from "react-router-dom";

export default function Hero() {
    return (
        <section className="bg-white">
            <div className="mx-auto max-w-7xl px-6 py-12 lg:flex lg:items-center lg:gap-16">

                <div className="max-w-2xl">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700">
                        <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                        Practice Makes Perfect.
                    </div>

                    <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                        Prepare for your next
                        <span className="text-indigo-600"> aptitude test.</span>
                    </h1>

                    <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                        Practice company-style aptitude questions, improve your
                        problem-solving skills, and track your progress with
                        focused practice sessions.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-4">
                        <Link to="/login" className="cursor-pointer rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
                            Get Started for free
                        </Link>

                        <Link to="/signup" className="cursor-pointer rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
                            Sign Up
                        </Link>
                    </div>
                </div>

                <div className="mt-16 w-full max-w-md lg:mt-0 lg:ml-auto">

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">

                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Today's Practice
                                </p>
                                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                                    Quantitative Aptitude
                                </h2>
                            </div>

                            <div className="rounded-lg bg-indigo-100 px-3 py-1.5 text-sm font-semibold text-indigo-700">
                                15 min
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                            <p className="text-sm font-medium text-slate-500">
                                Question 08 / 20
                            </p>

                            <p className="mt-4 text-base font-semibold leading-7 text-slate-900">
                                A train travels 360 km in 4 hours.
                                What is its average speed?
                            </p>

                            <div className="mt-5 space-y-3">
                                <div className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700">
                                    A. 80 km/h
                                </div>

                                <div className="rounded-lg border border-indigo-500 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700">
                                    B. 90 km/h
                                </div>

                                <div className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700">
                                    C. 100 km/h
                                </div>

                                <div className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700">
                                    D. 120 km/h
                                </div>
                            </div>
                        </div>

                        <div className="mt-5"> </div>

                    </div>
                </div>

            </div>
        </section>
    );
}