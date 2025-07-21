import { Suspense } from "react";
import SearchContent from "./SearchContent";
import { Loader2 } from "lucide-react";

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchContent />
    </Suspense>
  );
}

// Loading fallback component
function SearchFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading search...</p>
      </div>
    </div>
  );
}
