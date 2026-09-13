import { useNavigate } from "react-router-dom";

function GetReady() {
    const redirect = useNavigate();

    const handleNavigate = () => {
        redirect('/user/dashboard')
    }

    return (
        <section className="bg-white px-6 py-1">
            <div className="mx-auto max-w-10xl">
                <div className="rounded-2xl bg-indigo-50 px-6 py-10 text-center sm:px-10">

                    <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                        Ready to start your
                        <span className="text-indigo-600"> preparation?</span>
                    </h2>

                    <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
                        Practice smarter, improve your skills, and prepare
                        confidently for your next aptitude test.
                    </p>

                    
                    <button onClick={handleNavigate} className=" mt-6 rounded-lg cursor-pointer bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
                        Start Practicing
                    </button>

                </div>
            </div>
        </section>
    );
}

export default GetReady;