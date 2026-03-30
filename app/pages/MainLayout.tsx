import { Outlet } from "react-router";
import { Sidebar } from "../components/Sidebar";

export function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <Outlet />
      </main>
    </div>
  );
}