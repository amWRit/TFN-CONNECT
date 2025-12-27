"use client";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";

function LoginPageContent() {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Sign in to TFN Connect</h1>
        <p className="text-sm text-gray-600 mb-6">
          Sign in with your Google account. Only @teachfornepal.org emails or whitelisted emails are allowed.
        </p>
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errorMessage}
          </div>
        )}
        <Button
          className="w-full py-2 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          Sign in with Google
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
