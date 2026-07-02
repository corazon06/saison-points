"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      aria-label="Déconnexion"
      className="flex items-center justify-center p-2 text-sky hover:text-white disabled:opacity-50"
    >
      <LogOut size={20} strokeWidth={1.8} />
    </button>
  );
}
