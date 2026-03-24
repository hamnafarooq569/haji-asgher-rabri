import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const CUSTOMER_COOKIE = "customer_token";
const JWT_SECRET =
  process.env.CUSTOMER_JWT_SECRET ||
  process.env.JWT_SECRET ||
  "dev_customer_secret";

export function signCustomerToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyCustomerToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export async function getCustomerFromRequest() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE)?.value;

  if (!token) return null;

  try {
    return verifyCustomerToken(token);
  } catch {
    return null;
  }
}

// optional compatibility helper
export async function getCustomerFromToken() {
  return getCustomerFromRequest();
}

export const customerCookieName = CUSTOMER_COOKIE;