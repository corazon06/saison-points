import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { SignupForm } from "@/components/SignupForm";

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/classement");

  return (
    <div className="mx-auto max-w-sm rounded-xl border border-cream bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-xl font-bold text-royal">Inscription</h1>
      <SignupForm />
      <p className="mt-4 text-sm text-neutral-600">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-semibold text-royal hover:underline">
          Connecte-toi
        </Link>
      </p>
    </div>
  );
}
