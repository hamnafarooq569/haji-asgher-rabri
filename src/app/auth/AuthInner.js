"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { startCustomerAuth } from "@/store/thunks/customerAuthThunks";
import {
  clearCustomerAuthError,
  setAuthDraft,
} from "@/store/slices/customerAuthSlice";

export default function AuthInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const redirectTo = searchParams.get("redirect") || "/checkout";

  const { loading, error, successMessage } = useSelector(
    (state) => state.customerAuth
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    return () => {
      dispatch(clearCustomerAuthError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContinue = async (e) => {
    e.preventDefault();

    dispatch(setAuthDraft(form));

    const resultAction = await dispatch(startCustomerAuth(form));

    if (startCustomerAuth.fulfilled.match(resultAction)) {
      const query = new URLSearchParams({
        email: form.email,
        name: form.name,
        phone: form.phone,
        redirect: redirectTo,
      }).toString();

      router.push(`/auth/verify?${query}`);
    }
  };

  return (
    <main className="min-h-screen bg-black px-3 py-6 text-white sm:px-4 sm:py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-xl rounded-[22px] border border-white/10 bg-[#111] p-4 shadow-xl sm:rounded-[24px] sm:p-5 md:rounded-[26px] md:p-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Your Account</h1>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Enter your details to continue with OTP verification.
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

        <form onSubmit={handleContinue} className="mt-5 space-y-4 sm:mt-6">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-red-500 sm:text-base"
            required
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-red-500 sm:text-base"
            required
          />

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-red-500 sm:text-base"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-red-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
          >
            {loading ? "Sending OTP..." : "Continue"}
          </button>
        </form>
      </div>
    </main>
  );
}