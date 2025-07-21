"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import IssueTypeIcon from "@/components/IssueTypeIcon";
import Avatar from "@/components/Avatar";
import {
  useGetIssues,
  useUpdateSprint,
  useViewSprint,
} from "@/hooks/sprintMutations";
import { useViewProject } from "@/hooks/projectMutations";
import {
  Calendar,
  CheckCircle2,
  Users,
  Clock,
  Target,
  MoreHorizontal,
} from "lucide-react";
import { SprintStatus } from "@/types/Sprint";
import { useEffect, useState } from "react";

export default function BoardPage() {
  const params = useParams<{ id: string }>();
  const { data: activeProject } = useViewProject(Number(params.id));
  const { data: activeSprint } = useViewSprint(
    Number(params.id),
    null,
    "ACTIVE"
  );
  const { mutate: updateSprint } = useUpdateSprint();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("role"));
    }
  }, []);

  const { data: issues, error } = useGetIssues(
    Number(params.id),
    null,
    "ACTIVE"
  );

  const safeIssues = error ? [] : issues || [];

  const getIssuesByStatus = (status: string | null) =>
    safeIssues?.filter((issue) =>
      status ? issue.status === status : !issue.status
    );

  const allStatuses = [...(activeProject?.statuses ?? []), "Unassigned"];

  const formatDate = (date?: Date | string) => {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate sprint progress
  const totalIssues = safeIssues.length;
  const completedIssues = safeIssues.filter((issue) => issue.closedAt).length;
  const progressPercentage =
    totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;

  return (
    <>
      {/* Enhanced Active Sprint Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <Link href={`/project/${params.id}/sprint/${activeSprint?.id}`}>
            <div className="block cursor-pointer group">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Active Sprint
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(activeSprint?.startDate)} —{" "}
                        {formatDate(activeSprint?.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{safeIssues.length} issues</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span>Sprint Progress</span>
                  <span>{progressPercentage}% complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Link>

          {/* Sprint Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-lg font-bold text-gray-900">
                {totalIssues}
              </div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3">
              <div className="text-lg font-bold text-emerald-600">
                {completedIssues}
              </div>
              <div className="text-xs text-emerald-600">Done</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-3">
              <div className="text-lg font-bold text-amber-600">
                {totalIssues - completedIssues}
              </div>
              <div className="text-xs text-amber-600">Remaining</div>
            </div>
          </div>

          {/* Sprint Actions */}
          {(userRole === "ROLE_ADMIN" ||
            userRole === "ROLE_PROJECT_MANAGER" ||
            userRole === "ROLE_TEAM_LEAD") && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  updateSprint({
                    projectId: Number(params.id),
                    sprintId: Number(activeSprint?.id),
                    status: SprintStatus.CANCELED,
                    startDate: activeSprint?.startDate ?? new Date(),
                    endDate: activeSprint?.endDate ?? new Date(),
                  });
                }}
                className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel Sprint
              </button>

              <button
                onClick={() => {
                  updateSprint({
                    projectId: Number(params.id),
                    sprintId: Number(activeSprint?.id),
                    status: SprintStatus.COMPLETED,
                    startDate: activeSprint?.startDate ?? new Date(),
                    endDate: activeSprint?.endDate ?? new Date(),
                  });
                }}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Complete Sprint
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Issue Columns */}
      <div className="flex gap-6 overflow-x-auto pb-6 bg-gray-50 rounded-xl p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {allStatuses.map((status) => {
          const filteredIssues =
            status === "Unassigned"
              ? getIssuesByStatus(null)
              : getIssuesByStatus(status);

          const getStatusColor = () => {
            if (status === "Unassigned")
              return "bg-gray-100 text-gray-700 border-gray-200";
            if (
              status.toLowerCase().includes("done") ||
              status.toLowerCase().includes("complete")
            ) {
              return "bg-emerald-100 text-emerald-700 border-emerald-200";
            }
            if (
              status.toLowerCase().includes("progress") ||
              status.toLowerCase().includes("develop")
            ) {
              return "bg-blue-100 text-blue-700 border-blue-200";
            }
            if (
              status.toLowerCase().includes("review") ||
              status.toLowerCase().includes("test")
            ) {
              return "bg-amber-100 text-amber-700 border-amber-200";
            }
            return "bg-purple-100 text-purple-700 border-purple-200";
          };

          return (
            <div
              key={status}
              className="min-w-[350px] bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col max-h-[75vh]"
            >
              {/* Column Header */}
              <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-100 rounded-t-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getStatusColor()}`}
                    >
                      {status}
                    </span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                      {filteredIssues?.length ?? 0}
                    </span>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Column Stats */}
                {filteredIssues && filteredIssues.length > 0 && (
                  <div className="text-xs text-gray-500">
                    {filteredIssues.reduce(
                      (sum, issue) => sum + (issue.storyPoints || 0),
                      0
                    )}{" "}
                    story points
                  </div>
                )}
              </div>

              {/* Issues Container */}
              <div className="flex-1 p-4 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {filteredIssues?.map((issue) => (
                  <Link
                    key={issue.id}
                    href={`/project/${params.id}/sprint/${activeSprint?.id}/issue/${issue.id}`}
                    className="block group"
                  >
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 group-hover:bg-blue-50/30">
                      {/* Issue Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <IssueTypeIcon type={issue.issueType} size="sm" />
                          <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate text-sm">
                            {issue.title}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                          #{issue.id}
                        </span>
                      </div>

                      {/* Description */}
                      {issue.description && (
                        <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                          {issue.description}
                        </p>
                      )}

                      {/* Issue Badges */}
                      <div className="flex flex-wrap gap-1.5 text-xs font-medium mb-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                          {issue.status || "No Status"}
                        </span>
                        {issue.storyPoints && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full border border-yellow-200">
                            {issue.storyPoints} SP
                          </span>
                        )}
                        {issue.estimatedEffort && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full border border-purple-200">
                            {issue.estimatedEffort}h
                          </span>
                        )}
                        {issue.efforts?.length > 0 && (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">
                            {issue.efforts.length} Efforts
                          </span>
                        )}
                      </div>

                      {/* Issue Footer */}
                      <div className="flex items-center justify-between">
                        {/* Avatars */}
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1">
                            <Avatar
                              user={issue.assignee}
                              size="sm"
                              className="ring-2 ring-white"
                              showTooltip={true}
                            />
                            <Avatar
                              user={issue.assigner}
                              size="sm"
                              className="ring-2 ring-white"
                              showTooltip={true}
                            />
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(issue.issuedAt)}</span>
                          </div>
                          {issue.closedAt && (
                            <div className="flex items-center gap-1 text-emerald-600">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{formatDate(issue.closedAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Empty State for Column */}
                {(!filteredIssues || filteredIssues.length === 0) && (
                  <div className="text-center py-8 text-gray-400">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      No issues in {status.toLowerCase()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
