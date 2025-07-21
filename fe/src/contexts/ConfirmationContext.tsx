import React, { createContext, useContext, useState, ReactNode } from "react";

interface ConfirmationOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmationContextType {
  showConfirmation: (options: ConfirmationOptions) => void;
  hideConfirmation: () => void;
  isVisible: boolean;
  options: ConfirmationOptions | null;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(
  undefined
);

export const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error(
      "useConfirmation must be used within a ConfirmationProvider"
    );
  }
  return context;
};

export const ConfirmationProvider = ({ children }: { children: ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [options, setOptions] = useState<ConfirmationOptions | null>(null);

  const showConfirmation = (confirmationOptions: ConfirmationOptions) => {
    setOptions(confirmationOptions);
    setIsVisible(true);
  };

  const hideConfirmation = () => {
    setIsVisible(false);
    setOptions(null);
  };

  return (
    <ConfirmationContext.Provider
      value={{ showConfirmation, hideConfirmation, isVisible, options }}
    >
      {children}
    </ConfirmationContext.Provider>
  );
};
