import { SignUp } from "@clerk/nextjs";

export const metadata = { title: "Sign up — Franklin Chieze", robots: { index: false } };

export default function SignUpPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-28">
      <SignUp />
    </div>
  );
}
