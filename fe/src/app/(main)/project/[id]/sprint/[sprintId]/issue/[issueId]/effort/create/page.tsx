"use client";

import { useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCreateEffort } from "@/hooks/issueMutations";
import { Plus } from "lucide-react";

export default function CreateEffortPage() {
  const params = useParams<{ id: string; issueId: string; sprintId: string }>();
  const projectId = Number(params.id);
  const issueId = Number(params.issueId);

  const { mutate: createEffort } = useCreateEffort();
  const router = useRouter();

  const [formValues, setFormValues] = useState({
    description: "",
    startTime: "",
    endTime: "",
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      projectId,
      issueId,
      description: formValues.description,
      startTime: new Date(formValues.startTime),
      endTime: new Date(formValues.endTime),
    };

    createEffort(payload, {
      onSuccess: () => {
        router.push(
          `/project/${projectId}/sprint/${params.sprintId}/issue/${issueId}`
        );
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Add Effort</h1>
        <button
          className="text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded transition-colors"
          onClick={() => router.back()}
          aria-label="Cancel adding effort"
        >
          Cancel
        </button>
      </div>

      {/* Form Container */}
      <div className="bg-white shadow-md rounded-lg p-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
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
              value={formValues.description}
              onChange={(e) =>
                setFormValues((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              required
              placeholder="Describe the work done"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-y h-32"
            />
          </div>

          {/* Time Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Start Time */}
            <div>
              <label
                htmlFor="startTime"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Start Time
              </label>
              <input
                id="startTime"
                type="datetime-local"
                value={formValues.startTime}
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            {/* End Time */}
            <div>
              <label
                htmlFor="endTime"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                End Time
              </label>
              <input
                id="endTime"
                type="datetime-local"
                value={formValues.endTime}
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    endTime: e.target.value,
                  }))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
              <Plus size={16} />
              Add Effort
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
