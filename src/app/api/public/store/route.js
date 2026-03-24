import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Expected openingHours format:
 * "10:00-23:00"
 *
 * Examples:
 * "09:30-22:00"
 * "00:00-23:59"
 */
function checkStoreOpen(openingHours) {
  // If openingHours not set, treat as open
  if (!openingHours || typeof openingHours !== "string") {
    return true;
  }

  const parts = openingHours.split("-");
  if (parts.length !== 2) {
    return true; // fallback: avoid blocking store because of bad format
  }

  const start = parts[0].trim();
  const end = parts[1].trim();

  const startParts = start.split(":").map(Number);
  const endParts = end.split(":").map(Number);

  if (
    startParts.length !== 2 ||
    endParts.length !== 2 ||
    startParts.some(Number.isNaN) ||
    endParts.some(Number.isNaN)
  ) {
    return true; // fallback
  }

  const [startH, startM] = startParts;
  const [endH, endM] = endParts;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  // Normal same-day range: 10:00-23:00
  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  // Overnight range: 18:00-02:00
  return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
}

export async function GET() {
  const settings = await prisma.siteSetting.findUnique({
    where: { id: "default" },
    select: {
      id: true,
      storeName: true,
      phone: true,
      email: true,
      address: true,
      openingHours: true,
      deliveryInfo: true,
      facebook: true,
      instagram: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!settings) {
    return NextResponse.json(
      { message: "Store settings not found" },
      { status: 404 }
    );
  }

  const isOpen = checkStoreOpen(settings.openingHours);

  return NextResponse.json({
    store: {
      ...settings,
      isOpen,
    },
  });
}