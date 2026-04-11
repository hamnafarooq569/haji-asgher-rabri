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

const OWNER_NUMBER = "923452459002";

function createWhatsAppLink(order) {
  let message = `🧾 *New Order Received*\n\n`;

  message += `👤 *Customer Details*\n`;
  message += `Name: ${order.customerName || "-"}\n`;
  message += `Phone: ${order.mobile || "-"}\n`;

  if (order.altMobile) message += `Alt Phone: ${order.altMobile}\n`;
  if (order.email) message += `Email: ${order.email}\n`;

  message += `Type: ${
    order.fulfillmentType === "PICKUP" ? "PICKUP" : "DELIVERY"
  }\n`;

  if (order.nearestLandmark)
    message += `Nearest Landmark: ${order.nearestLandmark}\n`;

  if (order.deliveryAddress)
    message += `Address: ${order.deliveryAddress}\n`;

  if (order.deliveryNotes)
    message += `Notes: ${order.deliveryNotes}\n`;

  message += `Payment: ${order.paymentMethod}\n`;
  message += `Order No: ${order.orderNumber}\n`;

  message += `\n🛒 *Order Items*\n`;

  (order.items || []).forEach((item, index) => {
    const productName = item.product?.name || "Product";
    const variantName = item.variant?.name || "";

    const addonNames =
      item.addons?.map((a) => a.addonNameSnapshot).filter(Boolean) || [];

    message += `\n${index + 1}. ${productName}\n`;
    message += `   Qty: ${item.quantity}\n`;

    if (variantName) message += `   Variant: ${variantName}\n`;
    if (addonNames.length)
      message += `   Addons: ${addonNames.join(", ")}\n`;

    message += `   Price: Rs ${item.lineTotal}\n`;
  });

  message += `\n💰 *Total: Rs ${order.totalAmount}*`;

  return `https://wa.me/${OWNER_NUMBER}?text=${encodeURIComponent(message)}`;
}

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

  const [activeMode, setActiveMode] = useState(null); // null | login | signup
  const [customerFormOpen, setCustomerFormOpen] = useState(false);

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

  const [guestForm, setGuestForm] = useState({
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

  const [customerOrderForm, setCustomerOrderForm] = useState({
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

  const showLoginForm = activeMode === "login";
  const showSignupForm = activeMode === "signup";
  const isCustomerForm = isAuthenticated || customerFormOpen;

  useEffect(() => {
    dispatch(hydrateCartFromStorage());
    dispatch(clearCustomerCheckoutError());
    dispatch(clearPlacedOrder());
    setMounted(true);
  }, [dispatch]);

  useEffect(() => {
    if (customer) {
      setCustomerOrderForm((prev) => ({
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

  useEffect(() => {
    if (isAuthenticated) {
      setCustomerFormOpen(true);
      setActiveMode(null);
    }
  }, [isAuthenticated]);

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
    setGuestForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCustomerOrderChange = (e) => {
    const { name, value } = e.target;
    setCustomerOrderForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGuestFulfillmentChange = (value) => {
    setGuestForm((prev) => ({
      ...prev,
      fulfillmentType: value,
      nearestLandmark: value === "PICKUP" ? "" : prev.nearestLandmark,
      deliveryAddress: value === "PICKUP" ? "" : prev.deliveryAddress,
      deliveryNotes: value === "PICKUP" ? "" : prev.deliveryNotes,
    }));
  };

  const handleCustomerFulfillmentChange = (value) => {
    setCustomerOrderForm((prev) => ({
      ...prev,
      fulfillmentType: value,
      nearestLandmark: value === "PICKUP" ? "" : prev.nearestLandmark,
      deliveryAddress: value === "PICKUP" ? "" : prev.deliveryAddress,
      deliveryNotes: value === "PICKUP" ? "" : prev.deliveryNotes,
    }));
  };

  const handleGuestPaymentChange = (value) => {
    setGuestForm((prev) => ({
      ...prev,
      paymentMethod: value,
    }));
  };

  const handleCustomerPaymentChange = (value) => {
    setCustomerOrderForm((prev) => ({
      ...prev,
      paymentMethod: value,
    }));
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
        setCustomerOrderForm((prev) => ({
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

      setCustomerFormOpen(true);
      setActiveMode(null);
    } catch {
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
        setCustomerOrderForm((prev) => ({
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
        setCustomerOrderForm((prev) => ({
          ...prev,
          customerName: signupForm.name,
          mobile: signupForm.phone,
          email: signupForm.email,
        }));
      }

      setCustomerFormOpen(true);
      setActiveMode(null);
    } catch {
      setAuthError("Failed to sign up.");
    } finally {
      setSignupLoading(false);
    }
  };

  const submitOrder = async (formData) => {
    setAuthError("");
    setAuthSuccess("");

    if (items.length === 0) return;

    if (!formData.customerName.trim() || !formData.mobile.trim()) {
      setAuthError("Full name and phone are required.");
      return;
    }

    if (
      formData.fulfillmentType === "DELIVERY" &&
      !formData.deliveryAddress.trim()
    ) {
      setAuthError("Delivery address is required for delivery orders.");
      return;
    }

    const payload = {
      customerName: formData.customerName.trim(),
      mobile: formData.mobile.trim(),
      altMobile: formData.altMobile?.trim() || "",
      email: formData.email?.trim() || "",
      fulfillmentType: formData.fulfillmentType,
      nearestLandmark:
        formData.fulfillmentType === "DELIVERY"
          ? formData.nearestLandmark?.trim() || ""
          : "",
      deliveryAddress:
        formData.fulfillmentType === "DELIVERY"
          ? formData.deliveryAddress?.trim() || ""
          : "",
      deliveryNotes:
        formData.fulfillmentType === "DELIVERY"
          ? formData.deliveryNotes?.trim() || ""
          : "",
      paymentMethod: formData.paymentMethod,
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

    if (order) {
      sessionStorage.setItem("lastPlacedOrder", JSON.stringify(order));
      dispatch(clearCart());

      const whatsappUrl = createWhatsAppLink(order);

      // WhatsApp open karo
      window.open(whatsappUrl, "_blank");

      // optional: thank-you bhi dikhao
      router.push("/thank-you");

      return;
    }
    }
  };

  const handleGuestOrderSubmit = async (e) => {
    e.preventDefault();
    await submitOrder(guestForm);
  };

  const handleCustomerOrderSubmit = async (e) => {
    e.preventDefault();
    await submitOrder(customerOrderForm);
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#050505] px-3 py-6 text-white sm:px-4 sm:py-8 md:px-6 md:py-10">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            Checkout
          </h1>
          <p className="mt-2 text-sm text-white/60 sm:text-base">
            Loading checkout...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-3 py-6 text-white sm:px-4 sm:py-8 md:px-6 md:py-10 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 sm:mb-8 md:mb-10">
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            Checkout
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/60 sm:text-base">
            Complete your order details and continue securely.
          </p>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_390px]">
          <div>
            <div className="rounded-[22px] border border-white/10 bg-[#111] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:rounded-[26px] sm:p-4 md:p-5 lg:rounded-[28px] lg:p-6">
              {!isCustomerForm && (
                <div className="mb-5 grid grid-cols-2 gap-3 sm:mb-6 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode("login");
                      setCustomerFormOpen(false);
                      setAuthError("");
                      setAuthSuccess("");
                      setLoginForm({ email: "", password: "" });
                    }}
                    className={`rounded-2xl px-3 py-3 text-sm font-semibold transition sm:px-5 sm:py-3.5 sm:text-base ${
                      showLoginForm
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
                      setCustomerFormOpen(false);
                      setAuthError("");
                      setAuthSuccess("");
                      setSignupForm({
                        name: "",
                        email: "",
                        phone: "",
                        password: "",
                      });
                    }}
                    className={`rounded-2xl px-3 py-3 text-sm font-semibold transition sm:px-5 sm:py-3.5 sm:text-base ${
                      showSignupForm
                        ? "bg-red-600 text-white"
                        : "border border-white/10 bg-black text-white hover:border-red-500"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {showLoginForm && !isCustomerForm && (
                <div className="mb-5 rounded-[18px] border border-white/10 bg-black p-4 shadow-[0_12px_35px_rgba(0,0,0,0.25)] sm:mb-6 sm:rounded-[22px] sm:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-xl font-bold text-white sm:text-2xl">
                      Login
                    </h2>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveMode(null);
                        setAuthError("");
                        setAuthSuccess("");
                      }}
                      className="text-xs font-medium text-white/60 transition hover:text-white sm:text-sm"
                    >
                      Back
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
                      className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-red-500 sm:text-base"
                      placeholder="Enter your email"
                    />

                    <input
                      name="password"
                      type="password"
                      value={loginForm.password}
                      onChange={handleLoginChange}
                      autoComplete="new-password"
                      className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-red-500 sm:text-base"
                      placeholder="Enter your password"
                    />

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full rounded-2xl bg-red-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                    >
                      {loginLoading ? "Logging In..." : "Login"}
                    </button>
                  </form>
                </div>
              )}

              {showSignupForm && !isCustomerForm && (
                <div className="mb-5 rounded-[18px] border border-white/10 bg-black p-4 shadow-[0_12px_35px_rgba(0,0,0,0.25)] sm:mb-6 sm:rounded-[22px] sm:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-xl font-bold text-white sm:text-2xl">
                      Sign Up
                    </h2>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveMode(null);
                        setAuthError("");
                        setAuthSuccess("");
                      }}
                      className="text-xs font-medium text-white/60 transition hover:text-white sm:text-sm"
                    >
                      Back
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
                      className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-red-500 sm:text-base"
                      placeholder="Enter your full name"
                    />

                    <input
                      name="email"
                      type="email"
                      value={signupForm.email}
                      onChange={handleSignupChange}
                      autoComplete="off"
                      className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-red-500 sm:text-base"
                      placeholder="Enter your email"
                    />

                    <input
                      name="phone"
                      value={signupForm.phone}
                      onChange={handleSignupChange}
                      autoComplete="off"
                      className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-red-500 sm:text-base"
                      placeholder="Enter your phone number"
                    />

                    <input
                      name="password"
                      type="password"
                      value={signupForm.password}
                      onChange={handleSignupChange}
                      autoComplete="new-password"
                      className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-red-500 sm:text-base"
                      placeholder="Create a password"
                    />

                    <button
                      type="submit"
                      disabled={signupLoading}
                      className="w-full rounded-2xl bg-red-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                    >
                      {signupLoading ? "Signing Up..." : "Sign Up"}
                    </button>
                  </form>
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

              {!showLoginForm && !showSignupForm && !isCustomerForm && (
                <form
                  onSubmit={handleGuestOrderSubmit}
                  className="space-y-5 sm:space-y-6"
                  autoComplete="off"
                >
                  <div className="rounded-[18px] border border-white/10 bg-black p-4 shadow-[0_12px_35px_rgba(0,0,0,0.25)] sm:rounded-[22px] sm:p-6">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h2 className="text-xl font-bold text-white sm:text-2xl">
                        Order as Guest
                      </h2>
                    </div>

                    <p className="mb-5 text-sm text-white/60">
                      Continue without creating an account and place your order
                      as guest.
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
                          value={guestForm.customerName}
                          onChange={handleGuestChange}
                          autoComplete="name"
                          className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-red-500 sm:text-base"
                          placeholder="Enter full name"
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-white/85">
                            Phone
                          </label>
                          <input
                            name="mobile"
                            value={guestForm.mobile}
                            onChange={handleGuestChange}
                            autoComplete="tel"
                            className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-red-500 sm:text-base"
                            placeholder="Enter phone number"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-white/85">
                            Alt Phone
                          </label>
                          <input
                            name="altMobile"
                            value={guestForm.altMobile}
                            onChange={handleGuestChange}
                            autoComplete="off"
                            className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-red-500 sm:text-base"
                            placeholder="Enter alternate phone number"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-white/85">
                          Email Address
                        </label>
                        <input
                          name="email"
                          type="email"
                          value={guestForm.email}
                          onChange={handleGuestChange}
                          autoComplete="email"
                          className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-red-500 sm:text-base"
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
                            onClick={() => handleGuestFulfillmentChange("PICKUP")}
                            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition sm:text-base ${
                              guestForm.fulfillmentType === "PICKUP"
                                ? "border-red-500 bg-red-600 text-white"
                                : "border-white/10 bg-[#111] text-white hover:border-red-500"
                            }`}
                          >
                            Pickup
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleGuestFulfillmentChange("DELIVERY")
                            }
                            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition sm:text-base ${
                              guestForm.fulfillmentType === "DELIVERY"
                                ? "border-red-500 bg-red-600 text-white"
                                : "border-white/10 bg-[#111] text-white hover:border-red-500"
                            }`}
                          >
                            Delivery
                          </button>
                        </div>
                      </div>

                      {guestForm.fulfillmentType === "DELIVERY" && (
                        <>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-white/85">
                              Nearest Landmark
                            </label>
                            <input
                              name="nearestLandmark"
                              value={guestForm.nearestLandmark}
                              onChange={handleGuestChange}
                              autoComplete="off"
                              className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-red-500 sm:text-base"
                              placeholder="Enter nearest landmark"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-white/85">
                              Delivery Address
                            </label>
                            <textarea
                              name="deliveryAddress"
                              value={guestForm.deliveryAddress}
                              onChange={handleGuestChange}
                              className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-red-500 sm:text-base"
                              placeholder="Enter full delivery address"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-white/85">
                              Special Instructions
                            </label>
                            <textarea
                              name="deliveryNotes"
                              value={guestForm.deliveryNotes}
                              onChange={handleGuestChange}
                              autoComplete="off"
                              className="min-h-[130px] w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-red-500 sm:text-base"
                              placeholder="Type special instructions here..."
                            />
                          </div>
                        </>
                      )}

                      {guestForm.fulfillmentType === "PICKUP" && (
                        <div className="rounded-2xl border border-white/10 bg-[#111] px-4 py-4 text-sm text-white/65">
                          You selected{" "}
                          <span className="font-semibold text-white">
                            Pickup
                          </span>
                          . No delivery address is required.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[18px] border border-white/10 bg-black p-4 shadow-[0_12px_35px_rgba(0,0,0,0.25)] sm:rounded-[22px] sm:p-6">
                    <h2 className="text-xl font-bold text-white sm:text-2xl">
                      Payment
                    </h2>
                    <p className="mt-2 text-sm text-white/60">
                      Select your preferred payment method.
                    </p>

                    <div className="mt-5 space-y-3">
                      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-[#111] px-4 py-4 transition hover:border-red-500">
                        <input
                          type="radio"
                          name="guestPaymentMethod"
                          checked={guestForm.paymentMethod === "CASH"}
                          onChange={() => handleGuestPaymentChange("CASH")}
                        />
                        <span className="text-sm font-medium text-white sm:text-base">
                          Cash
                        </span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={placingOrder || items.length === 0}
                    className="w-full rounded-2xl bg-red-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                  >
                    {placingOrder ? "Placing Order..." : "Place Your Order"}
                  </button>
                </form>
              )}

              {isCustomerForm && (
                <form
                  onSubmit={handleCustomerOrderSubmit}
                  className="space-y-5 sm:space-y-6"
                  autoComplete="off"
                >
                  <div className="rounded-[18px] border border-white/10 bg-black p-4 shadow-[0_12px_35px_rgba(0,0,0,0.25)] sm:rounded-[22px] sm:p-6">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h2 className="text-xl font-bold text-white sm:text-2xl">
                        Place Your Order
                      </h2>
                    </div>

                    <p className="mb-5 text-sm text-white/60">
                      Confirm your order details before placing the order.
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
                          value={customerOrderForm.customerName}
                          onChange={handleCustomerOrderChange}
                          autoComplete="name"
                          className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-red-500 sm:text-base"
                          placeholder="Enter full name"
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-white/85">
                            Phone
                          </label>
                          <input
                            name="mobile"
                            value={customerOrderForm.mobile}
                            onChange={handleCustomerOrderChange}
                            autoComplete="tel"
                            className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-red-500 sm:text-base"
                            placeholder="Enter phone number"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-white/85">
                            Alt Phone
                          </label>
                          <input
                            name="altMobile"
                            value={customerOrderForm.altMobile}
                            onChange={handleCustomerOrderChange}
                            autoComplete="off"
                            className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-red-500 sm:text-base"
                            placeholder="Enter alternate phone number"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-white/85">
                          Email Address
                        </label>
                        <input
                          name="email"
                          type="email"
                          value={customerOrderForm.email}
                          onChange={handleCustomerOrderChange}
                          autoComplete="email"
                          className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-red-500 sm:text-base"
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
                            onClick={() =>
                              handleCustomerFulfillmentChange("PICKUP")
                            }
                            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition sm:text-base ${
                              customerOrderForm.fulfillmentType === "PICKUP"
                                ? "border-red-500 bg-red-600 text-white"
                                : "border-white/10 bg-[#111] text-white hover:border-red-500"
                            }`}
                          >
                            Pickup
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleCustomerFulfillmentChange("DELIVERY")
                            }
                            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition sm:text-base ${
                              customerOrderForm.fulfillmentType === "DELIVERY"
                                ? "border-red-500 bg-red-600 text-white"
                                : "border-white/10 bg-[#111] text-white hover:border-red-500"
                            }`}
                          >
                            Delivery
                          </button>
                        </div>
                      </div>

                      {customerOrderForm.fulfillmentType === "DELIVERY" && (
                        <>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-white/85">
                              Nearest Landmark
                            </label>
                            <input
                              name="nearestLandmark"
                              value={customerOrderForm.nearestLandmark}
                              onChange={handleCustomerOrderChange}
                              autoComplete="off"
                              className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-red-500 sm:text-base"
                              placeholder="Enter nearest landmark"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-white/85">
                              Delivery Address
                            </label>
                            <textarea
                              name="deliveryAddress"
                              value={customerOrderForm.deliveryAddress}
                              onChange={handleCustomerOrderChange}
                              className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-red-500 sm:text-base"
                              placeholder="Enter full delivery address"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-white/85">
                              Special Instructions
                            </label>
                            <textarea
                              name="deliveryNotes"
                              value={customerOrderForm.deliveryNotes}
                              onChange={handleCustomerOrderChange}
                              autoComplete="off"
                              className="min-h-[130px] w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-red-500 sm:text-base"
                              placeholder="Type special instructions here..."
                            />
                          </div>
                        </>
                      )}

                      {customerOrderForm.fulfillmentType === "PICKUP" && (
                        <div className="rounded-2xl border border-white/10 bg-[#111] px-4 py-4 text-sm text-white/65">
                          You selected{" "}
                          <span className="font-semibold text-white">
                            Pickup
                          </span>
                          . No delivery address is required.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[18px] border border-white/10 bg-black p-4 shadow-[0_12px_35px_rgba(0,0,0,0.25)] sm:rounded-[22px] sm:p-6">
                    <h2 className="text-xl font-bold text-white sm:text-2xl">
                      Payment
                    </h2>
                    <p className="mt-2 text-sm text-white/60">
                      Select your preferred payment method.
                    </p>

                    <div className="mt-5 space-y-3">
                      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-[#111] px-4 py-4 transition hover:border-red-500">
                        <input
                          type="radio"
                          name="customerPaymentMethod"
                          checked={customerOrderForm.paymentMethod === "CASH"}
                          onChange={() => handleCustomerPaymentChange("CASH")}
                        />
                        <span className="text-sm font-medium text-white sm:text-base">
                          Cash
                        </span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={placingOrder || items.length === 0}
                    className="w-full rounded-2xl bg-red-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                  >
                    {placingOrder ? "Placing Order..." : "Place Your Order"}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-[#111] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:rounded-[26px] sm:p-5 md:p-6 lg:sticky lg:top-8 lg:rounded-[28px]">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Order Summary
            </h2>

            <div className="mt-5 space-y-4 text-sm text-white/65 sm:text-[15px]">
              {items.length === 0 && <p>Your cart is empty.</p>}

              <div className="rounded-2xl border border-white/10 bg-black p-4">
                <div className="flex items-center justify-between gap-3">
                  <span>Order Type</span>
                  <span className="font-semibold text-white">
                    {(isCustomerForm
                      ? customerOrderForm.fulfillmentType
                      : guestForm.fulfillmentType) === "PICKUP"
                      ? "Pickup"
                      : "Delivery"}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.cartKey}
                    className="rounded-2xl border border-white/10 bg-black p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white sm:text-[15px]">
                          {item.productName}
                        </p>

                        {item.variantName && (
                          <p className="mt-1 text-xs text-white/55 sm:text-sm">
                            Variant: {item.variantName}
                          </p>
                        )}

                        {item.addons?.length > 0 && (
                          <p className="mt-1 text-xs leading-5 text-white/45">
                            Addons:{" "}
                            {item.addons.map((addon) => addon.name).join(", ")}
                          </p>
                        )}

                        <p className="mt-1 text-xs text-white/50 sm:text-sm">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-white sm:text-[15px]">
                          Rs. {item.lineTotal ?? 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <span>Total Items</span>
                  <span className="font-medium text-white">{totalQuantity}</span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <span>Subtotal</span>
                  <span className="font-medium text-white">Rs. {subtotal}</span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 text-base font-semibold text-white sm:text-lg">
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