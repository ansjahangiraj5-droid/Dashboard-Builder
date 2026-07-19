"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, fetchMe, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const token = localStorage.getItem("access_token");
      if (!token) router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isAuthenticated) return null;
  return <>{children}</>;
}
