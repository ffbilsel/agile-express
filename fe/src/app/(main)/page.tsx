"use client";
import Avatar from "@/components/Avatar";
import { useDashboardStatistics } from "@/hooks/dashboardMutations";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FolderOpen,
  CheckCircle2,
  Target,
  TrendingUp,
  Users,
  Calendar,
  ArrowRight,
  Activity,
} from "lucide-react";

export default function Dashboard() {
  const { data, isPending } = useDashboardStatistics();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      router.push("/login");
    } else {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("role"));
    }
  }, []);

  if (isPending && !data) {
    return (
      <div
        className="flex justify-center items-center min-h-[60vh]"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-blue-400 rounded-full animate-ping"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Active Projects",
      value: data?.projects.length ?? 0,
      icon: <FolderOpen className="w-6 h-6" />,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      change: "+2 this month",
    },
    {
      label: "Open Issues",
      value: data?.openIssueCount ?? 0,
      icon: <Target className="w-6 h-6" />,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      change: "12 resolved today",
    },
    {
      label: "Active Sprints",
      value: data?.activeSprintCount ?? 0,
      icon: <Activity className="w-6 h-6" />,
      color: "text-purple-600 bg-purple-50 border-purple-200",
      change: "2 ending soon",
    },
    {
      label: "Completed This Week",
      value: data?.closedIssueCount ?? 0,
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      change: "+15% from last week",
    },
  ];

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back! Here's what's happening with your projects.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-500">Today</p>
              <p className="font-semibold text-gray-900">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map(({ label, value, icon, color, change }) => (
          <div
            key={label}
            className="group bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-default"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg border ${color}`}>{icon}</div>
              <TrendingUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>

            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-sm font-medium text-gray-600">{label}</p>
              <p className="text-xs text-gray-500">{change}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Projects Section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FolderOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  My Projects
                </h2>
                <p className="text-sm text-gray-600">
                  {data?.projects.length || 0} active project
                  {data?.projects.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {(data?.projects ?? []).length === 0 &&
          (userRole === "ROLE_ADMIN" || userRole === "ROLE_PROJECT_MANAGER") ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first project to get started with Agile Express.
              </p>
              <Link
                href="/project/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FolderOpen className="w-4 h-4" />
                Create Project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/project/${project.id}/board`}
                  className="group block border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 bg-white"
                >
                  <div className="flex flex-col h-full">
                    {/* Project Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 mb-2">
                          {project.name}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                    </div>

                    {/* Project Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(project.startDate).toLocaleDateString()} -{" "}
                          {new Date(project.endDate).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Team Members */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center -space-x-2">
                            <Avatar
                              user={project.teamLeadUsername}
                              size="sm"
                              showTooltip={true}
                              className="ring-2 ring-white"
                            />
                            <Avatar
                              user={project.managerUsername}
                              size="sm"
                              showTooltip={true}
                              className="ring-2 ring-white"
                            />
                            {project.teamMemberUsernames
                              ?.slice(0, 2)
                              .map((username) => (
                                <Avatar
                                  key={username}
                                  user={username}
                                  size="sm"
                                  showTooltip={true}
                                  className="ring-2 ring-white"
                                />
                              ))}
                            {(project.teamMemberUsernames?.length || 0) > 2 && (
                              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 ring-2 ring-white">
                                +
                                {(project.teamMemberUsernames?.length || 0) - 2}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Users className="w-3 h-3" />
                          <span>
                            {(project.teamMemberUsernames?.length || 0) +
                              (project.managerUsername ? 1 : 0) +
                              (project.teamLeadUsername ? 1 : 0)}{" "}
                            members
                          </span>
                        </div>
                      </div>

                      {/* Progress Indicator */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>
                            {Math.min(
                              100,
                              Math.max(
                                0,
                                ((Date.now() -
                                  new Date(project.startDate).getTime()) /
                                  (new Date(project.endDate).getTime() -
                                    new Date(project.startDate).getTime())) *
                                  100
                              )
                            ).toFixed(2)}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{
                              width:
                                Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    ((Date.now() -
                                      new Date(project.startDate).getTime()) /
                                      (new Date(project.endDate).getTime() -
                                        new Date(
                                          project.startDate
                                        ).getTime())) *
                                      100
                                  )
                                ).toFixed(2) + "%",
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
