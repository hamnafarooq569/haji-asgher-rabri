"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  resendCustomerOtp,
  verifyCustomerOtp,
} from "@/store/thunks/customerAuthThunks";

export default function VerifyInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const email = searchParams.get("email") || "";
  const name = searchParams.get("name") || "";
  const phone = searchParams.get("phone") || "";
  const redirectTo = searchParams.get("redirect") || "/checkout";

  const { loading, error, successMessage } = useSelector(
    (state) => state.customerAuth
  );

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);

  const maskedEmail = useMemo(() => {
    if (!email) return "";
    const [user, domain] = email.split("@");
    if (!domain) return email;
    const safeUser =
      user.length <= 2
        ? user[0] + "*"
        : user.slice(0, 2) + "*".repeat(Math.max(user.length - 2, 2));
    return `${safeUser}@${domain}`;
  }, [email]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 6) return;

    const resultAction = await dispatch(
      verifyCustomerOtp({
        email,
        otp: otpCode,
        name,
        phone,
      })
    );

    if (verifyCustomerOtp.fulfilled.match(resultAction)) {
      router.push(redirectTo);
    }
  };

  const handleResend = async () => {
    await dispatch(resendCustomerOtp({ email, name, phone }));
  };

  return (
    <main className="min-h-screen bg-black px-3 py-6 text-white sm:px-4 sm:py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-xl rounded-[22px] border border-white/10 bg-[#111] p-4 shadow-xl sm:rounded-[24px] sm:p-5 md:rounded-[26px] md:p-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Verify Your Email</h1>

        <p className="mt-2 text-sm leading-6 text-white/60">
          We have sent a 6-digit code to {maskedEmail || "your email"}.
        </p>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 rounded-2xl border border-green-500/20 bg-green-500/10 p-3">
            <p className="text-sm text-green-400">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleVerify} className="mt-6 sm:mt-8">
          <div className="grid grid-cols-6 gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="h-12 w-full rounded-xl border border-white/10 bg-black text-center text-lg text-white outline-none transition focus:border-red-500 sm:h-14 sm:text-xl"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-2xl bg-red-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-8 sm:text-base"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="mt-3 w-full rounded-2xl border border-white/10 bg-black px-4 py-3.5 text-sm font-semibold text-white transition hover:border-red-500 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
          >
            Resend OTP
          </button>
        </form>
      </div>
    </main>
  );
}