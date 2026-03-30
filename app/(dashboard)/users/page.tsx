"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { DeleteModal } from "@/app/components/modals/DeleteModal";
import { Plus, Trash2, UserPlus, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/app/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/contexts/AuthContext";
import type { Staff } from "@/app/types/models";

export default function UsersPage() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    item?: Staff;
  }>({ open: false });
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const fetchStaff = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .eq("id_admin", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setStaff(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.from("staff").insert({
      email: newEmail,
      full_name: newName,
      id_admin: user.id,
      is_active: true,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`"${newName}" has been added`);
      setNewName("");
      setNewEmail("");
      setAddModal(false);
      fetchStaff();
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.item) return;

    const { error } = await supabase
      .from("staff")
      .delete()
      .eq("id", deleteModal.item.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`"${deleteModal.item.full_name}" has been removed`);
      setStaff(staff.filter((s) => s.id !== deleteModal.item!.id));
    }
    setDeleteModal({ open: false });
  };

  const toggleActive = async (member: Staff) => {
    const { error } = await supabase
      .from("staff")
      .update({ is_active: !member.is_active })
      .eq("id", member.id);

    if (error) {
      toast.error(error.message);
    } else {
      setStaff(
        staff.map((s) =>
          s.id === member.id ? { ...s, is_active: !s.is_active } : s
        )
      );
      toast.success(
        `${member.full_name} is now ${!member.is_active ? "active" : "inactive"}`
      );
    }
  };

  return (
    <div className="p-8">
      <Toaster />
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Users</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage staff members
            </p>
          </div>
          <Button
            onClick={() => setAddModal(true)}
            className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Staff
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Staff Members</CardTitle>
            <CardDescription>
              View and manage your staff
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 text-center py-8">Loading...</p>
            ) : staff.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No staff members yet. Click &quot;Add Staff&quot; to create one.
              </p>
            ) : (
              <div className="space-y-3">
                {staff.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:border-gray-700"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          member.is_active ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                      <div>
                        <h3 className="font-semibold dark:text-white">
                          {member.full_name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(member)}
                      >
                        {member.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDeleteModal({ open: true, item: member })
                        }
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Staff Modal */}
      <Dialog open={addModal} onOpenChange={setAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>
              Enter the details for the new staff member.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="staffName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="staffName"
                    placeholder="John Doe"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="staffEmail">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="staffEmail"
                    type="email"
                    placeholder="staff@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
              >
                Add Staff
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <DeleteModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open })}
        onConfirm={handleDelete}
        itemName={deleteModal.item?.full_name}
      />
    </div>
  );
}
