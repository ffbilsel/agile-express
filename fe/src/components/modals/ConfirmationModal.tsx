import React, { useState } from "react";
import { useConfirmation } from "@/contexts/ConfirmationContext";
import { AlertTriangle, Info, AlertCircle, Loader2 } from "lucide-react";

export default function ConfirmationModal() {
  const { isVisible, options, hideConfirmation } = useConfirmation();
  const [isLoading, setIsLoading] = useState(false);

  if (!isVisible || !options) return null;

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await options.onConfirm();
      hideConfirmation();
    } catch (error) {
      console.error("Confirmation action failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    options.onCancel?.();
    hideConfirmation();
  };

  const getIcon = () => {
    switch (options.type) {
      case "danger":
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case "warning":
        return <AlertCircle className="w-6 h-6 text-amber-600" />;
      case "info":
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getButtonStyles = () => {
    switch (options.type) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 focus:ring-red-300 shadow-red-200";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 focus:ring-amber-300 shadow-amber-200";
      case "info":
      default:
        return "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 shadow-blue-200";
    }
  };

  const getBackgroundColor = () => {
    switch (options.type) {
      case "danger":
        return "bg-red-50 border-red-100";
      case "warning":
        return "bg-amber-50 border-amber-100";
      case "info":
      default:
        return "bg-blue-50 border-blue-100";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header with icon */}
        <div className={`px-6 py-4 border-b ${getBackgroundColor()}`}>
          <div className="flex items-center gap-3">
            {getIcon()}
            <h3 className="text-lg font-semibold text-gray-900">
              {options.title || "Are you sure?"}
            </h3>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-gray-700 leading-relaxed">{options.message}</p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 transition-colors duration-150"
          >
            {options.cancelText || "Cancel"}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 shadow-lg hover:shadow-xl flex items-center gap-2 ${getButtonStyles()}`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Processing..." : options.confirmText || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
