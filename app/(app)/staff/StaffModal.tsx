"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Loader2, ShieldCheck, UserPlus, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";
import { manageStaffAndPermissions } from "./db_service";
import { StaffMember, Permission } from "./page";

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: StaffMember | null;
  allPermissions: Permission[];
  onSuccess: () => void;
}

export default function StaffModal({
  isOpen,
  onClose,
  editing,
  allPermissions,
  onSuccess,
}: StaffModalProps) {
  const [saving, setSaving] = useState(false);

  const [formEmail, setFormEmail] = useState("");
  const [formFullName, setFormFullName] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formPermissions, setFormPermissions] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen) {
      if (editing) {
        setFormEmail(editing.email);
        setFormFullName(editing.full_name);
        setFormIsActive(editing.is_active);
        setFormPermissions(new Set(editing.permissions.map((p) => p.id)));
      } else {
        setFormEmail("");
        setFormFullName("");
        setFormIsActive(true);
        setFormPermissions(new Set());
      }
    }
  }, [isOpen, editing]);

  const togglePermission = (id: number) => {
    setFormPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await manageStaffAndPermissions(
        formEmail,
        formFullName,
        formIsActive,
        Array.from(formPermissions)
      );
      if (result.success) {
        toast.success(result.message);
        onSuccess();
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to save staff member");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editing ? (
              <ShieldCheck className="w-5 h-5 text-orange-600" />
            ) : (
              <UserPlus className="w-5 h-5 text-orange-600" />
            )}
            {editing ? "Edit Staff Member" : "Add Staff Member"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Update staff member details and permissions."
              : "Add a new staff member and assign permissions."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave}>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="staff-email" className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Email
              </Label>
              <Input
                id="staff-email"
                type="email"
                placeholder="Enter email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                required
                className="h-11 rounded-xl border-gray-200 dark:border-gray-800 focus:border-orange-400 focus:ring-orange-400/20 transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff-name" className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Full Name
              </Label>
              <Input
                id="staff-name"
                type="text"
                placeholder="Enter full name"
                value={formFullName}
                onChange={(e) => setFormFullName(e.target.value)}
                required
                className="h-11 rounded-xl border-gray-200 dark:border-gray-800 focus:border-orange-400 focus:ring-orange-400/20 transition-all duration-300"
              />
            </div>

            <div className="flex items-center justify-between border border-gray-100 dark:border-gray-800 rounded-xl p-4">
              <div>
                <Label htmlFor="staff-active" className="text-sm font-bold text-gray-900 dark:text-white cursor-pointer">
                  Active Account
                </Label>
                <p className="text-[10px] text-gray-400 mt-0.5">Allow this member to access the system</p>
              </div>
              <Switch
                id="staff-active"
                checked={formIsActive}
                onCheckedChange={setFormIsActive}
              />
            </div>

            {allPermissions.length > 0 && (
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Permissions
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {allPermissions.map((perm) => {
                    const isActive = formPermissions.has(perm.id);
                    return (
                      <motion.div
                        key={perm.id}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => togglePermission(perm.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 select-none ${
                          isActive
                            ? "border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30 shadow-sm"
                            : "border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <div className={`transition-colors duration-200 ${isActive ? "text-orange-600" : "text-gray-300"}`}>
                          {isActive ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                        </div>
                        <span className={`text-sm font-bold transition-colors duration-200 ${isActive ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
                          {perm.name}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl border-gray-200 dark:border-gray-800 font-bold text-xs uppercase h-11 hover:border-orange-300 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs uppercase h-11 px-6 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 gap-2 transition-all duration-300 active:scale-[0.97]"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}