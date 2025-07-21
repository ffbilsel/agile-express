"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Eye, EyeOff, Clock, X } from "lucide-react";

type OverdueSprint = {
  projectId: number;
  sprintId: number;
  overdue: number;
};

type Credentials = {
  username: string;
  password: string;
};

export default function Login() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [credentials, setCredentials] = useState<Credentials>({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [overdueSprints, setOverdueSprints] = useState<OverdueSprint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const popupRef = useRef<Window | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8080/sprint/check-status", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!res.ok) {
        setShowModal(false);
        setOverdueSprints([]);
        router.push("/");
        return;
      }

      const data = await res.json();

      if (data.error || data.message === "Access Denied") {
        setShowModal(false);
        setOverdueSprints([]);
        router.push("/");
        return;
      }

      if (Array.isArray(data) && data.length > 0) {
        const typedData = data.filter(
          (item): item is OverdueSprint =>
            typeof item.projectId === "number" &&
            typeof item.sprintId === "number" &&
            typeof item.overdue === "number"
        );

        if (typedData.length > 0) {
          setOverdueSprints(typedData);
          setShowModal(true);
        } else {
          setShowModal(false);
          setOverdueSprints([]);
          router.push("/");
        }
      } else {
        setShowModal(false);
        setOverdueSprints([]);
        router.push("/");
      }
    } catch (err) {
      console.error("Sprint status check failed", err);
      setShowModal(false);
      setOverdueSprints([]);
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "oauth2_success") {
        const { accessToken, refreshToken, username, role } = event.data.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("username", username);
        localStorage.setItem("role", role);

        popupRef.current?.close();
        setGoogleLoading(false);
        queryClient.invalidateQueries();
        checkStatus();
      } else if (event.data?.type === "oauth2_error") {
        console.error("OAuth login failed:", event.data.error);
        popupRef.current?.close();
        setGoogleLoading(false);
        setError("Google OAuth login failed");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router, queryClient, checkStatus]);

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      checkStatus();
    }
  }, [checkStatus]);

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setError("");
    popupRef.current = window.open(
      "http://localhost:8080/oauth2/authorization/google",
      "_blank",
      "width=500,height=600"
    );

    // Handle popup being closed manually
    const checkClosed = setInterval(() => {
      if (popupRef.current?.closed) {
        setGoogleLoading(false);
        clearInterval(checkClosed);
      }
    }, 1000);
  };

  const handleLdapLogin = async () => {
    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const res = await fetch("http://localhost:8080/auth/ldap-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) throw new Error("Invalid username or password");

      const data = await res.json();
      const { accessToken, refreshToken, username, role } = data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("username", username);
      localStorage.setItem("role", role);

      queryClient.invalidateQueries();
      checkStatus();
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLdapLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full text-center space-y-8 transform transition-all duration-300">
        {/* Header */}
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">AE</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to continue to Agile Express</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-in slide-in-from-top duration-300">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading || isLoading}
          className="group relative flex items-center justify-center gap-3 w-full py-4 px-6 bg-white text-gray-700 border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
          type="button"
        >
          {googleLoading ? (
            <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          <span className="font-medium">Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 px-4 text-gray-500 text-sm font-medium bg-white">
            or sign in with credentials
          </span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* LDAP Login Form */}
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="relative group">
              <input
                type="text"
                placeholder="Username"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-blue-400 focus:bg-white transition-all duration-200 placeholder-gray-400"
                autoComplete="username"
                disabled={isLoading || googleLoading}
              />
            </div>

            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-4 pr-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-blue-400 focus:bg-white transition-all duration-200 placeholder-gray-400"
                autoComplete="current-password"
                disabled={isLoading || googleLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                disabled={isLoading || googleLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handleLdapLogin}
            disabled={isLoading || googleLoading}
            className="relative w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            type="button"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </div>
      </div>

      {/* Enhanced Modal for overdue sprints */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-amber-50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Overdue Sprints Alert
                  </h2>
                  <p className="text-sm text-gray-600">
                    Action required on {overdueSprints.length} sprint
                    {overdueSprints.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-150"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {overdueSprints.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-emerald-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-lg font-medium">
                    All sprints are on track!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-700 mb-6 font-medium">
                    You have {overdueSprints.length} sprint
                    {overdueSprints.length > 1 ? "s" : ""} that require
                    immediate attention:
                  </p>
                  <div className="space-y-3">
                    {overdueSprints.map((sprint, index) => (
                      <div
                        key={index}
                        className="bg-amber-50 border border-amber-200 rounded-xl p-4 hover:bg-amber-100 transition-colors duration-150"
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                                Project {sprint.projectId}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                                Sprint {sprint.sprintId}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Clock className="w-3 h-3" />
                              <span>
                                Overdue since {sprint.overdue} day
                                {sprint.overdue > 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-amber-600">
                              {sprint.overdue}
                            </div>
                            <div className="text-xs text-amber-600 font-medium">
                              day{sprint.overdue > 1 ? "s" : ""} late
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t border-gray-100 bg-gray-50 space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all font-medium"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  router.push("/");
                }}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
