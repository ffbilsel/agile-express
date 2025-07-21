"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useDeleteProject, useViewProject } from "@/hooks/projectMutations";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  Settings,
  ChevronDown,
  Users,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  Layers,
  Target,
  Calendar,
  FolderOpen,
} from "lucide-react";

interface Props {
  id: string;
  children?: React.ReactNode;
}

export default function ProjectLayout({ children }: Props) {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const { data: activeProject, isLoading } = useViewProject(Number(params.id));
  const { mutate: deleteProject } = useDeleteProject();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("role"));
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-blue-400 rounded-full animate-ping"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading project...</p>
        </div>
      </div>
    );
  }

  const id = params.id;
  const navigationItems = [
    {
      key: "backlog",
      label: "Backlog",
      icon: <Layers className="w-4 h-4" />,
      active: pathname === `/project/${id}/backlog`,
    },
    {
      key: "board",
      label: "Board",
      icon: <Target className="w-4 h-4" />,
      active: pathname === `/project/${id}/board`,
    },
    {
      key: "sprints",
      label: "Sprints",
      icon: <Calendar className="w-4 h-4" />,
      active: pathname === `/project/${id}/sprints`,
    },
    {
      key: "chart",
      label: "Chart",
      icon: <BarChart3 className="w-4 h-4" />,
      active: pathname === `/project/${id}/chart`,
    },
  ];

  const handleDeleteProject = () => {
    deleteProject(Number(params?.id), {
      onSuccess: () => {
        router.push("/");
      },
    });
  };

  // Check if user has admin or project manager permissions
  const canManageProject =
    userRole === "ROLE_ADMIN" || userRole === "ROLE_PROJECT_MANAGER";
  const canCreateIssue = canManageProject || userRole === "ROLE_TEAM_LEAD";

  return (
    <div className="space-y-6">
      {/* Enhanced Project Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200 overflow-visible">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Project Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200">
                    {activeProject?.name}
                  </span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>

                <p className="text-sm text-gray-600 mt-1">
                  Active project •{" "}
                  {(activeProject?.teamMemberUsernames?.length || 0) +
                    (activeProject?.managerUsername ? 1 : 0) +
                    (activeProject?.teamLeadUsername ? 1 : 0)}{" "}
                  team members
                </p>
              </div>
            </div>

            {/* Project Actions */}
            <div className="flex items-center gap-3">
              {/* Create Issue Button */}
              {canCreateIssue && (
                <Link
                  href={`/project/${id}/issue/create`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Create Issue
                </Link>
              )}

              {/* Project Settings Dropdown */}
              {canManageProject && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm font-medium shadow-sm"
                    aria-haspopup="true"
                    aria-expanded={settingsOpen}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        settingsOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {settingsOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                      style={{
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                      }}
                    >
                      <div className="py-2">
                        <Link
                          href={`/project/${id}/users`}
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setSettingsOpen(false)}
                        >
                          <Users className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="font-medium">Manage Users</div>
                            <div className="text-xs text-gray-500">
                              View and manage team members
                            </div>
                          </div>
                        </Link>

                        <Link
                          href={`/project/${id}/update`}
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setSettingsOpen(false)}
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="font-medium">Edit Project</div>
                            <div className="text-xs text-gray-500">
                              Update project details
                            </div>
                          </div>
                        </Link>

                        <div className="border-t border-gray-100 my-1"></div>

                        <button
                          type="button"
                          className="flex items-center gap-3 px-4 py-3 text-red-700 hover:bg-red-50 transition-colors w-full text-left"
                          onClick={() => {
                            setSettingsOpen(false);
                            handleDeleteProject();
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                          <div>
                            <div className="font-medium">Delete Project</div>
                            <div className="text-xs text-red-500">
                              Permanently remove this project
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Navigation */}
        <div className="px-6 py-4">
          <nav className="flex items-center gap-2">
            {navigationItems.map(({ key, label, icon, active }) => (
              <Link
                key={key}
                href={`/project/${id}/${key}`}
                className={`group relative inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-blue-100 text-blue-700 border border-blue-200 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <div className="relative">
                  {icon}
                  {label}

                  {/* Active indicator - positioned relative to the entire button content */}
                  {active && (
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                  )}
                </div>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Page Content */}
      <div className="space-y-6">{children}</div>
    </div>
  );
}
