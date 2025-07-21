"use client";

import { useParams } from "next/navigation";
import { useGetUsers } from "@/hooks/userMutations";
import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useUpdateIssue, useViewIssue } from "@/hooks/issueMutations";
import { useViewAllSprints } from "@/hooks/sprintMutations";
import { useViewProject } from "@/hooks/projectMutations";
import { IssueType } from "@/types/Issue";
import { Save } from "lucide-react";

export default function UpdateIssuePage() {
  const params = useParams<{ id: string; issueId: string }>();
  const projectId = Number(params.id);
  const issueId = Number(params.issueId);
  const router = useRouter();

  const { data: issue, isLoading, isError } = useViewIssue(projectId, issueId);
  const { mutate: updateIssue } = useUpdateIssue();
  const { data: sprints } = useViewAllSprints(projectId);
  const { data: users, isPending: usersLoading } = useGetUsers(projectId);
  const { data: project } = useViewProject(projectId);

  const [formValues, setFormValues] = useState({
    newSprintId: 0,
    title: "",
    description: "",
    status: "",
    storyPoints: 0,
    estimatedEffort: 0,
    issueType: IssueType.TASK,
    assignee: "",
  });

  useEffect(() => {
    if (issue) {
      setFormValues({
        newSprintId: issue.sprintId ?? 0,
        title: issue.title ?? "",
        description: issue.description ?? "",
        status: issue.status ?? "",
        storyPoints: issue.storyPoints ?? 0,
        estimatedEffort: issue.estimatedEffort ?? 0,
        issueType: issue.issueType ?? IssueType.TASK,
        assignee: issue.assignee ?? "",
      });
    }
  }, [issue]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    updateIssue(
      {
        projectId,
        newSprintId: formValues.newSprintId,
        issueId,
        title: formValues.title,
        description: formValues.description,
        status: formValues.status,
        storyPoints: formValues.storyPoints,
        estimatedEffort: formValues.estimatedEffort,
        issueType: formValues.issueType,
        assignee: formValues.assignee,
      },
      {
        onSuccess: () => {
          router.push(
            `/project/${projectId}/sprint/${formValues.newSprintId}/issue/${issueId}`
          );
        },
      }
    );
  };

  if (isLoading || usersLoading) {
    return (
      <div className="flex justify-center items-center h-40 text-gray-500">
        Loading issue...
      </div>
    );
  }
  if (isError || !issue) {
    return (
      <div className="text-red-600 text-center py-6">Failed to load issue</div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Issue</h1>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Form Container */}
      <div className="bg-white shadow-md rounded-lg p-8">
        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Section: Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Basic Information
            </h2>

            {/* Sprint */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sprint
              </label>
              <select
                value={formValues.newSprintId}
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    newSprintId: Number(e.target.value),
                  }))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                {sprints?.map((sprint) => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.status === "BACKLOG" || sprint.status === "ACTIVE"
                      ? sprint.status
                      : `${sprint.startDate} — ${sprint.endDate}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formValues.title}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, title: e.target.value }))
                }
                required
                placeholder="Enter issue title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formValues.description}
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe the issue..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-y h-28"
              />
            </div>
          </div>

          {/* Section: Issue Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Issue Details
            </h2>

            {/* Status & Issue Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formValues.status || ""}
                  required
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="" disabled>
                    Select status
                  </option>
                  {project?.statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Type
                </label>
                <select
                  value={formValues.issueType}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      issueType: e.target.value as IssueType,
                    }))
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  {Object.values(IssueType).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Story Points & Estimated Effort */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Story Points
                </label>
                <input
                  type="number"
                  value={formValues.storyPoints}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      storyPoints: Number(e.target.value),
                    }))
                  }
                  min={0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Effort (hours)
                </label>
                <input
                  type="number"
                  value={formValues.estimatedEffort}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      estimatedEffort: Number(e.target.value),
                    }))
                  }
                  min={0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignee
              </label>
              <select
                value={formValues.assignee || ""}
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    assignee: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">Select assignee</option>
                {users?.map((user) => (
                  <option key={user.username} value={user.username}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Save size={16} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
