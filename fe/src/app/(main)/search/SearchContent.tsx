"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSearch } from "@/hooks/searchMutations";
import Link from "next/link";
import {
  Search,
  AlertCircle,
  Calendar,
  User,
  Hash,
  Clock,
  CheckCircle2,
  ArrowRight,
  Filter,
  Loader2,
  FileText,
  Target,
  TrendingUp,
  FolderOpen,
  Users,
  Briefcase,
} from "lucide-react";
import IssueTypeIcon from "@/components/IssueTypeIcon";
import Avatar from "@/components/Avatar";

// Separate component that uses useSearchParams
export default function SearchContent() {
  const {
    data: searchResults,
    mutate: searchItems,
    error,
    isPending,
  } = useSearch();
  const [hasSearched, setHasSearched] = useState(false);
  const searchParams = useSearchParams();

  const searchParamsObject = useMemo(() => {
    const params: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      if (value.trim()) {
        params[key] = value;
      }
    }
    return params;
  }, [searchParams]);

  const hasParams = useMemo(
    () => Object.keys(searchParamsObject).length > 0,
    [searchParamsObject]
  );

  // Trigger search whenever search parameters change
  useEffect(() => {
    if (hasParams) {
      searchItems(searchParamsObject);
      setHasSearched(true);
    } else {
      setHasSearched(false);
    }
  }, [hasParams, searchParamsObject, searchItems]);

  // Separate issues and projects from search results
  const { issues, projects } = useMemo(() => {
    if (!searchResults) return { issues: [], projects: [] };

    const issues = searchResults
      .filter((result) => result.searchType === "ISSUE" && result.issue)
      .map((result) => result.issue!);

    const projects = searchResults
      .filter((result) => result.searchType === "PROJECT" && result.project)
      .map((result) => result.project!);

    return { issues, projects };
  }, [searchResults]);

  const totalResults = (issues?.length || 0) + (projects?.length || 0);

  // Helper: format dates nicely
  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return "-";
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get search summary
  const getSearchSummary = () => {
    const filters = Object.entries(searchParamsObject).filter(
      ([, value]) => value
    );
    if (filters.length === 0) return null;

    return filters.map(([key, value]) => ({
      key,
      label:
        key === "userName"
          ? "Assignee"
          : key === "projectName"
            ? "Project"
            : key === "issueType"
              ? "Type"
              : key === "statusName"
                ? "Status"
                : key.charAt(0).toUpperCase() + key.slice(1),
      value,
    }));
  };

  const searchSummary = getSearchSummary();

  // Get issue stats
  const issueStats = useMemo(() => {
    if (!issues || issues.length === 0) return null;

    const total = issues.length;
    const completed = issues.filter((issue) => issue.closedAt).length;
    const inProgress = total - completed;
    const types = issues.reduce(
      (acc, issue) => {
        acc[issue.issueType] = (acc[issue.issueType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return { total, completed, inProgress, types };
  }, [issues]);

  // Get project stats
  const projectStats = useMemo(() => {
    if (!projects || projects.length === 0) return null;

    const total = projects.length;
    const activeProjects = projects.filter((project) => {
      const endDate = new Date(project.endDate);
      return endDate > new Date();
    }).length;
    const completedProjects = total - activeProjects;

    return { total, active: activeProjects, completed: completedProjects };
  }, [projects]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Search Results
              </h1>
              <p className="text-gray-600">
                {hasSearched
                  ? `Found ${totalResults} result${totalResults !== 1 ? "s" : ""} (${issues?.length || 0} issue${issues?.length !== 1 ? "s" : ""}, ${projects?.length || 0} project${projects?.length !== 1 ? "s" : ""})`
                  : "Enter search criteria to find issues and projects"}
              </p>
            </div>
          </div>

          {/* Search Summary */}
          {searchSummary && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Filter className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">
                  Active Filters:
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {searchSummary.map(({ key, label, value }) => (
                  <span
                    key={key}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    <span className="font-semibold">{label}:</span>
                    <span className="ml-1">{value}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isPending && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <div className="absolute inset-0 w-8 h-8 border-2 border-transparent border-r-blue-400 rounded-full animate-ping"></div>
            </div>
            <p className="text-gray-600 text-lg font-medium">
              Searching for items...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isPending && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Search Error
            </h3>
            <p className="text-red-600">
              There was an error searching for items. Please try again.
            </p>
          </div>
        )}

        {/* No Search Performed */}
        {!hasSearched && !isPending && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-3">
              No Search Performed
            </h3>
            <p className="text-gray-500 mb-6">
              Use the search filters above to find issues and projects.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Results Section */}
        {hasSearched && !isPending && searchResults && (
          <>
            {/* Stats Overview */}
            {(issueStats || projectStats) && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Total Results */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Target className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {totalResults}
                      </p>
                      <p className="text-sm text-gray-600">Total Results</p>
                    </div>
                  </div>
                </div>

                {/* Issues Stats */}
                {issueStats && (
                  <>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            {issueStats.completed}
                          </p>
                          <p className="text-sm text-gray-600">
                            Completed Issues
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <Clock className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            {issueStats.inProgress}
                          </p>
                          <p className="text-sm text-gray-600">Open Issues</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Projects Stats */}
                {projectStats && (
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FolderOpen className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {projectStats.active}
                        </p>
                        <p className="text-sm text-gray-600">Active Projects</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No Results */}
            {totalResults === 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-3">
                  No Results Found
                </h3>
                <p className="text-gray-500 mb-6">
                  No issues or projects match your search criteria. Try
                  adjusting your filters or search terms.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Back to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Results List */}
            {totalResults > 0 && (
              <div className="space-y-8">
                {/* Projects Section */}
                {projects && projects.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <FolderOpen className="w-5 h-5 text-gray-600" />
                      <h2 className="text-lg font-semibold text-gray-900">
                        Projects ({projects.length})
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {projects.map((project) => (
                        <Link
                          key={project.id}
                          href={`/project/${project.id}/board`}
                          className="block group"
                        >
                          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200 group-hover:bg-blue-50/30">
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <div className="flex items-start gap-4 flex-1 min-w-0">
                                <div className="flex-shrink-0 mt-1">
                                  <div className="p-2 bg-blue-100 rounded-lg">
                                    <Briefcase className="w-5 h-5 text-blue-600" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate mb-2">
                                    {project.name}
                                  </h3>
                                </div>
                              </div>
                              <span className="flex-shrink-0 text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                                #{project.id}
                              </span>
                            </div>

                            {/* Project Metadata */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <MetadataItem
                                icon={<Calendar className="w-4 h-4" />}
                                label="Start Date"
                                value={formatDate(project.startDate)}
                              />
                              <MetadataItem
                                icon={<Calendar className="w-4 h-4" />}
                                label="End Date"
                                value={formatDate(project.endDate)}
                              />
                              <MetadataItem
                                icon={<User className="w-4 h-4" />}
                                label="Manager"
                                value={
                                  project.managerUsername || "Not assigned"
                                }
                              />
                              <MetadataItem
                                icon={<Users className="w-4 h-4" />}
                                label="Team Lead"
                                value={
                                  project.teamLeadUsername || "Not assigned"
                                }
                              />
                            </div>

                            {/* Project Footer */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500">
                                  Team:{" "}
                                  {project.teamMemberUsernames?.length || 0}{" "}
                                  member
                                  {project.teamMemberUsernames?.length !== 1
                                    ? "s"
                                    : ""}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-blue-600 group-hover:text-blue-700">
                                <span className="text-sm font-medium">
                                  View Project
                                </span>
                                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Issues Section */}
                {issues && issues.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <h2 className="text-lg font-semibold text-gray-900">
                        Issues ({issues.length})
                      </h2>
                    </div>
                    <div className="space-y-4">
                      {issues.map((issue) => (
                        <Link
                          key={issue.id}
                          href={`/project/${issue.projectId}/sprint/${issue.sprintId}/issue/${issue.id}`}
                          className="block group"
                        >
                          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200 group-hover:bg-blue-50/30">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <div className="flex items-start gap-4 flex-1 min-w-0">
                                <div className="flex-shrink-0 mt-1">
                                  <IssueTypeIcon type={issue.issueType} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                                      {issue.title}
                                    </h3>
                                    <span className="flex-shrink-0 text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                                      #{issue.id}
                                    </span>
                                  </div>
                                  {issue.description && (
                                    <p className="text-gray-600 line-clamp-2 leading-relaxed">
                                      {issue.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Issue Type Badge */}
                              <span
                                className={`flex-shrink-0 px-3 py-1 text-xs font-semibold rounded-full ${
                                  {
                                    BUG: "bg-red-100 text-red-700 border border-red-200",
                                    TASK: "bg-blue-100 text-blue-700 border border-blue-200",
                                    STORY:
                                      "bg-green-100 text-green-700 border border-green-200",
                                    EPIC: "bg-purple-100 text-purple-700 border border-purple-200",
                                  }[issue.issueType] ||
                                  "bg-gray-100 text-gray-700 border border-gray-200"
                                }`}
                              >
                                {issue.issueType}
                              </span>
                            </div>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                              <MetadataItem
                                icon={<Hash className="w-4 h-4" />}
                                label="Project"
                                value={issue.projectId}
                              />
                              <MetadataItem
                                icon={
                                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                                }
                                label="Status"
                                value={issue.status}
                              />
                              <MetadataItem
                                icon={
                                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                                }
                                label="Story Points"
                                value={issue.storyPoints || "-"}
                              />
                              <MetadataItem
                                icon={<Clock className="w-4 h-4" />}
                                label="Estimated"
                                value={
                                  issue.estimatedEffort
                                    ? `${issue.estimatedEffort}h`
                                    : "-"
                                }
                              />
                              <MetadataItem
                                icon={<Calendar className="w-4 h-4" />}
                                label="Created"
                                value={formatDate(issue.issuedAt)}
                              />
                              <MetadataItem
                                icon={
                                  issue.closedAt ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  ) : (
                                    <Clock className="w-4 h-4" />
                                  )
                                }
                                label={issue.closedAt ? "Closed" : "Status"}
                                value={
                                  issue.closedAt
                                    ? formatDate(issue.closedAt)
                                    : "Open"
                                }
                              />
                            </div>

                            {/* People */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-500 font-medium">
                                    Assignee:
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <Avatar user={issue.assignee} size="sm" />
                                    <span className="text-sm font-medium text-gray-700">
                                      {issue.assignee || "Unassigned"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm text-gray-500 font-medium">
                                    Created by:
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <Avatar user={issue.assigner} size="sm" />
                                    <span className="text-sm font-medium text-gray-700">
                                      {issue.assigner || "Unknown"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* View Link Indicator */}
                              <div className="flex items-center gap-2 text-blue-600 group-hover:text-blue-700">
                                <span className="text-sm font-medium">
                                  View Details
                                </span>
                                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Helper component for metadata items
function MetadataItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-shrink-0 text-gray-400">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-gray-500 font-medium mb-1">{label}</div>
        <div className="text-sm text-gray-900 font-medium truncate">
          {value}
        </div>
      </div>
    </div>
  );
}
