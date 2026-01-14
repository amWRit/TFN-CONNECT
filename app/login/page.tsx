"use client";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { UserCircle, Home, Activity, User } from "lucide-react";

function LoginPageContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const error = searchParams?.get("error") || null;

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "AccessDenied":
        return "Your email is not whitelisted. Only @teachfornepal.org emails or whitelisted emails can sign in.";
      case "Configuration":
        return "There is a problem with the server configuration. Please check your environment variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_URL, NEXTAUTH_SECRET).";
      case "OAuthSignin":
        return "Error signing in with Google. Please check: 1) Google OAuth credentials are set correctly, 2) Redirect URI in Google Cloud Console matches http://localhost:3000/api/auth/callback/google, 3) NEXTAUTH_URL is set to http://localhost:3000";
      case "OAuthCallback":
        return "Error in OAuth callback. Please try again.";
      case "OAuthCreateAccount":
        return "Could not create OAuth account. Please try again.";
      case "EmailCreateAccount":
        return "Could not create email account. Please try again.";
      case "Callback":
        return "Error in callback. Please try again.";
      case "OAuthAccountNotLinked":
        return "This account is not linked. Please sign in with the original account.";
      case "EmailSignin":
        return "Error sending email. Please try again.";
      case "CredentialsSignin":
        return "Invalid credentials. Please check your email and password.";
      case "SessionRequired":
        return "Please sign in to access this page.";
      case "Verification":
        return "The verification token has expired or has already been used.";
      default:
        return error ? `An error occurred during sign in: ${error}. Please check your Google OAuth configuration.` : null;
    }
  };

  const errorMessage = getErrorMessage(error);

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-50">
        <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md text-center border-0 relative flex flex-col items-center">
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If already signed in, show info and options
  if (session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-50">
        <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md text-center border-0 relative flex flex-col items-center">
          <span className="bg-green-100 p-4 rounded-full mb-4 flex items-center justify-center">
            <UserCircle size={40} className="text-green-600" />
          </span>
          <h1 className="text-2xl font-bold text-green-700 mb-2">Already Signed In</h1>
          <p className="text-base text-gray-700 mb-2">You are signed in as</p>
          <div className="mb-4">
            <span className="font-semibold text-blue-700">{session.user.name || session.user.email}</span>
            <div className="text-xs text-gray-500">{session.user.email}</div>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <a href="/feed" className="w-full py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors text-center flex items-center justify-center gap-2">
              <Activity size={18} className="text-white" /> Feed
            </a>
            <a href="/profile" className="w-full py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors text-center flex items-center justify-center gap-2">
              <User size={18} className="text-white" /> Profile
            </a>
            <a href="/" className="w-full py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors text-center flex items-center justify-center gap-2">
              <Home size={18} className="text-white" /> Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Not signed in: show login form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-50">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md text-center border-0 relative flex flex-col items-center">
        <span className="bg-blue-100 p-4 rounded-full mb-4 flex items-center justify-center">
          <UserCircle size={40} className="text-blue-600" />
        </span>
        <h1 className="text-3xl font-extrabold text-blue-700 mb-2 flex items-center justify-center gap-2">
          Welcome to TFN Connect
        </h1>
        <p className="text-base text-gray-600 mb-6 font-medium">
          Sign in with your Google account.<br />
          <span className="text-sm text-gray-400">Only <span className="font-semibold">@teachfornepal.org</span> or whitelisted emails are allowed.</span>
        </p>
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errorMessage}
          </div>
        )}
        <Button
          className="w-full py-2 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 shadow-lg"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          <FcGoogle size={22} /> Sign in with Google
        </Button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in to TFN Connect</h1>
          <p className="text-sm text-gray-600 mb-6">Loading...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
