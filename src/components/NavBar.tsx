import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { LogoutButton } from "@/components/LogoutButton";
import { BottomNav } from "@/components/BottomNav";

export async function NavBar() {
  const user = await getCurrentUser();

  return (
    <>
      <header className="bg-royal">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link
            href="/classement"
            className="truncate text-base font-bold tracking-tight text-white"
          >
            ☀️ Welcome to the new season 2K26 !
          </Link>
          {user && <LogoutButton />}
        </div>
      </header>
      {user && <BottomNav pseudo={user.pseudo} />}
    </>
  );
}
