"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { fetchAdminProfileThunk } from "@/store/thunks/authThunks";

export default function AdminAuthGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const { isAuthenticated, initialized, loading } = useSelector(
    (state) => state.auth
  );

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!initialized) {
      dispatch(fetchAdminProfileThunk());
    }
  }, [dispatch, initialized]);

  useEffect(() => {
    if (!initialized) return;

    if (!isAuthenticated && !isLoginPage) {
      router.replace("/admin/login");
      return;
    }

    if (isAuthenticated && isLoginPage) {
      router.replace("/admin");
    }
  }, [initialized, isAuthenticated, isLoginPage, router]);

  if (!initialized || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#edf1f7]">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm">
          <Loader2 size={20} className="animate-spin text-slate-700" />
          <span className="text-sm font-medium text-slate-700">
            Loading admin session...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isLoginPage) return null;
  if (isAuthenticated && isLoginPage) return null;

  return children;
}