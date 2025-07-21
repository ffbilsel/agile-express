import React from "react";
import { useError } from "@/contexts/ErrorContext";
import { AlertCircle, X } from "lucide-react";

export default function GlobalErrorModal() {
  const { error, hideError } = useError();

  if (!error) return null;

  const message =
    typeof error === "string"
      ? error
      : error?.message ||
        error?.response?.data?.message ||
        "An unknown error occurred";

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
      onClick={hideError}
      role="dialog"
      aria-modal="true"
      aria-labelledby="error-title"
      aria-describedby="error-message"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-red-50 border-b border-red-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h2
                id="error-title"
                className="text-lg font-semibold text-gray-900"
              >
                Error Occurred
              </h2>
            </div>
            <button
              onClick={hideError}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg p-1 transition-colors duration-150"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p
            id="error-message"
            className="text-gray-700 whitespace-pre-wrap break-words leading-relaxed"
          >
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={hideError}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-300 text-white font-medium rounded-lg transition-colors duration-150 focus:outline-none shadow-lg hover:shadow-xl"
            autoFocus
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
