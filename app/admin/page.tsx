import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllUsers } from "@/lib/actions/admin";
import AdminDashboard from "@/components/AdminDashboard";

export default async function AdminPage() {
  const session = await auth();
  
  // Protect Route
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    redirect("/dashboard");
  }

  const users = await getAllUsers();

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold text-leather-pop mb-8">Admin Console</h1>
      <AdminDashboard users={users} viewerRole={session.user.role} />
    </div>
  );
}

