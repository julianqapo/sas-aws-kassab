"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { DeleteModal } from "../../components/modals/DeleteModal";
import {
  Plus,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "../../components/ui/sonner";
import { getUsers, getProfiles } from "./db_service";
import type { SASUser, SASProfile, PaginatedResponse } from "../../types/sas-types";

const PAGE_SIZE = 15;

export default function UsersPage() {
  const [users, setUsers] = useState<SASUser[]>([]);
  const [profiles, setProfiles] = useState<SASProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);

  // Add user modal
  const [addModal, setAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    firstname: "",
    lastname: "",
    profile_id: 0,
  });

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    user?: SASUser;
  }>({ open: false });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result: PaginatedResponse<SASUser> = await getUsers(
        page,
        PAGE_SIZE,
        search
      );
      setUsers(result.data || []);
      setTotalPages(result.last_page || 1);
      setTotal(result.total || 0);
      setFrom(result.from || 0);
      setTo(result.to || 0);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load users";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const fetchProfiles = useCallback(async () => {
    try {
      const result = await getProfiles(0);
      setProfiles(Array.isArray(result) ? result : []);
    } catch {
      // Profiles are optional — fail silently
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const getProfileName = (profileId: number) => {
    const profile = profiles.find((p) => p.id === profileId);
    return profile?.name ?? String(profileId);
  };

  


  return (
    <div className="p-8">
      <Toaster />
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Users
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage SAS4 user accounts
            </p>
          </div>
          <Button
            onClick={() => setAddModal(true)}
            className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              User List
              {!loading && (
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                  ({total} total)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500 dark:text-gray-400">
                  Loading users...
                </span>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {search
                  ? "No users found matching your search."
                  : "No users found."}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>First Name</TableHead>
                        <TableHead>Last Name</TableHead>
                        <TableHead>Profile</TableHead>
                        <TableHead>Enabled</TableHead>
                        <TableHead>Expiration</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <Link 
                              href={`/users/${user.username}`} 
                              className="text-orange-600 hover:text-orange-700 hover:underline"
                            >
                              {user.username}
                            </Link>
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {user.firstname || "—"}
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {user.lastname || "—"}
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {getProfileName(user.profile_id)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.enabled
                                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400"
                              }`}
                            >
                              {user.enabled ? "Yes" : "No"}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {user.expiration || "—"}
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {user.balance}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setDeleteModal({ open: true, user })
                              }
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {from} to {to} of {total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page >= totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add User Modal */}
      <Dialog open={addModal} onOpenChange={setAddModal}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <DialogTitle>Add New User</DialogTitle>
            </div>
            <DialogDescription>
              Create a new SAS4 user account.
            </DialogDescription>
          </DialogHeader>
          
        </DialogContent>
      </Dialog>

    </div>
  );
}
