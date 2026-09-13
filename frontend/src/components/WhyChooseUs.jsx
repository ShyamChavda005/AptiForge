function WhyChooseUs() {
    const benefits = [
        {
            number: "01",
            title: "Company-Style Practice",
            description:
                "Practice aptitude questions designed around the patterns commonly used in placement and recruitment tests.",
        },
        {
            number: "02",
            title: "Focused Practice",
            description:
                "Choose the topics you want to improve and spend your time practicing what actually matters.",
        },
        {
            number: "03",
            title: "Track Your Progress",
            description:
                "Monitor your accuracy, performance, and improvement as you continue your preparation.",
        },
        {
            number: "04",
            title: "Practice With Confidence",
            description:
                "Build speed, accuracy, and problem-solving skills through consistent and structured practice.",
        },
    ];

    return (
        <section className="bg-white px-6 py-3">
            <div className="mx-auto max-w-6xl">

                {/* Section Header */}
                <div className="mx-auto max-w-7xl text-center">

                    <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600">
                        Why AptiForge?
                    </span>

                    <h2 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                        Everything you need to
                        <span className="block text-indigo-600 my-3">
                            practice better.
                        </span>
                    </h2>

                    <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
                        AptiForge gives you a simple and focused environment
                        to build the aptitude skills you need for your next
                        opportunity.
                    </p>

                </div>


                {/* Benefits */}
                <div className="mt-8 grid gap-x-12 gap-y-12 border-t border-slate-200 pt-10 md:grid-cols-2">

                    {benefits.map((benefit) => (
                        <div className="group rounded-2xl border border-slate-200 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md">
                            <div key={benefit.number} className="flex gap-5">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm font-semibold text-indigo-600">
                                    {benefit.number}
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">
                                        {benefit.title}
                                    </h3>

                                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                                        {benefit.description}
                                    </p>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}

export default WhyChooseUs;