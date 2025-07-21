import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";

// Create a function to get the error handler
// This will be set after the ErrorProvider is initialized
let globalErrorHandler: ((error: any) => void) | null = null;

export const setGlobalErrorHandler = (handler: (error: any) => void) => {
  globalErrorHandler = handler;
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      // Always show global error handler
      // Individual queries can still handle errors locally if needed
      if (globalErrorHandler) {
        globalErrorHandler(error);
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      // Always show global error handler
      // Individual mutations can still handle errors locally if needed
      if (globalErrorHandler) {
        globalErrorHandler(error);
      }
    },
  }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});
