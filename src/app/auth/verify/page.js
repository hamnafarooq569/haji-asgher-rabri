"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  resendCustomerOtp,
  verifyCustomerOtp,
} from "@/store/thunks/customerAuthThunks";

export default function VerifyOtpPage() {
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
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-[#111] p-6 shadow-xl">
        <h1 className="text-3xl font-bold">Verify Your Email</h1>
        <p className="mt-2 text-sm text-white/60">
          We have sent a 6-digit code to {maskedEmail || "your email"}.
        </p>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        {successMessage && (
          <p className="mt-4 text-sm text-green-400">{successMessage}</p>
        )}

        <form onSubmit={handleVerify} className="mt-8">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
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
                className="h-14 w-12 rounded-xl border border-white/10 bg-black text-center text-xl outline-none sm:h-16 sm:w-14"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-xl bg-red-600 px-4 py-3 font-semibold disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="mt-3 w-full rounded-xl border border-white/10 bg-black px-4 py-3 font-semibold text-white/80 disabled:opacity-60"
          >
            Resend OTP
          </button>
        </form>
      </div>
    </main>
  );
}