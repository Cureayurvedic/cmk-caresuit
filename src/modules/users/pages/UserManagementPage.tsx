import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useIsAdmin } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast-notification";
import {
  Users,
  Search,
  Plus,
  ShieldCheck,
  User,
  Power,
  Trash2,
  Edit2,
  Loader2,
  AlertCircle
} from "lucide-react";
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  UserData 
} from "@/api/userApi";
import { format } from "date-fns";

export default function UserManagementPage() {
  const isAdmin = useIsAdmin();
  const toast = useToast();

  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    email: "",
    role: "data_entry" as 'admin' | 'data_entry',
    status: "Active" as 'Active' | 'Disabled',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Deletion State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Error", "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // If not admin, block access completely
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      password: "",
      email: "",
      role: "data_entry",
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      password: "", // Keep empty when editing unless changing
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    try {
      setFormLoading(true);
      if (editingUser) {
        if (editingUser.id === "admin-1" && formData.role !== "admin") {
          throw new Error("Cannot remove admin privileges from the primary administrator.");
        }
        // Only update password if a new one is typed
        const updatePayload = { ...formData };
        if (!updatePayload.password) {
          delete (updatePayload as any).password;
        }
        await updateUser(editingUser.id, updatePayload);
        toast.success("User Updated", "User details updated successfully.");
      } else {
        if (!formData.password) {
          throw new Error("Password is required for new users.");
        }
        await createUser(formData);
        toast.success("User Created", "New user has been created.");
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (error: any) {
      toast.error("Error", error.message || "Failed to save user");
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (user: UserData) => {
    try {
      if (user.id === "admin-1") {
        toast.error("Action Blocked", "Cannot disable the primary administrator.");
        return;
      }
      const newStatus = user.status === "Active" ? "Disabled" : "Active";
      await updateUser(user.id, { status: newStatus });
      toast.success("Status Updated", `User has been ${newStatus.toLowerCase()}.`);
      loadUsers();
    } catch (error) {
      toast.error("Error", "Failed to update user status");
    }
  };

  const handleDelete = async (user: UserData) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}?`)) return;
    try {
      setDeletingId(user.id);
      await deleteUser(user.id);
      toast.success("User Deleted", "User has been permanently removed.");
      loadUsers();
    } catch (error: any) {
      toast.error("Error", error.message || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-50/50 p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-600" />
            User Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create and manage user accounts and their access roles.
          </p>
        </div>
        <Button 
          onClick={openAddModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold rounded-xl h-11 px-5"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>

      <Card className="border border-slate-200/80 shadow-xs rounded-2xl flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 border-slate-200 focus-visible:ring-emerald-500 rounded-xl bg-slate-50/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-white">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500">
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">User</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">Role</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">Created / Last Login</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mx-auto" />
                    <p className="text-sm text-slate-500 mt-2">Loading users...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="h-10 w-10 text-slate-200 mb-3" />
                      <p className="font-medium text-slate-600">No users found</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border border-slate-200/60 shrink-0 shadow-sm">
                          {user.role === 'admin' ? (
                            <ShieldCheck className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <User className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="font-medium">{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {user.role === 'admin' ? (
                        <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-none font-semibold">
                          Administrator
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-100 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-none font-semibold">
                          Data Entry
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Badge 
                        variant="outline"
                        className={`font-semibold shadow-none ${
                          user.status === 'Active' 
                            ? 'border-emerald-200 text-emerald-600 bg-emerald-50' 
                            : 'border-slate-200 text-slate-500 bg-slate-50'
                        }`}
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600">
                      <div>Created: {format(new Date(user.createdAt), "MMM d, yyyy")}</div>
                      {user.lastLogin && (
                        <div className="text-slate-400 mt-0.5">
                          Last: {format(new Date(user.lastLogin), "MMM d, yyyy HH:mm")}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit User"
                          onClick={() => openEditModal(user)}
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={user.status === 'Active' ? "Disable User" : "Enable User"}
                          onClick={() => handleToggleStatus(user)}
                          disabled={user.id === "admin-1"}
                          className={`h-8 w-8 rounded-lg ${
                            user.status === 'Active' 
                              ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50' 
                              : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                          } ${user.id === "admin-1" ? 'opacity-30 cursor-not-allowed' : ''}`}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete User"
                          onClick={() => handleDelete(user)}
                          disabled={deletingId === user.id || user.id === "admin-1"}
                          className={`h-8 w-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 ${user.id === "admin-1" ? 'opacity-30 cursor-not-allowed' : ''}`}
                        >
                          {deletingId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Add / Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {editingUser ? "Edit User" : "Create New User"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingUser ? "Update user account details." : "Add a new user to the system."}
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Full Name</label>
                  <Input 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Jane Doe" 
                    className="h-11 rounded-xl shadow-sm border-slate-200"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Email Address</label>
                  <Input 
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="e.g. jane@example.com" 
                    className="h-11 rounded-xl shadow-sm border-slate-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Password {editingUser && <span className="text-slate-400 font-normal">(Leave blank to keep unchanged)</span>}
                  </label>
                  <Input 
                    required={!editingUser}
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder={editingUser ? "••••••••" : "Create a strong password"} 
                    className="h-11 rounded-xl shadow-sm border-slate-200"
                  />
                </div>
                


                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      disabled={editingUser?.id === "admin-1"}
                    >
                      <option value="admin">Administrator</option>
                      <option value="data_entry">Data Entry</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      disabled={editingUser?.id === "admin-1"}
                    >
                      <option value="Active">Active</option>
                      <option value="Disabled">Disabled</option>
                    </select>
                  </div>
                </div>
              </div>

              {editingUser?.id === "admin-1" && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 mt-4">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-800">
                    The primary administrator's role and status cannot be modified.
                  </p>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={formLoading}
                  className="h-11 px-6 rounded-xl font-semibold"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={formLoading || !formData.name || !formData.email}
                  className="h-11 px-6 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  {formLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingUser ? "Save Changes" : "Create User"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
