"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUpdateSprint, useViewSprint } from "@/hooks/sprintMutations";
import { Calendar, Save } from "lucide-react";
import type { SprintStatus } from "@/types/Sprint";

export default function UpdateSprintPage() {
  const params = useParams<{ id: string; sprintId: string }>();
  const projectId = Number(params.id);
  const sprintId = Number(params.sprintId);
  const router = useRouter();

  const {
    data: sprint,
    isLoading,
    isError,
  } = useViewSprint(projectId, sprintId);
  const { mutate: updateSprint } = useUpdateSprint();

  const [formValues, setFormValues] = useState({
    startDate: "",
    endDate: "",
    status: "PLANNED" as SprintStatus,
  });

  useEffect(() => {
    if (sprint) {
      setFormValues({
        startDate: sprint.startDate
          ? new Date(sprint.startDate).toISOString().split("T")[0]
          : "",
        endDate: sprint.endDate
          ? new Date(sprint.endDate).toISOString().split("T")[0]
          : "",
        status: sprint.status || "PLANNED",
      });
    }
  }, [sprint]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateSprint(
      {
        projectId,
        sprintId,
        startDate: new Date(formValues.startDate),
        endDate: new Date(formValues.endDate),
        status: formValues.status,
      },
      {
        onSuccess: () => {
          router.push(`/project/${projectId}/sprint/${sprintId}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40 text-gray-500">
        Loading sprint...
      </div>
    );
  }
  if (isError || !sprint) {
    return (
      <div className="text-red-600 text-center py-6">
        Failed to load sprint.
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Sprint</h1>
        <button
          onClick={() => router.back()}
          className="text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Form Container */}
      <div className="bg-white shadow-md rounded-lg p-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Start Date */}
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Start Date
            </label>
            <div className="relative">
              <input
                id="startDate"
                type="date"
                value={formValues.startDate}
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition pr-10"
              />
              <Calendar
                size={18}
                className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              End Date
            </label>
            <div className="relative">
              <input
                id="endDate"
                type="date"
                value={formValues.endDate}
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition pr-10"
              />
              <Calendar
                size={18}
                className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
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
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
