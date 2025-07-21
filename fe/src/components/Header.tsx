"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SearchFilter from "./SearchFilter";
import { LogOut, Users, LayoutDashboard } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("role"));
    }
  }, []);

  const links = [
    {
      href: "/users",
      label: "Users",
      icon: <Users className="w-4 h-4" />,
      condition: userRole === "ROLE_ADMIN",
    },
    {
      href: "/",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      condition: true,
    },
  ];

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    router.push("/login");
  };

  return (
    <header className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 h-16 flex items-center justify-between shadow-lg z-50 backdrop-blur-sm">
      {/* Logo */}
      <div className="font-bold text-xl tracking-wide select-none">
        <span className="bg-white text-blue-600 px-2 py-1 rounded-md mr-2 font-extrabold">
          AE
        </span>
        Agile Express
      </div>

      <SearchFilter />

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-3">
        {links.map(({ href, label, icon, condition }) =>
          !condition ? null : (
            <Link
              key={href}
              href={href}
              className={`group relative px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                pathname === href
                  ? "bg-white text-blue-600 font-semibold shadow-md"
                  : "bg-white/10 hover:bg-white/20 backdrop-blur-sm"
              }`}
            >
              {icon}
              {label}

              {/* Active indicator */}
              {pathname === href && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
              )}
            </Link>
          )
        )}

        <div className="h-6 w-px bg-white/20 mx-2"></div>

        <button
          onClick={logout}
          className="group px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition-all duration-200 text-white shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
          Logout
        </button>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden flex items-center space-x-2">
        {links.map(({ href, label, icon, condition }) =>
          !condition ? null : (
            <Link
              key={href}
              href={href}
              className={`p-2 rounded-lg transition-all duration-200 ${
                pathname === href
                  ? "bg-white text-blue-600"
                  : "bg-white/10 hover:bg-white/20"
              }`}
              title={label}
            >
              {icon}
            </Link>
          )
        )}

        <button
          onClick={logout}
          className="p-2 rounded-lg bg-red-500 hover:bg-red-600 transition-colors text-white"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </nav>
    </header>
  );
}
