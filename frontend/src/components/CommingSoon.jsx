function CommingSoon() {
    const features = [
        {
            title: "Daily Challenges",
            description:
                "Build a consistent preparation habit with short daily aptitude challenges.",
            tag: "Coming Soon",
        },
        {
            title: "Leaderboard",
            description:
                "Compare your performance with other learners and challenge yourself to improve.",
            tag: "Community",
        },
        {
            title: "Personalized Practice",
            description:
                "Get practice recommendations based on your performance and areas that need improvement.",
            tag: "Smart Practice",
        },
    ];

    return (
        <section className="min-h-[calc(100vh-80px)] bg-white px-6 py-20">
            <div className="mx-auto max-w-7xl">

                <div className="mx-auto max-w-2xl text-center">

                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600">
                        <span className="h-2 w-2 rounded-full bg-indigo-600" />
                        Coming Soon
                    </div>

                    <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                        More powerful features are
                        <span className="block text-indigo-600">
                            on the way.
                        </span>
                    </h1>

                    <p className="mt-5 text-base leading-7 text-slate-500 sm:text-lg">
                        We're building new tools to help you practice smarter,
                        track your progress, and prepare with confidence.
                    </p>

                </div>


                <div className="mx-auto mt-14 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">

                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="group rounded-2xl border border-slate-400 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:bg-indigo-100 hover:shadow-md">

                            {/* Icon */}
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="h-5 w-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                                    <circle cx="12" cy="12" r="9" />
                                </svg>
                            </div>


                            {/* Tag */}
                            <div className="mt-5">
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                                    {feature.tag}
                                </span>
                            </div>


                            {/* Title */}
                            <h2 className=" mt-4 text-xl font-semibold text-slate-900">
                                {feature.title}
                            </h2>


                            {/* Description */}
                            <p className=" mt-3 text-sm leading-6 text-slate-500">
                                {feature.description}
                            </p>


                            {/* Coming Soon */}
                            <div className=" mt-6 flex items-center gap-2 text-sm font-medium text-indigo-600">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                                Coming soon
                            </div>

                        </div>
                    ))}

                </div>

            </div>
        </section>
    );
}

export default CommingSoon;