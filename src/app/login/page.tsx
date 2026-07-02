import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/classement");

  return (
    <div className="mx-auto max-w-sm rounded-xl border border-cream bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-xl font-bold text-royal">Connexion</h1>
      <LoginForm />
      <p className="mt-4 text-sm text-neutral-600">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="font-semibold text-royal hover:underline">
          Inscris-toi
        </Link>
      </p>
    </div>
  );
}
