"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomerProfile,
  updateCustomerProfile,
} from "@/store/thunks/customerProfileThunks";
import {
  clearCustomerProfileError,
  clearCustomerProfileMessage,
} from "@/store/slices/customerProfileSlice";

export default function ProfileAccountPage() {
  const dispatch = useDispatch();

  const customerProfileState = useSelector(
    (state) => state.customerProfile || {}
  );

  const {
    customer = null,
    loading = false,
    error = null,
    successMessage = null,
  } = customerProfileState;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    dispatch(fetchCustomerProfile());

    return () => {
      dispatch(clearCustomerProfileError());
      dispatch(clearCustomerProfileMessage());
    };
  }, [dispatch]);

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
      });
    } else {
      setForm({
        name: "",
        email: "",
        phone: "",
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(updateCustomerProfile(form));
  };

  const isUnauthorized =
    typeof error === "string" &&
    (error.toLowerCase().includes("unauthorized") ||
      error.toLowerCase().includes("401"));

  const hasCustomer = !!customer;
  const showTopError = error && !isUnauthorized;

  const helperText = useMemo(() => {
    if (hasCustomer) {
      return "Update your account information here.";
    }
    return "Login first to load your saved details. If not logged in, the fields will stay blank.";
  }, [hasCustomer]);

  return (
    <section className="rounded-[22px] border border-white/10 bg-[#111] p-4 text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:rounded-[26px] sm:p-5 md:rounded-[30px] md:p-6 lg:p-7">
      <div className="mb-7 sm:mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
              My Account
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/60 md:text-base">
              {helperText}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {hasCustomer ? (
              <span className="inline-flex w-fit rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-300">
                Logged In
              </span>
            ) : (
              <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70">
                Guest
              </span>
            )}

            <Link
              href="/auth?redirect=/profile/account"
              className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
            >
              Sign Up / Login
            </Link>
          </div>
        </div>
      </div>

      {!hasCustomer && (
        <div className="mb-5 rounded-[20px] border border-yellow-500/20 bg-yellow-500/10 p-4 sm:rounded-[22px]">
          <p className="text-sm font-medium text-yellow-200">
            You are not logged in.
          </p>
          <p className="mt-1 text-sm leading-6 text-yellow-100/75">
            If you log in, your saved account details will appear automatically.
            Otherwise, you can fill the form manually.
          </p>
        </div>
      )}

      {showTopError && (
        <div className="mb-5 rounded-[20px] border border-red-500/20 bg-red-500/10 p-4 sm:rounded-[22px]">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-5 rounded-[20px] border border-green-500/20 bg-green-500/10 p-4 sm:rounded-[22px]">
          <p className="text-sm text-green-300">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-5 md:max-w-3xl md:gap-6">
        <div className="rounded-[20px] border border-white/10 bg-black p-4 shadow-[0_12px_35px_rgba(0,0,0,0.25)] sm:rounded-[22px] sm:p-5 md:rounded-[24px]">
          <div>
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Profile Details
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Keep your basic details up to date for a smoother ordering
              experience.
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:mt-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/85">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-red-500 sm:text-base"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/85">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-red-500 sm:text-base"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/85">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-red-500 sm:text-base"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-red-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

          <Link
            href="/auth?redirect=/profile/account"
            className="rounded-2xl border border-white/10 bg-black px-6 py-3.5 text-sm font-semibold text-white transition hover:border-red-500 hover:text-red-400 sm:text-base"
          >
            Sign Up / Login
          </Link>
        </div>
      </form>
    </section>
  );
}