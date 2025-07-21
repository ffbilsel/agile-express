"use client";

import { useEffect, useState, FormEvent, KeyboardEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUpdateProject, useViewProject } from "@/hooks/projectMutations";
import { useGetUsers } from "@/hooks/userMutations";
import { UserRole } from "@/types/User";
import { Plus, X } from "lucide-react";

export default function UpdateProjectPage() {
  const params = useParams<{ id: string }>();
  const projectId = Number(params.id);
  const router = useRouter();

  const [statuses, setStatuses] = useState<string[]>([]);
  const [statusInput, setStatusInput] = useState("");

  // useViewProject is a useQuery now
  const { data: project } = useViewProject(projectId);

  // useUpdateProject remains a mutation
  const { mutate: updateProject } = useUpdateProject();

  // useGetUsers should be a useQuery, so destructure data and refetch
  const {
    data: users,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useGetUsers();

  const [formValues, setFormValues] = useState({
    name: "",
    manager: "",
    teamLead: "",
    teamMembers: [] as string[],
    startDate: "",
    endDate: "",
  });

  // Fetch users if none loaded yet
  useEffect(() => {
    if (!users && !usersLoading) {
      refetchUsers();
    }
  }, [users, usersLoading, refetchUsers]);

  // When project data loads, populate form
  useEffect(() => {
    if (project) {
      setFormValues({
        name: project.name,
        manager: project.managerUsername || "",
        teamLead: project.teamLeadUsername || "",
        teamMembers: project.teamMemberUsernames || [],
        startDate: project.startDate?.split("T")[0] || "",
        endDate: project.endDate?.split("T")[0] || "",
      });

      setStatuses(project.statuses ?? []);
    }
  }, [project]);

  const handleStatusKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = statusInput.trim();
      if (trimmed && !statuses.includes(trimmed)) {
        setStatuses((prev) => [...prev, trimmed]);
      }
      setStatusInput("");
    }
  };

  const removeStatus = (status: string) => {
    setStatuses((prev) => prev.filter((s) => s !== status));
  };

  // Add team member (if not already in the list)
  const addTeamMember = (username: string) => {
    setFormValues((prev) => {
      if (!prev.teamMembers.includes(username)) {
        return {
          ...prev,
          teamMembers: [...prev.teamMembers, username],
        };
      }
      return prev;
    });
  };

  // Remove team member from selected list
  const removeTeamMember = (username: string) => {
    setFormValues((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((u) => u !== username),
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      projectId,
      name: formValues.name,
      manager: formValues.manager,
      teamLead: formValues.teamLead,
      teamMembers: formValues.teamMembers,
      statuses,
      startDate: new Date(formValues.startDate),
      endDate: new Date(formValues.endDate),
    };

    updateProject(payload, {
      onSuccess: () => {
        router.back();
      },
    });
  };

  // Filter users to show in team members dropdown
  const availableTeamMembers = users?.filter(
    (u) =>
      u.role === UserRole.TEAM_MEMBER &&
      !formValues.teamMembers.includes(u.username)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Project</h1>
        <button
          className="text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded transition-colors"
          onClick={() => router.back()}
        >
          Cancel
        </button>
      </div>

      {/* Card */}
      <div className="bg-white shadow-md rounded-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section: Basic Info */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formValues.name}
                  onChange={(e) =>
                    setFormValues((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  placeholder="Enter project name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Manager
                </label>
                <select
                  value={formValues.manager}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      manager: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="">Select project manager</option>
                  {users
                    ?.filter((u) => u.role === UserRole.PROJECT_MANAGER)
                    .map((u) => (
                      <option key={u.username} value={u.username}>
                        {u.username}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Team */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Team Setup
            </h2>

            {/* 2-column grid for inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Lead
                </label>
                <select
                  value={formValues.teamLead}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      teamLead: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="">Select project lead</option>
                  {users
                    ?.filter((u) => u.role === UserRole.TEAM_LEAD)
                    .map((u) => (
                      <option key={u.username} value={u.username}>
                        {u.username}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add Team Member
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addTeamMember(e.target.value);
                      e.target.value = ""; // reset select after add
                    }
                  }}
                  defaultValue=""
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="">Select member</option>
                  {availableTeamMembers?.map((u) => (
                    <option key={u.username} value={u.username}>
                      {u.username}
                    </option>
                  ))}
                </select>

                {/* Selected members badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {formValues.teamMembers.map((username) => (
                    <span
                      key={username}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-1"
                    >
                      {username}
                      <X
                        size={16}
                        className="cursor-pointer hover:text-blue-900"
                        onClick={() => removeTeamMember(username)}
                      />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Statuses */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Project Statuses
            </h2>
            <input
              type="text"
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value)}
              onKeyDown={handleStatusKeyDown}
              placeholder="Type a status and press Enter"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {statuses.map((status) => (
                <span
                  key={status}
                  className="bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1"
                >
                  {status}
                  <X
                    size={16}
                    className="cursor-pointer hover:text-green-900"
                    onClick={() => removeStatus(status)}
                  />
                </span>
              ))}
            </div>
          </div>

          {/* Section: Timeline */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Project Timeline
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formValues.startDate}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={formValues.endDate}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
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
              <Plus size={18} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
