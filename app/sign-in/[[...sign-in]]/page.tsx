import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/invoice/new");
  }

  return (
    <main className="min-h-screen bg-[#f8f7f5] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <SignIn
          forceRedirectUrl="/invoice/new"
          fallbackRedirectUrl="/invoice/new"
          signUpUrl="/sign-up"
        />
      </div>
    </main>
  );
}
