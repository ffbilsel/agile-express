"use client";

import { useParams, useRouter } from "next/navigation";
import { useDeleteSprint, useViewSprint } from "@/hooks/sprintMutations";
import IssueTypeIcon from "@/components/IssueTypeIcon";
import Avatar from "@/components/Avatar";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Target,
  BarChart3,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Activity,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function SprintDetailPage() {
  const params = useParams<{ id: string; sprintId: string }>();
  const { mutate: deleteSprint } = useDeleteSprint();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("role"));
    }
  }, []);

  const projectId = Number(params.id);
  const sprintId = Number(params.sprintId);

  const {
    data: sprint,
    isLoading,
    isError,
  } = useViewSprint(projectId, sprintId, null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-blue-400 rounded-full animate-ping"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading sprint details...</p>
        </div>
      </div>
    );
  }

  if (isError || !sprint) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Failed to load sprint
        </h3>
        <p className="text-red-600 mb-4">
          There was an error loading the sprint details.
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

  // Format dates if they exist
  const formattedStartDate = sprint.startDate
    ? new Date(sprint.startDate).toLocaleDateString()
    : "";
  const formattedEndDate = sprint.endDate
    ? new Date(sprint.endDate).toLocaleDateString()
    : "";

  // Calculate sprint statistics
  const totalIssues = sprint.issues.length;
  const completedIssues = sprint.issues.filter(
    (issue) => issue.closedAt
  ).length;
  const inProgressIssues = totalIssues - completedIssues;
  const totalStoryPoints = sprint.issues.reduce(
    (sum, issue) => sum + (issue.storyPoints || 0),
    0
  );
  const completedStoryPoints = sprint.issues
    .filter((issue) => issue.closedAt)
    .reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);
  const progressPercentage =
    totalStoryPoints > 0
      ? Math.round((completedStoryPoints / totalStoryPoints) * 100)
      : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "BACKLOG":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "PLANNED":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "COMPLETED":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "CANCELED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Activity className="w-5 h-5" />;
      case "BACKLOG":
        return <Target className="w-5 h-5" />;
      case "PLANNED":
        return <Calendar className="w-5 h-5" />;
      case "COMPLETED":
        return <CheckCircle2 className="w-5 h-5" />;
      case "CANCELED":
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const handleDeleteSprint = () => {
    deleteSprint(
      { projectId, sprintId },
      {
        onSuccess: () => {
          router.push(`/project/${projectId}/sprints`);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Sprint Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div
                className={`p-3 bg-white rounded-xl shadow-sm border ${getStatusColor(sprint.status)}`}
              >
                {getStatusIcon(sprint.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(sprint.status)}`}
                  >
                    {sprint.status}
                  </span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Sprint #{sprint.id}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {formattedStartDate && formattedEndDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formattedStartDate} — {formattedEndDate}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span>
                      {totalIssues} issue{totalIssues !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{progressPercentage}% complete</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              {(userRole === "ROLE_ADMIN" ||
                userRole === "ROLE_PROJECT_MANAGER" ||
                userRole === "ROLE_TEAM_LEAD") && (
                <>
                  <Link
                    href={`/project/${projectId}/sprint/${sprintId}/update`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>

                  <button
                    onClick={handleDeleteSprint}
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

        {/* Sprint Progress */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {totalIssues}
                  </div>
                  <div className="text-sm text-blue-600 font-medium">
                    Total Issues
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {completedIssues}
                  </div>
                  <div className="text-sm text-emerald-600 font-medium">
                    Completed
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-600 rounded-lg">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-600">
                    {inProgressIssues}
                  </div>
                  <div className="text-sm text-amber-600 font-medium">
                    In Progress
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {totalStoryPoints}
                  </div>
                  <div className="text-sm text-purple-600 font-medium">
                    Story Points
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span className="font-medium">Sprint Progress</span>
              <span>{progressPercentage}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Sprint Issues */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100 bg-gray-50 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Sprint Issues
                </h2>
                <p className="text-sm text-gray-600">
                  {totalIssues} issue{totalIssues !== 1 ? "s" : ""} in this
                  sprint
                </p>
              </div>
            </div>

            <Link
              href={`/project/${projectId}/issue/create`}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Issue
            </Link>
          </div>
        </div>

        <div className="p-6">
          {sprint.issues.length > 0 ? (
            <div className="space-y-4">
              {sprint.issues.map((issue) => (
                <Link
                  key={issue.id}
                  href={`/project/${projectId}/sprint/${sprintId}/issue/${issue.id}`}
                  className="block group"
                >
                  <div className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200 group-hover:bg-blue-50/30">
                    <div className="flex items-start justify-between gap-4">
                      {/* Issue Info */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 mt-1">
                          <IssueTypeIcon type={issue.issueType} size="md" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                              #{issue.id}
                            </span>
                            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                              {issue.title}
                            </h3>
                            {issue.closedAt && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            )}
                          </div>

                          {issue.description && (
                            <p className="text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                              {issue.description}
                            </p>
                          )}

                          {/* Issue Badges */}
                          <div className="flex flex-wrap gap-2 text-sm font-medium">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                              {issue.status}
                            </span>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full border border-yellow-200">
                              {issue.storyPoints || 0} SP
                            </span>
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full border border-purple-200">
                              {issue.estimatedEffort || 0}h
                            </span>
                            {issue.efforts?.length > 0 && (
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">
                                {issue.efforts.length} Effort
                                {issue.efforts.length > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Issue Meta */}
                      <div className="flex flex-col items-end gap-3 flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1">
                            <Avatar
                              user={issue.assignee}
                              size="sm"
                              className="ring-2 ring-white"
                            />
                            <Avatar
                              user={issue.assigner}
                              size="sm"
                              className="ring-2 ring-white"
                            />
                          </div>
                        </div>

                        <div className="text-xs text-gray-500 text-right">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {issue.closedAt
                                ? `Completed ${new Date(issue.closedAt).toLocaleDateString()}`
                                : `Created ${new Date(issue.issuedAt).toLocaleDateString()}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No issues in this sprint
              </h3>
              <p className="text-gray-600 mb-6">
                Add issues to this sprint to start tracking progress.
              </p>
              <Link
                href={`/project/${projectId}/issue/create`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create First Issue
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Sprint Insights */}
      {sprint.issues.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Completion Rate</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Issues completed</span>
                <span className="font-semibold">
                  {completedIssues}/{totalIssues}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Story points completed
                </span>
                <span className="font-semibold">
                  {completedStoryPoints}/{totalStoryPoints}
                </span>
              </div>
              <div className="pt-2">
                <div className="text-2xl font-bold text-emerald-600">
                  {progressPercentage}%
                </div>
                <div className="text-sm text-gray-600">Overall progress</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Team Activity</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Total efforts logged
                </span>
                <span className="font-semibold">
                  {sprint.issues.reduce(
                    (sum, issue) => sum + (issue.efforts?.length || 0),
                    0
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Active contributors
                </span>
                <span className="font-semibold">
                  {
                    new Set([
                      ...sprint.issues.map((i) => i.assignee).filter(Boolean),
                      ...sprint.issues.map((i) => i.assigner).filter(Boolean),
                    ]).size
                  }
                </span>
              </div>
              <div className="pt-2">
                <div className="text-sm text-gray-600">
                  Sprint {sprint.status.toLowerCase()}
                  {formattedEndDate && ` • Ends ${formattedEndDate}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
