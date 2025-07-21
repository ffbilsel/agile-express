"use client";

import { useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCreateSprint } from "@/hooks/sprintMutations";
import { Calendar, Plus } from "lucide-react";

export default function CreateSprintPage() {
  const params = useParams<{ id: string }>();
  const projectId = Number(params.id);
  const router = useRouter();

  const { mutate: createSprint } = useCreateSprint();

  const [formValues, setFormValues] = useState({
    startDate: "",
    endDate: "",
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      projectId,
      startDate: new Date(formValues.startDate),
      endDate: new Date(formValues.endDate),
    };

    createSprint(payload, {
      onSuccess: () => {
        router.push(`/project/${projectId}/sprints`);
      },
    });
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Create Sprint</h1>
        <button
          type="button"
          className="text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded transition-colors"
          onClick={() => router.back()}
        >
          Cancel
        </button>
      </div>

      {/* Form Container */}
      <div className="bg-white shadow-md rounded-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
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
              Create Sprint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
