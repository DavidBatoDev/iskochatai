// app/login/page.tsx
"use client";
import { useState, useEffect } from "react";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/use-auth";

const Login: NextPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { signIn, signInWithGoogle, signInWithFacebook, isAuthenticated } =
    useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard/chat/new");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // Handle login
      const { error } = await signIn(email, password);
      if (error) {
        setErrorMsg(error.message || "Failed to sign in");
      } else {
        router.push("/dashboard/chat/new");
      }
    } catch (error: any) {
      setErrorMsg(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // The redirect will be handled by Supabase
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to sign in with Google");
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      await signInWithFacebook();
      // The redirect will be handled by Supabase
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to sign in with Facebook");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-900 flex flex-col justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Sign In | IskoChat AI</title>
        <meta
          name="description"
          content="Your scholarship assistant login page"
        />
      </Head>

      <div className="mx-auto w-full max-w-xs sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-white rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <Link
              href={'/'}
            >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              IskoChat AI
            </h2>
            </Link>
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-xs sm:text-sm text-blue-200">
          Don&apos;t have an account?
          <Link
            href="/signup"
            className="ml-1 font-medium text-white hover:text-blue-100 focus:outline-none focus:underline transition ease-in-out duration-150"
          >
            Sign up here
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mt-8 mx-auto w-full max-w-xs sm:max-w-md">
        <div className="bg-white py-6 px-4 sm:py-8 sm:px-10 shadow rounded-lg">
          {errorMsg && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-3 sm:p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm text-red-700">{errorMsg}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-xs sm:text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                  placeholder="juan@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs sm:text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-xs sm:text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>

              <div className="text-xs sm:text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-1.5 sm:py-2 px-3 sm:px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>

          <div className="mt-5 sm:mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3">
              <div>
                <button
                  type="button"
                  onClick={handleFacebookSignIn}
                  className="w-full inline-flex justify-center py-1.5 sm:py-2 px-2 sm:px-4 border border-gray-300 rounded-md shadow-sm bg-white text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12.0003 2C6.47731 2 2.00031 6.477 2.00031 12C2.00031 16.991 5.65731 21.128 10.4373 21.879V14.89H7.89931V12H10.4373V9.797C10.4373 7.291 11.9323 5.907 14.2153 5.907C15.3103 5.907 16.4543 6.102 16.4543 6.102V8.562H15.1923C13.9503 8.562 13.5633 9.333 13.5633 10.124V12H16.3363L15.8933 14.89H13.5633V21.879C18.3433 21.129 22.0003 16.99 22.0003 12C22.0003 6.477 17.5233 2 12.0003 2Z" />
                  </svg>
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full inline-flex justify-center py-1.5 sm:py-2 px-2 sm:px-4 border border-gray-300 rounded-md shadow-sm bg-white text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
