"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { toggleBan, updateUserRole, deleteUserCompletely } from "@/lib/actions/admin";
import { toast } from "sonner";
import { Shield, ShieldAlert, Ban, Trash2, CheckCircle } from "lucide-react";

export default function AdminDashboard({ users, viewerRole }: { users: any[], viewerRole: string }) {
  const [userList, setUserList] = useState(users);

  const handleBan = async (id: string) => {
    const res = await toggleBan(id);
    if (res?.error) return toast.error(res.error);
    
    // Optimistic Update
    setUserList(prev => prev.map(u => u.id === id ? { ...u, isBanned: !u.isBanned } : u));
    toast.success("User status updated");
  };

  const handlePromote = async (id: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    const res = await updateUserRole(id, newRole);
    if (res?.error) return toast.error(res.error);
    
    setUserList(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
    toast.success(`User is now ${newRole}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("NUCLEAR WARNING: This will erase the user and ALL their data forever. Proceed?")) return;
    
    const res = await deleteUserCompletely(id);
    if (res?.error) return toast.error(res.error);
    
    setUserList(prev => prev.filter(u => u.id !== id));
    toast.success("User erased from existence.");
  };

  return (
    <div className="space-y-4">
      {userList.map((user) => (
        <Card key={user.id} className="flex flex-col md:flex-row items-center justify-between p-4 gap-4 bg-leather-800/50">
          
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                user.role === 'OWNER' ? 'bg-yellow-500 text-black' : 
                user.role === 'ADMIN' ? 'bg-red-500 text-white' : 'bg-leather-600'
            }`}>
              {user.role === 'OWNER' ? '👑' : user.username[0].toUpperCase()}
            </div>
            <div>
              <p className="font-bold flex items-center gap-2">
                {user.username}
                {user.isBanned && <span className="text-xs bg-red-900 text-red-200 px-2 py-0.5 rounded">BANNED</span>}
              </p>
              <p className="text-xs text-leather-500 font-mono">{user.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* ADMIN ACTIONS */}
            {user.role !== "OWNER" && (
                <Button 
                    onClick={() => handleBan(user.id)}
                    size="sm"
                    className={`${user.isBanned ? 'bg-green-600 hover:bg-green-500' : 'bg-orange-600 hover:bg-orange-500'}`}
                >
                    {user.isBanned ? <CheckCircle size={14} /> : <Ban size={14} />}
                </Button>
            )}

            {/* OWNER ONLY ACTIONS */}
            {viewerRole === "OWNER" && user.role !== "OWNER" && (
                <>
                    <Button 
                        onClick={() => handlePromote(user.id, user.role)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-500"
                        title={user.role === "ADMIN" ? "Demote to User" : "Promote to Admin"}
                    >
                        <Shield size={14} />
                    </Button>
                    
                    <Button 
                        onClick={() => handleDelete(user.id)}
                        size="sm"
                        className="bg-red-700 hover:bg-red-600"
                        title="Delete User"
                    >
                        <Trash2 size={14} />
                    </Button>
                </>
            )}
          </div>

        </Card>
      ))}
    </div>
  );
}

