"use client";

import { useState } from "react";

export default function OrdersToolbar({
  onSearch,
  onStatusChange,
  onRefresh,
  onFulfillmentChange,
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [fulfillmentType, setFulfillmentType] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch?.(search);
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setStatus(value);
    onStatusChange?.(value);
  };

  const handleFulfillmentTypeChange = (e) => {
    const value = e.target.value;
    setFulfillmentType(value);
    onFulfillmentChange?.(value);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Search order / customer"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded-md border px-3 py-2 text-sm"
        />

        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-sm text-white"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={handleStatusChange}
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="RECEIVED">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COOKING">Cooking</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select
          value={fulfillmentType}
          onChange={handleFulfillmentTypeChange}
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All Types</option>
          <option value="DELIVERY">Delivery</option>
          <option value="PICKUP">Pickup</option>
        </select>

        <button
          type="button"
          onClick={onRefresh}
          className="rounded-md border px-4 py-2 text-sm hover:bg-gray-100"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}