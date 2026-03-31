"use client";

import { useEffect, useState } from "react";
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { manageStaffAndPermissions } from "./db_service";
import { StaffMember, Permission } from "./page";

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: StaffMember | null;
  allPermissions: Permission[];
  onSuccess: () => void; // Triggered to refresh the parent table
}

export default function StaffModal({
  isOpen,
  onClose,
  editing,
  allPermissions,
  onSuccess,
}: StaffModalProps) {
  const [saving, setSaving] = useState(false);

  // Form state
  const [formEmail, setFormEmail] = useState("");
  const [formFullName, setFormFullName] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formPermissions, setFormPermissions] = useState<Set<number>>(new Set());

  // Reset or populate form when modal opens or editing target changes
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
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
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
              <Label htmlFor="staff-email">Email</Label>
              <Input
                id="staff-email"
                type="email"
                placeholder="Enter email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="staff-name">Full Name</Label>
              <Input
                id="staff-name"
                type="text"
                placeholder="Enter full name"
                value={formFullName}
                onChange={(e) => setFormFullName(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <Label htmlFor="staff-active" className="text-base">
                Active Account
              </Label>
              <Switch
                id="staff-active"
                checked={formIsActive}
                onCheckedChange={setFormIsActive}
              />
            </div>

            {/* Toggle Buttons for Permissions */}
            {allPermissions.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base">Permissions</Label>
                <div className="flex flex-wrap gap-2">
                  {allPermissions.map((perm) => {
                    const isActive = formPermissions.has(perm.id);
                    return (
                      <button
                        key={perm.id}
                        type="button"
                        onClick={() => togglePermission(perm.id)}
                        className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                          isActive
                            ? "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/40 dark:text-orange-400 dark:border-orange-800 hover:bg-orange-200 dark:hover:bg-orange-900/60"
                            : "bg-white text-gray-700 border-gray-300 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        {perm.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}