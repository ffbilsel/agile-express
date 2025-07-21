// contexts/ErrorContext.tsx
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface ErrorContextType {
  showError: (error: any) => void;
  hideError: () => void;
  error: any;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
};

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [error, setError] = useState<any>(null);

  const showError = (error: any) => {
    // Filter out certain errors if needed
    // For example, you might not want to show 401 errors globally
    if (error?.response?.status === 401) {
      localStorage.clear();
      router.push("/login"); // 👈 works correctly with React Router
      return;
    }

    setError(error);
  };

  const hideError = () => {
    setError(null);
  };

  return (
    <ErrorContext.Provider value={{ showError, hideError, error }}>
      {children}
    </ErrorContext.Provider>
  );
};
