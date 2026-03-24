"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { placeCustomerOrder } from "@/store/thunks/customerCheckoutThunks";
import {
  clearCustomerCheckoutError,
  clearPlacedOrder,
} from "@/store/slices/customerCheckoutSlice";
import { clearCart, hydrateCartFromStorage } from "@/store/slices/cartSlice";

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const customerCheckoutState = useSelector(
    (state) => state.customerCheckout || {}
  );
  const { loading: placingOrder = false, error: checkoutError = null } =
    customerCheckoutState;

  const cartState = useSelector((state) => state.cart || {});
  const { items = [], subtotal = 0, totalQuantity = 0 } = cartState;

  const customerAuthState = useSelector((state) => state.customerAuth || {});
  const { customer = null, isAuthenticated = false } = customerAuthState;

  const [mounted, setMounted] = useState(false);

  const [activeMode, setActiveMode] = useState("login"); // login | signup | guest
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [form, setForm] = useState({
    customerName: "",
    mobile: "",
    altMobile: "",
    email: "",
    fulfillmentType: "DELIVERY",
    nearestLandmark: "",
    deliveryAddress: "",
    deliveryNotes: "",
    paymentMethod: "CASH",
  });

  useEffect(() => {
    dispatch(hydrateCartFromStorage());
    dispatch(clearCustomerCheckoutError());
    dispatch(clearPlacedOrder());

    setLoginForm({
      email: "",
      password: "",
    });

    setSignupForm({
      name: "",
      email: "",
      phone: "",
      password: "",
    });

    setMounted(true);
  }, [dispatch]);

  useEffect(() => {
    if (customer) {
      setForm((prev) => ({
        ...prev,
        customerName: customer.name || "",
        mobile: customer.phone || "",
        altMobile: customer.altPhone || "",
        email: customer.email || "",
        nearestLandmark: customer.nearestLandmark || "",
        deliveryAddress: customer.deliveryAddress || "",
        deliveryNotes: customer.deliveryNotes || "",
      }));
    }
  }, [customer]);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGuestChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentChange = (value) => {
    setForm((prev) => ({
      ...prev,
      paymentMethod: value,
    }));
  };

  const handleFulfillmentChange = (value) => {
    setForm((prev) => ({
      ...prev,
      fulfillmentType: value,
      nearestLandmark: value === "PICKUP" ? "" : prev.nearestLandmark,
      deliveryAddress: value === "PICKUP" ? "" : prev.deliveryAddress,
      deliveryNotes: value === "PICKUP" ? "" : prev.deliveryNotes,
    }));
  };

  const fetchLoggedInCustomer = async () => {
    try {
      const res = await fetch("/api/customer/me", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) return null;

      const data = await res.json();
      return data?.customer || null;
    } catch {
      return null;
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setLoginLoading(true);

    try {
      const res = await fetch("/api/customer/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data?.message || "Login failed.");
        return;
      }

      setAuthSuccess(data?.message || "Login successful.");

      const currentCustomer = data?.customer || (await fetchLoggedInCustomer());

      if (currentCustomer) {
        setForm((prev) => ({
          ...prev,
          customerName: currentCustomer.name || "",
          mobile: currentCustomer.phone || "",
          altMobile: currentCustomer.altPhone || "",
          email: currentCustomer.email || "",
          nearestLandmark: currentCustomer.nearestLandmark || "",
          deliveryAddress: currentCustomer.deliveryAddress || "",
          deliveryNotes: currentCustomer.deliveryNotes || "",
        }));
      }

      setActiveMode("guest");
    } catch (error) {
      setAuthError("Failed to login.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setSignupLoading(true);

    try {
      const res = await fetch("/api/customer/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(signupForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data?.message || "Signup failed.");
        return;
      }

      setAuthSuccess(data?.message || "Account created successfully.");

      const currentCustomer = data?.customer || (await fetchLoggedInCustomer());

      if (currentCustomer) {
        setForm((prev) => ({
          ...prev,
          customerName: currentCustomer.name || "",
          mobile: currentCustomer.phone || signupForm.phone || "",
          altMobile: currentCustomer.altPhone || "",
          email: currentCustomer.email || "",
          nearestLandmark: currentCustomer.nearestLandmark || "",
          deliveryAddress: currentCustomer.deliveryAddress || "",
          deliveryNotes: currentCustomer.deliveryNotes || "",
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          customerName: signupForm.name,
          mobile: signupForm.phone,
          email: signupForm.email,
        }));
      }

      setActiveMode("guest");
    } catch (error) {
      setAuthError("Failed to sign up.");
    } finally {
      setSignupLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (items.length === 0) return;

    if (!form.customerName.trim() || !form.mobile.trim()) {
      setAuthError("Full name and phone are required.");
      return;
    }

    if (
      form.fulfillmentType === "DELIVERY" &&
      !form.deliveryAddress.trim()
    ) {
      setAuthError("Delivery address is required for delivery orders.");
      return;
    }

    const payload = {
      customerName: form.customerName,
      mobile: form.mobile,
      altMobile: form.altMobile,
      email: form.email,
      fulfillmentType: form.fulfillmentType,
      nearestLandmark:
        form.fulfillmentType === "DELIVERY" ? form.nearestLandmark : "",
      deliveryAddress:
        form.fulfillmentType === "DELIVERY" ? form.deliveryAddress : "",
      deliveryNotes:
        form.fulfillmentType === "DELIVERY" ? form.deliveryNotes : "",
      paymentMethod: form.paymentMethod,
      items: items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
        addonIds: item.addonIds || [],
      })),
    };

    const resultAction = await dispatch(placeCustomerOrder(payload));

    if (placeCustomerOrder.fulfilled.match(resultAction)) {
      const order = resultAction.payload?.order;
      const orderNumber = order?.orderNumber;

      if (order) {
        sessionStorage.setItem("lastPlacedOrder", JSON.stringify(order));
      }

      dispatch(clearCart());
      router.push(`/thank-you?orderNumber=${orderNumber}`);
    }
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-10 text-white md:px-6 md:py-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Checkout
          </h1>
          <p className="mt-2 text-sm text-white/60 md:text-base">
            Loading checkout...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-10 text-white md:px-6 md:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Checkout
          </h1>
          <p className="mt-2 text-sm text-white/60 md:text-base">
            Complete your order details and continue securely.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="rounded-[28px] border border-white/10 bg-[#111] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-6">
              {!isAuthenticated && (
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode("login");
                      setAuthError("");
                      setAuthSuccess("");
                      setLoginForm({ email: "", password: "" });
                    }}
                    className={`rounded-2xl px-5 py-3.5 text-base font-semibold transition ${
                      activeMode === "login"
                        ? "bg-red-600 text-white"
                        : "border border-white/10 bg-black text-white hover:border-red-500"
                    }`}
                  >
                    Login
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode("signup");
                      setAuthError("");
                      setAuthSuccess("");
                      setSignupForm({
                        name: "",
                        email: "",
                        phone: "",
                        password: "",
                      });
                    }}
                    className={`rounded-2xl px-5 py-3.5 text-base font-semibold transition ${
                      activeMode === "signup"
                        ? "bg-red-600 text-white"
                        : "border border-white/10 bg-black text-white hover:border-red-500"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {authError && (
                <p className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {authError}
                </p>
              )}

              {authSuccess && (
                <p className="mb-4 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                  {authSuccess}
                </p>
              )}

              {!isAuthenticated && activeMode === "login" && (
                <div className="space-y-6">
                  <div className="rounded-[22px] border border-white/10 bg-black p-6 shadow-[0_12px_35px_rgba(0,0,0,0.25)]">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-white">Login</h2>
                      <button
                        type="button"
                        onClick={() => setActiveMode("guest")}
                        className="text-sm text-white/60 transition hover:text-white"
                      >
                        Order as Guest
                      </button>
                    </div>

                    <form
                      onSubmit={handleLoginSubmit}
                      className="space-y-4"
                      autoComplete="off"
                    >
                      <input
                        type="text"
                        name="fake_username"
                        autoComplete="username"
                        className="hidden"
                        tabIndex={-1}
                      />

                      <input
                        type="password"
                        name="fake_password"
                        autoComplete="new-password"
                        className="hidden"
                        tabIndex={-1}
                      />

                      <input
                        name="email"
                        type="email"
                        value={loginForm.email}
                        onChange={handleLoginChange}
                        autoComplete="off"
                        className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-red-500"
                        placeholder="Enter your email"
                      />

                      <input
                        name="password"
                        type="password"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        autoComplete="new-password"
                        className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-red-500"
                        placeholder="Enter your password"
                      />

                      <button
                        type="submit"
                        disabled={loginLoading}
                        className="w-full rounded-2xl bg-red-600 px-5 py-3.5 text-base font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loginLoading ? "Logging In..." : "Login"}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {!isAuthenticated && activeMode === "signup" && (
                <div className="space-y-6">
                  <div className="rounded-[22px] border border-white/10 bg-black p-6 shadow-[0_12px_35px_rgba(0,0,0,0.25)]">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-white">Sign Up</h2>
                      <button
                        type="button"
                        onClick={() => setActiveMode("guest")}
                        className="text-sm text-white/60 transition hover:text-white"
                      >
                        Order as Guest
                      </button>
                    </div>

                    <form
                      onSubmit={handleSignupSubmit}
                      className="space-y-4"
                      autoComplete="off"
                    >
                      <input
                        name="name"
                        value={signupForm.name}
                        onChange={handleSignupChange}
                        autoComplete="off"
                        className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-red-500"
                        placeholder="Enter your full name"
                      />

                      <input
                        name="email"
                        type="email"
                        value={signupForm.email}
                        onChange={handleSignupChange}
                        autoComplete="off"
                        className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-red-500"
                        placeholder="Enter your email"
                      />

                      <input
                        name="phone"
                        value={signupForm.phone}
                        onChange={handleSignupChange}
                        autoComplete="off"
                        className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-red-500"
                        placeholder="Enter your phone number"
                      />

                      <input
                        name="password"
                        type="password"
                        value={signupForm.password}
                        onChange={handleSignupChange}
                        autoComplete="new-password"
                        className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-red-500"
                        placeholder="Create a password"
                      />

                      <button
                        type="submit"
                        disabled={signupLoading}
                        className="w-full rounded-2xl bg-red-600 px-5 py-3.5 text-base font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {signupLoading ? "Signing Up..." : "Sign Up"}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {(isAuthenticated || activeMode === "guest") && (
                <form onSubmit={handlePlaceOrder} className="space-y-6" autoComplete="off">
                  <div className="rounded-[22px] border border-white/10 bg-black p-6 shadow-[0_12px_35px_rgba(0,0,0,0.25)]">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-white">
                        {isAuthenticated ? "Your Details" : "Order as Guest"}
                      </h2>

                      {!isAuthenticated && (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setActiveMode("login")}
                            className="text-sm text-white/60 transition hover:text-white"
                          >
                            Login
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveMode("signup")}
                            className="text-sm text-white/60 transition hover:text-white"
                          >
                            Sign Up
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="mb-5 text-sm text-white/60">
                      {isAuthenticated
                        ? "Confirm your order details before placing the order."
                        : "Continue without creating an account and place your order as guest."}
                    </p>

                    {checkoutError && (
                      <p className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {checkoutError}
                      </p>
                    )}

                    <div className="grid gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-white/85">
                          Full Name
                        </label>
                        <input
                          name="customerName"
                          value={form.customerName}
                          onChange={handleGuestChange}
                          autoComplete="name"
                          className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-red-500"
                          placeholder="Enter full name"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-white/85">
                          Phone
                        </label>
                        <input
                          name="mobile"
                          value={form.mobile}
                          onChange={handleGuestChange}
                          autoComplete="tel"
                          className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-red-500"
                          placeholder="Enter phone number"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-white/85">
                          Alt Phone
                        </label>
                        <input
                          name="altMobile"
                          value={form.altMobile}
                          onChange={handleGuestChange}
                          autoComplete="off"
                          className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-red-500"
                          placeholder="Enter alternate phone number"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-white/85">
                          Email Address
                        </label>
                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleGuestChange}
                          autoComplete="email"
                          className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-red-500"
                          placeholder="Enter email address"
                        />
                      </div>

                      <div>
                        <label className="mb-3 block text-sm font-medium text-white/85">
                          Order Type
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => handleFulfillmentChange("PICKUP")}
                            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                              form.fulfillmentType === "PICKUP"
                                ? "border-red-500 bg-red-600 text-white"
                                : "border-white/10 bg-[#111] text-white hover:border-red-500"
                            }`}
                          >
                            Pickup
                          </button>

                          <button
                            type="button"
                            onClick={() => handleFulfillmentChange("DELIVERY")}
                            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                              form.fulfillmentType === "DELIVERY"
                                ? "border-red-500 bg-red-600 text-white"
                                : "border-white/10 bg-[#111] text-white hover:border-red-500"
                            }`}
                          >
                            Delivery
                          </button>
                        </div>
                      </div>

                      {form.fulfillmentType === "DELIVERY" && (
                        <>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-white/85">
                              Nearest Landmark
                            </label>
                            <input
                              name="nearestLandmark"
                              value={form.nearestLandmark}
                              onChange={handleGuestChange}
                              autoComplete="off"
                              className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-red-500"
                              placeholder="Enter nearest landmark"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-white/85">
                              Delivery Address
                            </label>
                            <textarea
                              name="deliveryAddress"
                              value={form.deliveryAddress}
                              onChange={handleGuestChange}
                              autoComplete="street-address"
                              className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-red-500"
                              placeholder="Enter full delivery address"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-white/85">
                              Special Instructions
                            </label>
                            <textarea
                              name="deliveryNotes"
                              value={form.deliveryNotes}
                              onChange={handleGuestChange}
                              autoComplete="off"
                              className="min-h-[130px] w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-red-500"
                              placeholder="Type special instructions here..."
                            />
                          </div>
                        </>
                      )}

                      {form.fulfillmentType === "PICKUP" && (
                        <div className="rounded-2xl border border-white/10 bg-[#111] px-4 py-4 text-sm text-white/65">
                          You selected{" "}
                          <span className="font-semibold text-white">Pickup</span>.
                          No delivery address is required.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-white/10 bg-black p-6 shadow-[0_12px_35px_rgba(0,0,0,0.25)]">
                    <h2 className="text-2xl font-bold text-white">Payment</h2>
                    <p className="mt-2 text-sm text-white/60">
                      Select your preferred payment method.
                    </p>

                    <div className="mt-5 space-y-3">
                      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-[#111] px-4 py-4 transition hover:border-red-500">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={form.paymentMethod === "CASH"}
                          onChange={() => handlePaymentChange("CASH")}
                        />
                        <span className="font-medium text-white">Cash</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={placingOrder || items.length === 0}
                    className="w-full rounded-2xl bg-red-600 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {placingOrder ? "Placing Order..." : "Place Your Order"}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#111] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] lg:sticky lg:top-8">
            <h2 className="text-2xl font-bold text-white">Order Summary</h2>

            <div className="mt-5 space-y-4 text-sm text-white/65">
              {items.length === 0 && <p>Your cart is empty.</p>}

              <div className="rounded-2xl border border-white/10 bg-black p-4">
                <div className="flex items-center justify-between">
                  <span>Order Type</span>
                  <span className="font-semibold text-white">
                    {form.fulfillmentType === "PICKUP" ? "Pickup" : "Delivery"}
                  </span>
                </div>
              </div>

              {items.map((item) => (
                <div
                  key={item.cartKey}
                  className="rounded-2xl border border-white/10 bg-black p-4"
                >
                  <div className="flex justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-white">
                        {item.productName}
                      </p>

                      {item.variantName && (
                        <p className="mt-1 text-sm text-white/55">
                          Variant: {item.variantName}
                        </p>
                      )}

                      {item.addons?.length > 0 && (
                        <p className="mt-1 text-xs leading-5 text-white/45">
                          Addons: {item.addons.map((addon) => addon.name).join(", ")}
                        </p>
                      )}

                      <p className="mt-1 text-xs text-white/50">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-white">
                        Rs. {item.lineTotal}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                  <span>Total Items</span>
                  <span className="font-medium text-white">{totalQuantity}</span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-white">Rs. {subtotal}</span>
                </div>

                <div className="mt-4 flex items-center justify-between text-lg font-semibold text-white">
                  <span>Total</span>
                  <span>Rs. {subtotal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}