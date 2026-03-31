"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Plus, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "../../components/ui/sonner";
import { getStaffWithPermissions, getAllPermissions } from "./db_service";
// import StaffModal from "StaffModal";
import StaffModal from "./StaffModal";

export interface StaffMember {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  permissions: { id: number; name: string }[];
}

export interface Permission {
  id: number;
  name: string;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal control state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getStaffWithPermissions();
      if (result.success) {
        setStaff(result.data || []);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPermissions = useCallback(async () => {
    try {
      const result = await getAllPermissions();
      if (result.success) {
        setAllPermissions(result.data || []);
      }
    } catch {
      console.error("Failed to load permissions");
    }
  }, []);

  useEffect(() => {
    fetchStaff();
    fetchPermissions();
  }, [fetchStaff, fetchPermissions]);

  const openAddModal = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEditModal = (member: StaffMember) => {
    setEditing(member);
    setModalOpen(true);
  };

  return (
    <div className="p-8">
      <Toaster />
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Staff
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your staff members and their permissions
            </p>
          </div>
          <Button
            onClick={openAddModal}
            className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Staff
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Staff List
              {!loading && (
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                  ({staff.length} total)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500 dark:text-gray-400">
                  Loading staff...
                </span>
              </div>
            ) : staff.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No staff members yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium text-gray-900 dark:text-white">
                          {member.full_name}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {member.email}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              member.is_active
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {member.is_active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {member.permissions.length === 0 ? (
                              <span className="text-gray-400 text-xs">None</span>
                            ) : (
                              member.permissions.map((perm) => (
                                <span
                                  key={perm.id}
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                >
                                  {perm.name}
                                </span>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(member)}
                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <StaffModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        allPermissions={allPermissions}
        onSuccess={fetchStaff}
      />
    </div>
  );
}