"use client";
import { useEffect } from "react";
import { useError } from "@/contexts/ErrorContext";
import { setGlobalErrorHandler } from "@/lib/reactQuery";

export default function ErrorInitializer() {
  const { showError } = useError();

  useEffect(() => {
    // Set the global error handler
    setGlobalErrorHandler(showError);

    // Cleanup on unmount
    return () => {
      setGlobalErrorHandler(() => {});
    };
  }, [showError]);

  return null; // This component doesn't render anything
}
