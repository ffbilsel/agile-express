"use client";

import { useParams, useRouter } from "next/navigation";
import { useDeleteIssue, useViewIssue } from "@/hooks/issueMutations";
import IssueTypeIcon from "@/components/IssueTypeIcon";
import Avatar from "@/components/Avatar";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  Clock,
  Calendar,
  Target,
  User,
  Hash,
  Zap,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  FileText,
} from "lucide-react";
import React, { useEffect, useState } from "react";

export default function IssueDetailPage() {
  const params = useParams<{ id: string; issueId: string; sprintId: string }>();
  const { mutate: deleteIssue } = useDeleteIssue();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("role"));
    }
  }, []);

  const projectId = Number(params.id);
  const issueId = Number(params.issueId);

  const { data: issue, isLoading, isError } = useViewIssue(projectId, issueId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-blue-400 rounded-full animate-ping"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (isError || !issue) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Failed to load issue
        </h3>
        <p className="text-red-600 mb-4">
          There was an error loading the issue details.
        </p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    );
  }

  const formatDateTime = (dateStr?: string | Date) => {
    if (!dateStr) return "-";
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteIssue = () => {
    deleteIssue(
      { projectId, issueId },
      {
        onSuccess: () => {
          router.push(`/project/${projectId}/board`);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Issue Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <IssueTypeIcon type={issue.issueType} size="lg" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <IssueTypeIcon
                    type={issue.issueType}
                    showLabel={true}
                    size="sm"
                  />
                  <span className="text-sm text-gray-500 font-mono bg-white px-2 py-1 rounded border">
                    #{issue.id}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {issue.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Hash className="w-4 h-4" />
                    <span>Project {issue.projectId}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span>Sprint {issue.sprintId}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatDateTime(issue.issuedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => router.push(`/project/${projectId}/board`)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Board
              </button>

              <Link
                href={`/project/${projectId}/sprint/${params.sprintId}/issue/${issueId}/effort/create`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Effort
              </Link>

              {(userRole === "ROLE_ADMIN" ||
                userRole === "ROLE_PROJECT_MANAGER" ||
                userRole === "ROLE_TEAM_LEAD") && (
                <>
                  <Link
                    href={`/project/${projectId}/sprint/${params.sprintId}/issue/${issueId}/update`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>

                  <button
                    onClick={handleDeleteIssue}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Issue Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Description
              </h2>
            </div>
            <div className="prose prose-sm max-w-none">
              {issue.description ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {issue.description}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">No description provided</p>
                  <p className="text-sm">
                    Add a description to provide more context for this issue.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Efforts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Zap className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Efforts ({issue.efforts.length})
                </h2>
              </div>
              <Link
                href={`/project/${projectId}/sprint/${params.sprintId}/issue/${issueId}/effort/create`}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Effort
              </Link>
            </div>

            {issue.efforts.length > 0 ? (
              <div className="space-y-3">
                {issue.efforts.map((effort) => (
                  <Link
                    key={effort.id}
                    href={`/project/${params.id}/sprint/${params.sprintId}/issue/${issue.id}/effort/${effort.id}`}
                    className="block group"
                  >
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-200">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                              {effort.description}
                            </span>
                            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                              #{effort.id}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{effort.user}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                {formatDateTime(effort.startTime)} -{" "}
                                {formatDateTime(effort.endTime)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="font-medium mb-1">No efforts logged yet</p>
                <p className="text-sm">
                  Start tracking time spent on this issue.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Issue Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Details</h3>
            </div>

            <div className="space-y-4">
              <DetailItem
                label="Status"
                value={
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200">
                    {issue.status}
                  </span>
                }
              />

              <DetailItem
                label="Story Points"
                value={
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                    {issue.storyPoints || 0} SP
                  </span>
                }
              />

              <DetailItem
                label="Estimated Effort"
                value={
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-purple-100 text-purple-700 border border-purple-200">
                    {issue.estimatedEffort || 0}h
                  </span>
                }
              />

              <DetailItem
                label="Issue Type"
                value={
                  <IssueTypeIcon
                    type={issue.issueType}
                    showLabel={true}
                    size="sm"
                  />
                }
              />

              <DetailItem
                label="Created"
                value={formatDateTime(issue.issuedAt)}
              />

              <DetailItem
                label="Status"
                value={
                  issue.closedAt ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-600 font-medium">
                        Completed {formatDateTime(issue.closedAt)}
                      </span>
                    </div>
                  ) : (
                    <></>
                  )
                }
              />
            </div>
          </div>

          {/* People */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Team</h3>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Assignee
                </h4>
                <div className="flex items-center gap-3">
                  <Avatar user={issue.assignee} size="md" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {issue.assignee || "Unassigned"}
                    </div>
                    <div className="text-sm text-gray-600">
                      {issue.assignee
                        ? "Responsible for this issue"
                        : "No assignee"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Creator
                </h4>
                <div className="flex items-center gap-3">
                  <Avatar user={issue.assigner} size="md" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {issue.assigner || "Unknown"}
                    </div>
                    <div className="text-sm text-gray-600">
                      Created this issue
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-1">{label}</h4>
      <div className="text-gray-900">{value}</div>
    </div>
  );
}
