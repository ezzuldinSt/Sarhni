import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllUsers } from "@/lib/actions/admin";
import AdminDashboard from "@/components/AdminDashboard";

export default async function OwnerPage() {
  const session = await auth();
  
  // Strict Protection
  if (!session || session.user.role !== "OWNER") {
    redirect("/dashboard"); // Bounce them out
  }

  const users = await getAllUsers();

  return (
    <div className="max-w-4xl mx-auto py-10 border-4 border-yellow-500/20 p-8 rounded-3xl">
      <h1 className="text-4xl font-bold text-yellow-500 mb-2">Owner Command Center</h1>
      <p className="text-leather-500 mb-8">With great power comes great responsibility.</p>
      
      <AdminDashboard users={users} viewerRole="OWNER" />
    </div>
  );
}

