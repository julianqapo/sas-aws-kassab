"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Plus, Trash2, UserCheck, UserX } from "lucide-react";
import { DeleteModal } from "../../components/modals/DeleteModal";
import { AddModal } from "../../components/modals/AddModal";
import type { Staff } from "../../types/models";

export default function UsersPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    item?: Staff;
  }>({ open: false });
  const [addModal, setAddModal] = useState(false);

  async function fetchStaff() {
    const { data } = await supabase
      .from("staff")
      .select("*")
      .order("created_at", { ascending: false });
    setStaff(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleDelete = async () => {
    if (deleteModal.item) {
      await supabase.from("staff").delete().eq("id", deleteModal.item.id);
      setStaff(staff.filter((s) => s.id !== deleteModal.item?.id));
    }
    setDeleteModal({ open: false });
  };

  const handleAdd = async (data: { name: string; description: string }) => {
    const { data: newStaff } = await supabase
      .from("staff")
      .insert({ full_name: data.name, email: data.description })
      .select()
      .single();
    if (newStaff) {
      setStaff([newStaff, ...staff]);
    }
  };

  const toggleActive = async (member: Staff) => {
    await supabase
      .from("staff")
      .update({ is_active: !member.is_active })
      .eq("id", member.id);
    setStaff(
      staff.map((s) =>
        s.id === member.id ? { ...s, is_active: !s.is_active } : s
      )
    );
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Users</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage staff accounts and permissions
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
            <CardDescription>View and manage all staff</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
              </div>
            ) : staff.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                No staff members found.
              </p>
            ) : (
              <div className="space-y-4">
                {staff.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:border-gray-700"
                  >
                    <div>
                      <h3 className="font-semibold dark:text-white">
                        {member.full_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {member.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(member)}
                        className={
                          member.is_active
                            ? "text-green-600 hover:text-green-700"
                            : "text-gray-400 hover:text-gray-500"
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DeleteModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open })}
        onConfirm={handleDelete}
        itemName={deleteModal.item?.full_name}
      />
      <AddModal
        open={addModal}
        onOpenChange={setAddModal}
        onAdd={handleAdd}
        title="Add New Staff"
        description="Add a new staff member."
        nameLabel="Full Name"
        descriptionLabel="Email"
      />
    </div>
  );
}
