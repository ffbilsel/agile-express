"use client";
import { useDashboardStatistics } from "@/hooks/dashboardMutations";
import React, { useState, useRef, useEffect } from "react";
import { Search, Filter, X, ChevronDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { SearchParams } from "@/hooks/searchMutations";
import { IssueType } from "@/types/Issue";

const SearchFilter = () => {
  const { data, isLoading } = useDashboardStatistics();
  const [formData, setFormData] = useState<SearchParams>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  const [quickSearchValue, setQuickSearchValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const quickSearchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Handle quick search if there's a value
    if (quickSearchValue.trim() && !hasActiveFilters) {
      const searchParams = new URLSearchParams({
        title: quickSearchValue.trim(),
      }).toString();
      router.push(`/search?${searchParams}`);
      setShowQuickSearch(false);
      return;
    }

    // Remove empty params from formData before updating URL
    const filteredParams = Object.entries(formData).reduce(
      (acc, [key, value]) => {
        if (value && value.trim()) acc[key] = value.trim();
        return acc;
      },
      {} as Record<string, string>
    );

    // Construct URLSearchParams
    const searchParams = new URLSearchParams(filteredParams).toString();

    // Navigate to search page with query params
    router.push(`/search?${searchParams}`);

    setIsExpanded(false);
    setShowQuickSearch(false);
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearchValue.trim()) return;

    const searchParams = new URLSearchParams({
      title: quickSearchValue.trim(),
    }).toString();
    handleClear();
    router.push(`/search?${searchParams}`);
    setShowQuickSearch(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
      if (
        quickSearchRef.current &&
        !quickSearchRef.current.contains(event.target as Node)
      ) {
        setShowQuickSearch(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsExpanded(false);
        setShowQuickSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const allStatuses =
    data?.projects?.flatMap((project) => project.statuses) || [];
  const uniqueStatuses = Array.from(new Set(allStatuses));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || undefined,
    }));
  };

  const handleClear = () => {
    setFormData({});
    setQuickSearchValue("");
    setIsExpanded(false);
  };

  const hasActiveFilters = Object.values(formData).some(
    (value) => value && value.trim()
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-96 h-12 bg-white rounded-lg border border-gray-200 shadow-sm">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-gray-600 font-medium">
          Loading search...
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Quick Search Input */}
      <div className="relative" ref={quickSearchRef}>
        <form onSubmit={handleQuickSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
            <input
              type="text"
              placeholder="Quick search issues..."
              value={quickSearchValue}
              onChange={(e) => setQuickSearchValue(e.target.value)}
              onFocus={() => setShowQuickSearch(true)}
              className="w-full pl-12 pr-14 py-3.5 border border-gray-200 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       text-sm bg-white shadow-sm transition-all duration-200
                       hover:border-gray-300 hover:shadow-md text-gray-900 placeholder:text-gray-500"
            />

            {/* Filter Button */}
            <button
              type="button"
              onClick={() => {
                setIsExpanded(!isExpanded);
                setShowQuickSearch(false);
              }}
              aria-label="Toggle advanced filters"
              aria-expanded={isExpanded}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-md 
                        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
                        ${
                          hasActiveFilters
                            ? "text-blue-600 bg-blue-50 hover:bg-blue-100 shadow-sm"
                            : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                        }`}
            >
              <Filter className="w-5 h-5" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              )}
            </button>
          </div>
        </form>

        {/* Quick Search Suggestions */}
        {showQuickSearch && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 backdrop-blur-sm">
            <div className="p-4">
              <div className="text-xs text-gray-500 mb-3 font-medium">
                Press Enter to search by title, or use advanced filters below
              </div>
              <button
                onClick={() => {
                  setIsExpanded(true);
                  setShowQuickSearch(false);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150"
              >
                → Open Advanced Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filters Dropdown */}
      {isExpanded && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-full min-w-[420px] backdrop-blur-sm"
          role="dialog"
          aria-label="Advanced search filters"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                Advanced Filters
              </h3>
              <button
                onClick={() => setIsExpanded(false)}
                aria-label="Close filters"
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1 transition-colors duration-150"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* First Row - Project and Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="projectName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Project
                  </label>
                  <div className="relative">
                    <select
                      id="projectName"
                      name="projectName"
                      value={formData.projectName || ""}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                               appearance-none bg-white cursor-pointer text-gray-900 shadow-sm
                               hover:border-gray-300 transition-colors duration-150"
                    >
                      <option value="" className="text-gray-500">
                        All Projects
                      </option>
                      {data?.projects.map((p) => (
                        <option
                          key={p.id}
                          value={p.name}
                          className="text-gray-900"
                        >
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="issueType"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Type
                  </label>
                  <div className="relative">
                    <select
                      id="issueType"
                      name="issueType"
                      value={formData.issueType || ""}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                               appearance-none bg-white cursor-pointer text-gray-900 shadow-sm
                               hover:border-gray-300 transition-colors duration-150"
                    >
                      <option value="" className="text-gray-500">
                        All Types
                      </option>
                      {Object.values(IssueType).map((type) => (
                        <option
                          key={type}
                          value={type}
                          className="text-gray-900"
                        >
                          {type}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Second Row - Status and User */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="statusName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Status
                  </label>
                  <div className="relative">
                    <select
                      id="statusName"
                      name="statusName"
                      value={formData.statusName || ""}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                               appearance-none bg-white cursor-pointer text-gray-900 shadow-sm
                               hover:border-gray-300 transition-colors duration-150"
                    >
                      <option value="" className="text-gray-500">
                        All Statuses
                      </option>
                      {uniqueStatuses.map((status) => (
                        <option
                          key={status}
                          value={status}
                          className="text-gray-900"
                        >
                          {status}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="userName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    User
                  </label>
                  <input
                    id="userName"
                    name="userName"
                    type="text"
                    placeholder="Username..."
                    value={formData.userName || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             text-gray-900 placeholder:text-gray-500 bg-white shadow-sm
                             hover:border-gray-300 transition-colors duration-150"
                  />
                </div>
              </div>

              {/* Third Row - Title and Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Search in titles..."
                    value={formData.title || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             text-gray-900 placeholder:text-gray-500 bg-white shadow-sm
                             hover:border-gray-300 transition-colors duration-150"
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Description
                  </label>
                  <input
                    id="description"
                    name="description"
                    type="text"
                    placeholder="Search in descriptions..."
                    value={formData.description || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             text-gray-900 placeholder:text-gray-500 bg-white shadow-sm
                             hover:border-gray-300 transition-colors duration-150"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleClear}
                  className={`text-sm font-medium transition-colors duration-150 ${
                    hasActiveFilters
                      ? "text-gray-600 hover:text-gray-800 cursor-pointer"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                  disabled={!hasActiveFilters}
                >
                  Clear all filters
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 
                             transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500
                             bg-white text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                             transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500
                             shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </form>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <div className="text-xs text-gray-600 mb-3 font-medium">
                  Active filters:
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(formData)
                    .filter(([, value]) => value && value.trim())
                    .map(([key, value]) => (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-lg font-medium border border-blue-200"
                      >
                        <span className="font-semibold">
                          {key === "userName"
                            ? "User"
                            : key === "projectName"
                              ? "Project"
                              : key === "issueType"
                                ? "Type"
                                : key === "statusName"
                                  ? "Status"
                                  : key.charAt(0).toUpperCase() + key.slice(1)}
                          :
                        </span>
                        <span>{value}</span>
                        <button
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              [key]: undefined,
                            }));
                          }}
                          className="hover:bg-blue-100 rounded-full p-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-150"
                          aria-label={`Remove filter ${key}`}
                          type="button"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
