"use client";

import { useParams, useRouter } from "next/navigation";
import Avatar from "@/components/Avatar";
import { useGetUsers, useSetRole } from "@/hooks/userMutations";
import { UserRole } from "@/types/User";
import { ArrowLeft, Users, Settings, Loader2 } from "lucide-react";

export default function UsersTable({ getAll }: { getAll?: boolean }) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = params.id ?? null;

  const {
    data: users,
    isLoading,
    isPending,
  } = useGetUsers(Number(projectId), getAll);
  const { mutate: updateRole } = useSetRole();

  const handleRoleChange = (username: string, role: string) => {
    updateRole(
      { username, newRole: role as UserRole },
      {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      }
    );
  };

  if (isLoading || isPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "project_manager":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "team_lead":
        return "bg-green-100 text-green-700 border-green-200";
      case "team_member":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatRoleDisplay = (role: string) => {
    return role.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Users Management
              </h1>
              <p className="text-gray-600 text-sm">
                {getAll ? "All system users" : "Project team members"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {users?.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-gray-500">
              {getAll
                ? "No users are currently in the system."
                : "No users found for this project."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                    User
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                    Username
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                    Current Role
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Actions
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users?.map((user, index) => (
                  <tr
                    key={user.username}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar user={user.username} size="md" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {user.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            User #{index + 1}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded border">
                        {user.username}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`
                        inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border
                        ${getRoleBadgeColor(user.role)}
                      `}
                      >
                        {formatRoleDisplay(user.role)}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user.username, e.target.value)
                          }
                          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                        >
                          <option value="admin">ADMIN</option>
                          <option value="project_manager">
                            PROJECT MANAGER
                          </option>
                          <option value="team_lead">TEAM LEAD</option>
                          <option value="team_member">TEAM MEMBER</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {users && users.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                Showing{" "}
                <span className="font-medium text-gray-900">
                  {users.length}
                </span>{" "}
                user{users.length !== 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>All users active</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
