"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { DeleteModal } from "../../components/modals/DeleteModal";
import { AddModal } from "../../components/modals/AddModal";
import { ConfirmModal } from "../../components/modals/ConfirmModal";
import { Plus, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "../../components/ui/sonner";

interface Item {
  id: number;
  name: string;
  description: string;
}

export default function DashboardPage() {
  const [items, setItems] = useState<Item[]>([
    { id: 1, name: "Sample Item 1", description: "This is a sample item" },
    { id: 2, name: "Sample Item 2", description: "Another sample item" },
    { id: 3, name: "Sample Item 3", description: "Yet another sample item" },
  ]);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    item?: Item;
  }>({ open: false });
  const [addModal, setAddModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const handleDelete = () => {
    if (deleteModal.item) {
      setItems(items.filter((item) => item.id !== deleteModal.item?.id));
      toast.success(`"${deleteModal.item.name}" has been deleted`);
    }
    setDeleteModal({ open: false });
  };

  const handleAdd = (data: { name: string; description: string }) => {
    const newItem: Item = {
      id: Math.max(...items.map((i) => i.id), 0) + 1,
      name: data.name,
      description: data.description,
    };
    setItems([...items, newItem]);
    toast.success(`"${data.name}" has been added`);
  };

  const handleConfirmAction = () => {
    toast.success("Action confirmed successfully!");
    setConfirmModal(false);
  };

  return (
    <div className="p-8">
      <Toaster />
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your items and explore the application
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setAddModal(true)}
              className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
            <Button variant="outline" onClick={() => setConfirmModal(true)}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Test Confirm
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Items</CardTitle>
              <CardDescription>Number of items in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold dark:text-white">
                {items.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Users</CardTitle>
              <CardDescription>Currently online</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold dark:text-white">24</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pending Tasks</CardTitle>
              <CardDescription>Tasks awaiting completion</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold dark:text-white">12</p>
            </CardContent>
          </Card>
        </div>

        {/* Items List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Items</CardTitle>
            <CardDescription>Manage and organize your items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:border-gray-700"
                >
                  <div>
                    <h3 className="font-semibold dark:text-white">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteModal({ open: true, item })}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {items.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No items yet. Click &quot;Add Item&quot; to create one.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <DeleteModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open })}
        onConfirm={handleDelete}
        itemName={deleteModal.item?.name}
      />
      <AddModal
        open={addModal}
        onOpenChange={setAddModal}
        onAdd={handleAdd}
        title="Add New Item"
        description="Create a new item by filling in the details below."
      />
      <ConfirmModal
        open={confirmModal}
        onOpenChange={setConfirmModal}
        onConfirm={handleConfirmAction}
        title="Confirm Action"
        description="This is a sample confirmation dialog. Do you want to proceed?"
      />
    </div>
  );
}
