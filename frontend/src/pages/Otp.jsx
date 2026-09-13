import axios from "axios";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"

function OTP() {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const location = useLocation()
    const email = location.state?.email;

    const navigate = useNavigate();

    const handleChange = (value, index) => {
        if (!/^\d?$/.test(value)) return;


        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const [timeLeft, setTimeLeft] = useState(300);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const verifyOTP = async () => {
        try {
            const response = await axios.post(
                "http://localhost:8000/login/verify-otp",
                {
                    email,
                    otp: otp.join(""),
                }
            );

            // console.log(otp.join(""))
            // console.log(response.data);

            localStorage.setItem("token", response.data["access_token"]);
            localStorage.setItem("token_type", response.data["token_type"]);
            localStorage.setItem("isUserLogin", "true");

            navigate("/user/dashboard");


        } catch (error) {
            console.log("STATUS:", error.response?.status);
            console.log("ERROR:", error.response?.data);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">

                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-600">
                        ✉
                    </div>

                    <h1 className="mt-5 text-2xl font-bold text-slate-900">
                        Verify your email
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        We've sent a 6-digit verification code to
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                        {email}
                    </p>
                </div>

                {/* OTP Inputs */}
                <div className="mt-8 flex justify-center gap-2 sm:gap-3">
                    {otp.map((digit, index) => (
                        <input key={index} id={`otp-${index}`} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handleChange(e.target.value, index)} className="h-12 w-11 rounded-lg border border-slate-200 bg-white text-center text-lg font-semibold text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:h-14 sm:w-12" />
                    ))}
                </div>

                {/* Timer */}
                <div className="mt-5 text-center text-sm text-slate-500">
                    {timeLeft > 0 ? (
                        <>
                            Code expires in{" "}
                            <span className="font-semibold text-indigo-600">
                                {String(minutes).padStart(2, "0")}:
                                {String(seconds).padStart(2, "0")}
                            </span>
                        </>
                    ) : (
                        <span className="font-semibold text-red-500">
                            OTP expired
                        </span>
                    )}
                </div>

                {/* Verify Button */}
                <button onClick={verifyOTP} className="cursor-pointer mt-7 w-full rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
                    Verify OTP
                </button>

                {/* Resend */}
                <p className="mt-5 text-center text-sm text-slate-500">
                    Didn't receive the code?{" "}
                    <button className="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-700">
                        Resend OTP
                    </button>
                </p>

                {/* Back */}
                <div className="mt-6 border-t border-slate-100 pt-5 text-center">
                    <Link to="/login" className="text-sm font-medium text-slate-500 transition hover:text-indigo-600">
                        ← Back to login
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default OTP;