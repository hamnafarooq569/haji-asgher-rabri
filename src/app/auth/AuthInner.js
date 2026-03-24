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
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-[#111] p-6 shadow-xl">
        <h1 className="text-3xl font-bold">Your Account</h1>
        <p className="mt-2 text-sm text-white/60">
          Enter your details to continue with OTP verification.
        </p>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        {successMessage && (
          <p className="mt-4 text-sm text-green-400">{successMessage}</p>
        )}

        <form onSubmit={handleContinue} className="mt-6 space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full rounded-xl border border-white/10 bg-black px-4 py-3"
            required
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="w-full rounded-xl border border-white/10 bg-black px-4 py-3"
            required
          />

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full rounded-xl border border-white/10 bg-black px-4 py-3"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-red-600 px-4 py-3"
          >
            {loading ? "Sending OTP..." : "Continue"}
          </button>
        </form>
      </div>
    </main>
  );
}