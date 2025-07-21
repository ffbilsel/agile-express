"use client";

import { useCreateProject } from "@/hooks/projectMutations";
import { useGetUsers } from "@/hooks/userMutations";
import { User, UserRole } from "@/types/User";
import {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { ProjectCreatePayload } from "@/types/request/ProjectPayload";

export default function CreateProject() {
  const { data, isLoading, isError, refetch } = useGetUsers();
  const { mutate: createProject } = useCreateProject();
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [statusInput, setStatusInput] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!data && !isLoading) {
      refetch();
    }
    if (!hasInitialized && data && data.length > 0) {
      const teamMembers = data.filter(
        (user) => user.role === UserRole.TEAM_MEMBER
      );
      setSelectedMembers(teamMembers.slice(0, 2));
      setHasInitialized(true);
    }
  }, [data, isLoading, refetch, hasInitialized]);

  const removeMember = (username: string) => {
    setSelectedMembers((prev) =>
      prev.filter((user) => user.username !== username)
    );
  };

  const addMember = (e: ChangeEvent<HTMLSelectElement>) => {
    const username = e.target.value;
    if (!username || !data) return;

    const userToAdd = data.find(
      (user) => user.username === username && user.role === UserRole.TEAM_MEMBER
    );

    if (
      userToAdd &&
      !selectedMembers.some((user) => user.username === username)
    ) {
      setSelectedMembers((prev) => [...prev, userToAdd]);
    }
    e.target.selectedIndex = 0;
  };

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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const payload: ProjectCreatePayload = {
      name: form.projectName.value,
      manager: form.projectManager.value,
      teamMembers: selectedMembers.map((user) => user.username),
      statuses,
      startDate: new Date(form.startDate.value),
      endDate: new Date(form.endDate.value),
      teamLead: form.projectLead.value,
    };
    const teamLead = form.projectLead.value;
    if (teamLead) payload.teamLead = teamLead;

    createProject(payload, {
      onSuccess: () => {
        router.push("/");
      },
    });
  };

  if (isLoading) return <div>Loading users...</div>;
  if (isError) return <div className="text-red-600">Failed to load users</div>;

  const availableMembers = data
    ?.filter(
      (user) =>
        user.role === UserRole.TEAM_MEMBER &&
        !selectedMembers.some((sel) => sel.username === user.username)
    )
    .sort((a, b) => a.username.localeCompare(b.username));

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Create Project</h1>
        <button
          onClick={() => router.back()}
          className="text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded transition-colors"
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
                  name="projectName"
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
                  name="projectManager"
                  defaultValue=""
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="" disabled>
                    Select project manager
                  </option>
                  {data
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
                  name="projectLead"
                  defaultValue=""
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="">Select project lead</option>
                  {data
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
                  onChange={addMember}
                  defaultValue=""
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="">Select member</option>
                  {availableMembers?.map((u) => (
                    <option key={u.username} value={u.username}>
                      {u.username}
                    </option>
                  ))}
                </select>

                {/* Selected members badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedMembers.map((user) => (
                    <span
                      key={user.username}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-1"
                    >
                      {user.username}
                      <X
                        size={16}
                        className="cursor-pointer hover:text-blue-900"
                        onClick={() => removeMember(user.username)}
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
                  name="startDate"
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
                  name="endDate"
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
              <Plus size={18} /> Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
