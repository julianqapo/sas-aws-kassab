import { Sidebar } from "../components/Sidebar";
import { getSessionUser } from "../db_service";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  const email = user?.email || "";

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
      <Sidebar userEmail={email} />
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        {children}
      </main>
    </div>
  );
}
