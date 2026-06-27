import { SignIn } from "@clerk/nextjs";

export const metadata = { title: "Sign in — Franklin Chieze", robots: { index: false } };

export default function SignInPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-28">
      <SignIn />
    </div>
  );
}
