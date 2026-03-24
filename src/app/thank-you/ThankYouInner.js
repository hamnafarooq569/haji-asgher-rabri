"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FaReceipt, FaClock, FaWallet } from "react-icons/fa";

export default function ThankYouInner() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  const [order, setOrder] = useState(null);

  useEffect(() => {
    try {
      const storedOrder = sessionStorage.getItem("lastPlacedOrder");
      if (storedOrder) {
        const parsed = JSON.parse(storedOrder);

        if (!orderNumber || parsed?.orderNumber === orderNumber) {
          setOrder(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to read last placed order:", error);
    }
  }, [orderNumber]);

  const items = order?.items || [];
  const totalAmount = Number(order?.totalAmount || 0);
  const estimatedMinutes = 35;

  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }, [items]);

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-10 text-white md:px-6 md:py-14">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-center mb-6">
          Thank you for your order #{orderNumber || "N/A"}
        </h1>

        <p className="text-center mb-4">
          Total: Rs. {totalAmount} | Items: {totalItems}
        </p>

        <div className="text-center space-x-4">
          <Link href="/profile/orders">View Orders</Link>
          <Link href="/">Go Home</Link>
        </div>
      </div>
    </main>
  );
}