"use client";

import Avatar from "@/components/Avatar";
import IssueTypeIcon from "@/components/IssueTypeIcon";
import { useUpdateSprint, useViewAllSprints } from "@/hooks/sprintMutations";
import { SprintStatus } from "@/types/Sprint";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Calendar,
  Play,
  Square,
  CheckCircle2,
  Plus,
  Clock,
  Target,
  TrendingUp,
  Activity,
} from "lucide-react";

export default function SprintPage() {
  const params = useParams<{ id: string }>();
  const { data: sprints } = useViewAllSprints(Number(params.id));
  const { mutate: updateSprint } = useUpdateSprint();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("role"));
    }
  }, []);

  useEffect(() => {
    if (sprints) {
      console.log("Fetched sprints:", sprints);
    }
  }, [sprints]);

  const getSprintStatusColor = (status: string) => {
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

  const getSprintIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Activity className="w-4 h-4" />;
      case "BACKLOG":
        return <Target className="w-4 h-4" />;
      case "PLANNED":
        return <Calendar className="w-4 h-4" />;
      case "COMPLETED":
        return <CheckCircle2 className="w-4 h-4" />;
      case "CANCELED":
        return <Square className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Calculate sprint statistics
  const sprintStats = sprints
    ? {
        total: sprints.length,
        active: sprints.filter((s) => s.status === "ACTIVE").length,
        planned: sprints.filter((s) => s.status === "PLANNED").length,
        completed: sprints.filter((s) => s.status === "COMPLETED").length,
        totalIssues: sprints.reduce((sum, s) => sum + s.issues.length, 0),
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Calendar className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sprint Management
              </h1>
              <p className="text-gray-600">
                {sprintStats
                  ? `${sprintStats.total} sprint${sprintStats.total !== 1 ? "s" : ""} with ${sprintStats.totalIssues} total issues`
                  : "Manage your project sprints"}
              </p>
            </div>
          </div>

          {/* Sprint Stats */}
          {sprintStats && (
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                <div className="text-lg font-bold text-emerald-600">
                  {sprintStats.active}
                </div>
                <div className="text-xs text-emerald-600 font-medium">
                  Active
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <div className="text-lg font-bold text-purple-600">
                  {sprintStats.planned}
                </div>
                <div className="text-xs text-purple-600 font-medium">
                  Planned
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="text-lg font-bold text-gray-600">
                  {sprintStats.completed}
                </div>
                <div className="text-xs text-gray-600 font-medium">Done</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="text-lg font-bold text-blue-600">
                  {sprintStats.totalIssues}
                </div>
                <div className="text-xs text-blue-600 font-medium">Issues</div>
              </div>
            </div>
          )}

          {/* Create Sprint Button */}
          {(userRole === "ROLE_ADMIN" ||
            userRole === "ROLE_PROJECT_MANAGER" ||
            userRole === "ROLE_TEAM_LEAD") && (
            <Link
              href={`/project/${params.id}/sprint/create`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              Create Sprint
            </Link>
          )}
        </div>
      </div>

      {/* Sprint List */}
      <div className="space-y-4">
        {sprints?.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No sprints yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first sprint to start organizing and tracking your
              team's work.
            </p>
            {(userRole === "ROLE_ADMIN" ||
              userRole === "ROLE_PROJECT_MANAGER" ||
              userRole === "ROLE_TEAM_LEAD") && (
              <Link
                href={`/project/${params.id}/sprint/create`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create First Sprint
              </Link>
            )}
          </div>
        ) : (
          sprints?.map((sprint) => {
            const completedIssues = sprint.issues.filter(
              (issue) => issue.closedAt
            ).length;
            const progressPercentage =
              sprint.issues.length > 0
                ? Math.round((completedIssues / sprint.issues.length) * 100)
                : 0;

            return (
              <div
                key={sprint.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
              >
                {/* Sprint Header */}
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <Link
                      href={`/project/${params.id}/sprint/${sprint.id}`}
                      className="group flex items-center gap-4 flex-1 min-w-0"
                    >
                      <div
                        className={`p-2 rounded-lg border ${getSprintStatusColor(sprint.status)}`}
                      >
                        {getSprintIcon(sprint.status)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                            {sprint.status === "BACKLOG" ||
                            sprint.status === "ACTIVE"
                              ? `${sprint.status} SPRINT`
                              : `Sprint #${sprint.id}`}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSprintStatusColor(sprint.status)}`}
                          >
                            {sprint.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {sprint.status !== "BACKLOG" && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {sprint.startDate + " - " + sprint.endDate}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            <span>
                              {sprint.issues.length} issue
                              {sprint.issues.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          {sprint.issues.length > 0 && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              <span>{progressPercentage}% complete</span>
                            </div>
                          )}
                        </div>

                        {/* Progress Bar */}
                        {sprint.issues.length > 0 && (
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Sprint Actions */}
                    {(userRole === "ROLE_ADMIN" ||
                      userRole === "ROLE_PROJECT_MANAGER" ||
                      userRole === "ROLE_TEAM_LEAD") && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {sprint.status === "ACTIVE" && (
                          <>
                            <button
                              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                              onClick={() => {
                                updateSprint({
                                  projectId: Number(params.id),
                                  sprintId: Number(sprint?.id),
                                  status: SprintStatus.CANCELED,
                                  startDate: sprint?.startDate ?? new Date(),
                                  endDate: sprint?.endDate ?? new Date(),
                                });
                              }}
                            >
                              <Square className="w-4 h-4" />
                              Cancel
                            </button>

                            <button
                              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                              onClick={() => {
                                updateSprint({
                                  projectId: Number(params.id),
                                  sprintId: Number(sprint?.id),
                                  status: SprintStatus.COMPLETED,
                                  startDate: sprint?.startDate ?? new Date(),
                                  endDate: sprint?.endDate ?? new Date(),
                                });
                              }}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Complete
                            </button>
                          </>
                        )}

                        {sprint.status === "PLANNED" && (
                          <>
                            <button
                              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                              onClick={() => {
                                updateSprint({
                                  projectId: Number(params.id),
                                  sprintId: Number(sprint?.id),
                                  status: SprintStatus.CANCELED,
                                  startDate: sprint?.startDate ?? new Date(),
                                  endDate: sprint?.endDate ?? new Date(),
                                });
                              }}
                            >
                              <Square className="w-4 h-4" />
                              Cancel
                            </button>
                            <button
                              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                              onClick={() => {
                                updateSprint({
                                  projectId: Number(params.id),
                                  sprintId: Number(sprint?.id),
                                  status: SprintStatus.ACTIVE,
                                  startDate: sprint?.startDate ?? new Date(),
                                  endDate: sprint?.endDate ?? new Date(),
                                });
                              }}
                            >
                              <Play className="w-4 h-4" />
                              Start Sprint
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sprint Issues */}
                {sprint.issues.length > 0 && (
                  <div className="p-6">
                    <div className="space-y-3">
                      {sprint.issues.slice(0, 5).map((issue) => (
                        <Link
                          key={issue.id}
                          href={`/project/${params.id}/sprint/${sprint.id}/issue/${issue.id}`}
                          className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200 group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            {/* Issue Info */}
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <IssueTypeIcon type={issue.issueType} size="sm" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                    {issue.title}
                                  </span>
                                  <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                                    #{issue.id}
                                  </span>
                                </div>

                                {issue.description && (
                                  <p className="text-xs text-gray-600 line-clamp-1 mb-2">
                                    {issue.description}
                                  </p>
                                )}

                                <div className="flex flex-wrap gap-2 text-xs font-medium">
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded border border-gray-200">
                                    {issue.status}
                                  </span>
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded border border-yellow-200">
                                    {issue.storyPoints || 0} SP
                                  </span>
                                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded border border-purple-200">
                                    {issue.estimatedEffort || 0}h
                                  </span>
                                  {issue.efforts?.length > 0 && (
                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded border border-emerald-200">
                                      {issue.efforts.length} Effort
                                      {issue.efforts.length > 1 ? "s" : ""}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Issue Avatars */}
                            <div className="flex items-center gap-2 flex-shrink-0">
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
                          </div>
                        </Link>
                      ))}

                      {/* Show more indicator */}
                      {sprint.issues.length > 5 && (
                        <Link
                          href={`/project/${params.id}/sprint/${sprint.id}`}
                          className="block text-center py-3 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          View {sprint.issues.length - 5} more issue
                          {sprint.issues.length - 5 !== 1 ? "s" : ""}
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {/* Empty Sprint State */}
                {sprint.issues.length === 0 && (
                  <div className="p-6 text-center">
                    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      No issues in this sprint yet
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
