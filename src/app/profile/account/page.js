"use client";

import { useEffect, useState } from "react";
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

  return (
    <section className="rounded-[30px] border border-white/10 bg-[#111] p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-7">
      <div className="mb-8">
        <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl">
          My Account
        </h1>
        <p className="mt-2 text-sm leading-6 text-white/60 md:text-base">
          Update your account information here.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-[22px] border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-5 rounded-[22px] border border-green-500/20 bg-green-500/10 p-4">
          <p className="text-sm text-green-300">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 md:max-w-3xl">
        <div className="rounded-[24px] border border-white/10 bg-black p-5 shadow-[0_12px_35px_rgba(0,0,0,0.25)]">
          <h2 className="text-2xl font-bold text-white">Profile Details</h2>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Keep your basic details up to date for a smoother ordering
            experience.
          </p>

          <div className="mt-6 grid gap-4">
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
                className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-red-500"
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
                className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-red-500"
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
                className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-red-500"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-red-600 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );
}