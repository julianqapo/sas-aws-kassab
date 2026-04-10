"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
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
import { Plus, Loader2, ShieldCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "../../components/ui/sonner";
import { getStaffWithPermissions, getAllPermissions } from "./db_service";
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: "easeOut" as const },
  },
};

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/40 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 p-4 md:p-8">
      <Toaster richColors />
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" as const }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Staff</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Manage staff members and their permissions</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex items-center gap-2"
          >
            <Button
              onClick={openAddModal}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 h-11 px-5 rounded-xl font-bold text-xs uppercase shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 gap-2 transition-all duration-300 active:scale-[0.97]"
            >
              <Plus className="w-4 h-4" />
              Add Staff
            </Button>

            <Button
              variant="outline"
              onClick={fetchStaff}
              disabled={loading}
              className="rounded-xl border-gray-200 dark:border-gray-800 h-11 w-11 p-0 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-300"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </motion.div>
        </motion.div>

        {/* Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-lg border-gray-200/80 dark:border-gray-800 overflow-hidden backdrop-blur-sm bg-white/90 dark:bg-gray-950/90">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between">
              <CardTitle className="text-gray-900 dark:text-white">Staff List</CardTitle>
              {!loading && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-[10px] font-black uppercase bg-orange-100 dark:bg-orange-900/30 px-3 py-1.5 rounded-full text-orange-600 dark:text-orange-400"
                >
                  {staff.length} Members
                </motion.span>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-24 space-y-4"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-4 border-orange-100 dark:border-orange-900/30" />
                      <div className="w-12 h-12 rounded-full border-4 border-transparent border-t-orange-500 animate-spin absolute inset-0" />
                    </div>
                    <span className="text-sm text-gray-400 font-medium animate-pulse">Loading staff...</span>
                  </motion.div>
                ) : staff.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-24 space-y-4"
                  >
                    <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <ShieldCheck className="w-7 h-7 text-gray-400" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="font-bold text-gray-700 dark:text-gray-300">No staff members yet</p>
                      <p className="text-sm text-gray-400">Add your first staff member to get started.</p>
                    </div>
                    <Button
                      onClick={openAddModal}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 h-10 px-5 rounded-xl font-bold text-xs uppercase shadow-lg shadow-orange-500/25 gap-2 transition-all duration-300 active:scale-[0.97] mt-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Staff
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="table"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="overflow-x-auto px-4 -mx-4 custom-scrollbar">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 pointer-events-none">
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500 py-4">Full Name</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500 py-4">Email</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500 py-4">Status</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500 py-4">Permissions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                          {staff.map((member) => (
                            <motion.tr
                              key={member.id}
                              variants={rowVariants}
                              onClick={() => openEditModal(member)}
                              whileHover={{
                                scaleY: 1.02,
                                scaleX: 1, 
                                zIndex: 20,
                                backgroundColor: "rgba(251, 146, 60, 0.05)", // Very light orange tint
                                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                                transition: { type: "spring", stiffness: 400, damping: 30 },
                              }}
                              whileTap={{ scale: 0.995 }}
                              className={`border-b border-gray-100 dark:border-gray-800/50 origin-center relative select-none border-l-4 cursor-pointer transition-colors ${
                                member.is_active 
                                  ? "border-l-transparent" 
                                  : "border-l-red-500 bg-red-50/30 dark:bg-red-950/10"
                              }`}
                            >
                              <TableCell className="py-4 font-bold text-gray-900 dark:text-white">
                                {member.full_name}
                              </TableCell>
                              <TableCell className="py-4 text-sm text-gray-500 dark:text-gray-400">
                                {member.email}
                              </TableCell>
                              <TableCell className="py-4">
                                <span
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase inline-block ${
                                    member.is_active
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                      : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                                  }`}
                                >
                                  {member.is_active ? "Active" : "Inactive"}
                                </span>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex flex-wrap gap-1.5">
                                  {member.permissions.length === 0 ? (
                                    <span className="text-gray-400 text-xs font-medium">None</span>
                                  ) : (
                                    member.permissions.map((perm) => (
                                      <span
                                        key={perm.id}
                                        className="px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg text-[10px] font-black uppercase tracking-wider"
                                      >
                                        {perm.name}
                                      </span>
                                    ))
                                  )}
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </motion.tbody>
                      </Table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
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