import Header from "@/components/Header";
import Sidebar from "@/components/Sibebar";
import React from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      <main className="ml-60 p-6">{children}</main>
    </div>
  );
}
