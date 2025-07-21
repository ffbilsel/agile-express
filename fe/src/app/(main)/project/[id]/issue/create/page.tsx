"use client";

import { useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCreateIssue } from "@/hooks/issueMutations";
import { useGetUsers } from "@/hooks/userMutations";
import { IssueType } from "@/types/Issue";
import { useViewAllSprints } from "@/hooks/sprintMutations";
import { useViewProject } from "@/hooks/projectMutations";
import { Plus } from "lucide-react";

export default function CreateIssuePage() {
  const params = useParams<{ id: string }>();
  const projectId = Number(params.id);

  const { data: activeProject } = useViewProject(projectId);
  const { mutate: createIssue } = useCreateIssue();
  const { data: users, isPending, isError } = useGetUsers(projectId);
  const { data: sprints } = useViewAllSprints(projectId);
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const payload = {
      projectId,
      sprintId: Number(
        (form.elements.namedItem("sprintId") as HTMLSelectElement).value
      ),
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      description: (
        form.elements.namedItem("description") as HTMLTextAreaElement
      ).value,
      status: (form.elements.namedItem("status") as HTMLSelectElement).value,
      storyPoints: Number(
        (form.elements.namedItem("storyPoints") as HTMLInputElement).value
      ),
      estimatedEffort: Number(
        (form.elements.namedItem("estimatedEffort") as HTMLInputElement).value
      ),
      issueType: (form.elements.namedItem("issueType") as HTMLSelectElement)
        .value as IssueType,
      assignee: selectedAssignee,
    };

    createIssue(payload, {
      onSuccess: (response) => {
        router.push(
          `/project/${projectId}/sprint/${payload.sprintId}/issue/${response.id}`
        );
      },
    });
  };

  if (isPending) return <div>Loading users...</div>;
  if (isError) return <div className="text-red-600">Failed to load users</div>;

  const availableUsers = users || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Create Issue</h1>
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
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section: Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Basic Information
            </h2>

            {/* Sprint */}
            <div className="mb-6">
              <label
                htmlFor="sprintId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Sprint
              </label>
              <select
                id="sprintId"
                name="sprintId"
                required
                defaultValue=""
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="" disabled>
                  Select a sprint
                </option>
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
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                name="title"
                placeholder="Enter issue title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
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
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue=""
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="" disabled>
                    Select a status
                  </option>
                  {activeProject?.statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="issueType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Issue Type
                </label>
                <select
                  id="issueType"
                  name="issueType"
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
                <label
                  htmlFor="storyPoints"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Story Points
                </label>
                <input
                  id="storyPoints"
                  type="number"
                  name="storyPoints"
                  min={0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label
                  htmlFor="estimatedEffort"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Estimated Effort (hours)
                </label>
                <input
                  id="estimatedEffort"
                  type="number"
                  name="estimatedEffort"
                  min={0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label
                htmlFor="assignee"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Assignee
              </label>
              <select
                id="assignee"
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">Select assignee</option>
                {availableUsers.map((user) => (
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
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition"
              onClick={() => router.back()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Plus size={16} />
              Create Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
