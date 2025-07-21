"use client";
import { useDashboardStatistics } from "@/hooks/dashboardMutations";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, FolderOpen, Clock, Users } from "lucide-react";

export default function Sidebar() {
  const { data } = useDashboardStatistics();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("role"));
    }
  }, []);

  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-y-auto shadow-sm">
      {/* Sticky Create Project Button */}
      {(userRole === "ROLE_ADMIN" || userRole === "ROLE_PROJECT_MANAGER") && (
        <div className="sticky top-0 bg-white p-4 border-b border-gray-100 z-10">
          <Link
            href="/project/create"
            className="group flex items-center gap-3 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-4 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            Create Project
          </Link>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen className="w-4 h-4 text-gray-500" />
          <h4 className="text-gray-700 font-semibold uppercase tracking-wide text-sm">
            Recent Projects
          </h4>
        </div>

        <div className="space-y-2">
          {data?.projects?.length ? (
            data.projects.map((project) => (
              <Link
                key={project.id}
                href={`/project/${project.id}/board`}
                className="group block p-4 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer border border-transparent hover:border-blue-200 hover:shadow-sm"
                title={project.name}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium text-gray-900 text-sm truncate flex-1">
                    {project.name}
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    <div className="w-2 h-2 bg-green-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(project.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>
                      {(project.teamMemberUsernames?.length || 0) +
                        (project.managerUsername ? 1 : 0) +
                        (project.teamLeadUsername ? 1 : 0)}{" "}
                      members
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-medium mb-1">
                No recent projects
              </p>
              <p className="text-gray-400 text-xs">
                Create your first project to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
