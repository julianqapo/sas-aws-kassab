import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Plus } from "lucide-react";

interface AddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: { name: string; description: string }) => void;
  title?: string;
  description?: string;
  nameLabel?: string;
  descriptionLabel?: string;
}

export function AddModal({
  open,
  onOpenChange,
  onAdd,
  title = "Add New Item",
  description = "Fill in the details below to add a new item.",
  nameLabel = "Name",
  descriptionLabel = "Description",
}: AddModalProps) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ name, description: desc });
    setName("");
    setDesc("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
              <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{nameLabel}</Label>
              <Input
                id="name"
                placeholder={`Enter ${nameLabel.toLowerCase()}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{descriptionLabel}</Label>
              <Textarea
                id="description"
                placeholder={`Enter ${descriptionLabel.toLowerCase()}`}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600">Add</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}