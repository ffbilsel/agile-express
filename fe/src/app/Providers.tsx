"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/reactQuery";
import { ErrorProvider } from "@/contexts/ErrorContext";
import { ConfirmationProvider } from "@/contexts/ConfirmationContext";
import GlobalErrorModal from "@/components/modals/GlobalErrorModal";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import ErrorInitializer from "@/components/ErrorInitializer";
import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorProvider>
        <ConfirmationProvider>
          <ErrorInitializer />
          {children}
          <GlobalErrorModal />
          <ConfirmationModal />
        </ConfirmationProvider>
      </ErrorProvider>
    </QueryClientProvider>
  );
}
