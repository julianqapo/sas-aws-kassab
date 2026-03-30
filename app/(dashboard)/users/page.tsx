"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { DeleteModal } from "@/app/components/modals/DeleteModal";
import { AddModal } from "@/app/components/modals/AddModal";
import { Plus, Trash2, UserCheck, UserX } from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/contexts/AuthContext";
import type { Staff } from "@/app/types/models";

export default function UsersPage() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    item?: Staff;
  }>({ open: false });
  const [addModal, setAddModal] = useState(false);

  const fetchStaff = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("staff")
      .select("*")
      .eq("id_admin", user.id)
      .order("created_at", { ascending: false });
    setStaff(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleAdd = async (data: { name: string; description: string }) => {
    if (!user) return;
    const { error } = await supabase.from("staff").insert({
      full_name: data.name,
      email: data.description, // description field used as email
      id_admin: user.id,
      is_active: true,
    });
    if (!error) {
      fetchStaff();
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.item) return;
    const { error } = await supabase
      .from("staff")
      .delete()
      .eq("id", deleteModal.item.id);
    if (!error) {
      setStaff(staff.filter((s) => s.id !== deleteModal.item?.id));
    }
    setDeleteModal({ open: false });
  };

  const toggleActive = async (staffMember: Staff) => {
    const { error } = await supabase
      .from("staff")
      .update({ is_active: !staffMember.is_active })
      .eq("id", staffMember.id);
    if (!error) {
      setStaff(
        staff.map((s) =>
          s.id === staffMember.id ? { ...s, is_active: !s.is_active } : s
        )
      );
    }
  };

  return (
    <div className="p-8">
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
            <Plus className="w-4 h-4 mr-2" />
            Add Staff
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Staff Members</CardTitle>
            <CardDescription>
              {loading
                ? "Loading..."
                : `${staff.length} staff member${staff.length !== 1 ? "s" : ""}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {staff.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:border-gray-700"
                >
                  <div className="flex items-center gap-3">
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
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(member)}
                      className={
                        member.is_active
                          ? "text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950"
                          : "text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                      }
                    >
                      {member.is_active ? (
                        <UserCheck className="w-4 h-4" />
                      ) : (
                        <UserX className="w-4 h-4" />
                      )}
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
              {!loading && staff.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No staff members yet. Click &quot;Add Staff&quot; to create
                  one.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <DeleteModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open })}
        onConfirm={handleDelete}
        title="Delete Staff Member"
        description="This action cannot be undone. This will permanently remove the staff member."
        itemName={deleteModal.item?.full_name}
      />
      <AddModal
        open={addModal}
        onOpenChange={setAddModal}
        onAdd={handleAdd}
        title="Add Staff Member"
        description="Enter the staff member's details below."
        nameLabel="Full Name"
        descriptionLabel="Email"
      />
    </div>
  );
}
