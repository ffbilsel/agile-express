"use client";

import { useDeleteEffort, useViewEffort } from "@/hooks/issueMutations";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Clock,
  User,
  Calendar,
  Zap,
  Hash,
  AlertTriangle,
  FileText,
  Target,
} from "lucide-react";
import React from "react";

export default function EffortDetailPage() {
  const params = useParams<{
    id: string;
    sprintId: string;
    issueId: string;
    effortId: string;
  }>();
  const projectId = Number(params.id);
  const sprintId = Number(params.sprintId);
  const issueId = Number(params.issueId);
  const effortId = Number(params.effortId);
  const router = useRouter();

  const {
    data: effort,
    isLoading,
    isError,
  } = useViewEffort(projectId, issueId, effortId);

  const { mutate: deleteEffort } = useDeleteEffort();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-emerald-400 rounded-full animate-ping"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading effort details...</p>
        </div>
      </div>
    );
  }

  if (isError || !effort) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Failed to load effort
        </h3>
        <p className="text-red-600 mb-4">
          There was an error loading the effort details.
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

  // Helper to format datetime nicely
  const formatDateTime = (dtStr: string | Date) => {
    const date = typeof dtStr === "string" ? new Date(dtStr) : dtStr;
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate effort duration
  const startTime = new Date(effort.startTime);
  const endTime = new Date(effort.endTime);
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
  const durationMinutes = Math.round(
    (durationMs % (1000 * 60 * 60)) / (1000 * 60)
  );

  const handleDeleteEffort = () => {
    deleteEffort(
      { projectId, issueId, effortId },
      {
        onSuccess: () => {
          router.push(
            `/project/${projectId}/sprint/${sprintId}/issue/${issueId}`
          );
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Effort Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-emerald-200">
                <Zap className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                    EFFORT
                  </span>
                  <span className="text-sm text-gray-500 font-mono bg-white px-2 py-1 rounded border">
                    #{effort.id}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Effort for Issue #{effort.issueId}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{effort.user}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {durationHours}h {durationMinutes}m
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDateTime(effort.startTime)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() =>
                  router.push(
                    `/project/${projectId}/sprint/${sprintId}/issue/${issueId}`
                  )
                }
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Issue
              </button>

              <Link
                href={`/project/${projectId}/sprint/${sprintId}/issue/${issueId}/effort/${effortId}/update`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Edit className="w-4 h-4" />
                Edit Effort
              </Link>

              <button
                onClick={handleDeleteEffort}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Effort Content Grid */}
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
                Work Description
              </h2>
            </div>
            <div className="prose prose-sm max-w-none">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-800 leading-relaxed whitespace-pre-wrap">
                {effort.description}
              </div>
            </div>
          </div>

          {/* Time Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Time Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </h4>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {formatDateTime(effort.startTime)}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </h4>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {formatDateTime(effort.endTime)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600 mb-2">
                    {durationHours}h {durationMinutes}m
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Total time spent
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Effort Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Hash className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Details</h3>
            </div>

            <div className="space-y-4">
              <DetailItem
                label="Effort ID"
                value={
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    #{effort.id}
                  </span>
                }
              />

              <DetailItem
                label="Issue ID"
                value={
                  <Link
                    href={`/project/${projectId}/sprint/${sprintId}/issue/${issueId}`}
                    className="inline-flex items-center gap-1 font-mono text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                  >
                    <Target className="w-3 h-3" />#{effort.issueId}
                  </Link>
                }
              />

              <DetailItem
                label="User"
                value={
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200">
                    <User className="w-4 h-4" />
                    {effort.user}
                  </span>
                }
              />

              <DetailItem
                label="Duration"
                value={
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200">
                    <Clock className="w-4 h-4" />
                    {durationHours}h {durationMinutes}m
                  </span>
                }
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Zap className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Quick Actions
              </h3>
            </div>

            <div className="space-y-3">
              <Link
                href={`/project/${projectId}/sprint/${sprintId}/issue/${issueId}/effort/${effortId}/update`}
                className="block w-full text-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                Edit this effort
              </Link>

              <Link
                href={`/project/${projectId}/sprint/${sprintId}/issue/${issueId}/effort/create`}
                className="block w-full text-center px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
              >
                Log new effort
              </Link>

              <Link
                href={`/project/${projectId}/sprint/${sprintId}/issue/${issueId}`}
                className="block w-full text-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                View issue details
              </Link>
            </div>
          </div>

          {/* Effort Statistics */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-600 rounded-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-emerald-900">
                Time Analysis
              </h3>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-emerald-700">Duration:</span>
                <span className="font-semibold text-emerald-900">
                  {durationHours}h {durationMinutes}m
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-emerald-700">Started:</span>
                <span className="font-mono text-emerald-900">
                  {startTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-emerald-700">Ended:</span>
                <span className="font-mono text-emerald-900">
                  {endTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="pt-2 border-t border-emerald-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {Math.round(durationMs / (1000 * 60))}
                  </div>
                  <div className="text-xs text-emerald-700 font-medium">
                    Total minutes
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
