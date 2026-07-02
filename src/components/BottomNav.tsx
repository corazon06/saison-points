"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, ListChecks, History, User } from "lucide-react";

const LINKS = [
  { href: "/classement", label: "Classement", icon: Trophy },
  { href: "/actions", label: "J'ai marqué...", icon: ListChecks },
  { href: "/historique", label: "Historique", icon: History },
];

export function BottomNav({ pseudo }: { pseudo: string }) {
  const pathname = usePathname();

  const items = [...LINKS, { href: `/profil/${pseudo}`, label: "Profil", icon: User }];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-coral bg-white shadow-[0_-2px_12px_rgba(2,89,221,0.12)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-4xl items-stretch justify-around">
        {items.map((item) => {
          const active =
            item.href === `/profil/${pseudo}`
              ? pathname.startsWith("/profil")
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-3"
            >
              <Icon
                size={24}
                strokeWidth={active ? 2.5 : 1.8}
                className={active ? "text-coral" : "text-sky"}
              />
              <span
                className={`h-1 w-1 rounded-full ${active ? "bg-coral" : "bg-transparent"}`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
