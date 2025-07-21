"use client";

import { useParams } from "next/navigation";
import Avatar from "@/components/Avatar";
import IssueTypeIcon from "@/components/IssueTypeIcon";
import { useGetIssues, useViewSprint } from "@/hooks/sprintMutations";
import { useViewProject } from "@/hooks/projectMutations";
import Link from "next/link";
import { Layers, Calendar, Clock, Target, Plus } from "lucide-react";

export default function BacklogPage() {
  const params = useParams<{ id: string }>();
  const { data: activeProject } = useViewProject(Number(params.id));
  const { data: backlogSprint } = useViewSprint(
    Number(params.id),
    null,
    "BACKLOG"
  );

  const { data: backlogIssues } = useGetIssues(
    activeProject?.id,
    null,
    "BACKLOG"
  );

  // Calculate backlog statistics
  const totalStoryPoints =
    backlogIssues?.reduce((sum, issue) => sum + (issue.storyPoints || 0), 0) ||
    0;
  const totalEstimatedHours =
    backlogIssues?.reduce(
      (sum, issue) => sum + (issue.estimatedEffort || 0),
      0
    ) || 0;
  const issuesByType =
    backlogIssues?.reduce(
      (acc, issue) => {
        acc[issue.issueType] = (acc[issue.issueType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ) || {};

  return (
    <div className="space-y-6">
      {/* Enhanced Backlog Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Layers className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Product Backlog
              </h2>
              <p className="text-gray-600">
                {backlogIssues?.length || 0} issue
                {backlogIssues?.length !== 1 ? "s" : ""} ready for sprint
                planning
              </p>
            </div>
          </div>

          {/* Backlog Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="text-lg font-bold text-blue-600">
                {backlogIssues?.length || 0}
              </div>
              <div className="text-xs text-blue-600 font-medium">Issues</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <div className="text-lg font-bold text-purple-600">
                {totalStoryPoints}
              </div>
              <div className="text-xs text-purple-600 font-medium">
                Story Points
              </div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
              <div className="text-lg font-bold text-emerald-600">
                {totalEstimatedHours}h
              </div>
              <div className="text-xs text-emerald-600 font-medium">
                Estimated
              </div>
            </div>
          </div>
        </div>

        {/* Issue Type Distribution */}
        {Object.keys(issuesByType).length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Issue Type Distribution
            </h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(issuesByType).map(([type, count]) => (
                <div key={type} className="flex items-center gap-2">
                  <IssueTypeIcon type={type as any} size="sm" />
                  <span className="text-sm text-gray-600 font-medium">
                    {type}: {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Backlog Issues */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100 bg-gray-50 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-600 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  All Backlog Issues
                </h3>
                <p className="text-sm text-gray-600">
                  Issues waiting to be assigned to a sprint
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/project/${params.id}/issue/create`}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Issue
              </Link>
            </div>
          </div>
        </div>

        <div className="p-6">
          {!backlogIssues || backlogIssues.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Layers className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No backlog issues
              </h3>
              <p className="text-gray-600 mb-6">
                Start by creating your first issue to build your product
                backlog.
              </p>
              <Link
                href={`/project/${params.id}/issue/create`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create First Issue
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {backlogIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="group border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all duration-200 hover:bg-blue-50/20"
                >
                  <Link
                    href={`/project/${params.id}/sprint/${backlogSprint?.id}/issue/${issue.id}`}
                    className="block focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Issue Info */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 mt-1">
                          <IssueTypeIcon type={issue.issueType} size="md" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                              #{issue.id}
                            </span>
                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-lg">
                              {issue.title}
                            </h4>
                          </div>

                          {issue.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                              {issue.description}
                            </p>
                          )}

                          {/* Issue Badges */}
                          <div className="flex flex-wrap gap-2 text-xs font-medium">
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                              {issue.status || "No Status"}
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
                      <div className="flex flex-col lg:items-end gap-3 flex-shrink-0">
                        {/* Team Members */}
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <Avatar user={issue.assignee} size="sm" />
                            <span className="text-xs text-gray-500 mt-1 font-medium">
                              Assignee
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            <Avatar user={issue.assigner} size="sm" />
                            <span className="text-xs text-gray-500 mt-1 font-medium">
                              Creator
                            </span>
                          </div>
                        </div>

                        {/* Issue Dates */}
                        <div className="text-xs text-gray-500 text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              Created{" "}
                              {new Date(issue.issuedAt).toLocaleDateString()}
                            </span>
                          </div>
                          {issue.closedAt && (
                            <div className="flex items-center gap-1 text-emerald-600">
                              <Clock className="w-3 h-3" />
                              <span>
                                Completed{" "}
                                {new Date(issue.closedAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
