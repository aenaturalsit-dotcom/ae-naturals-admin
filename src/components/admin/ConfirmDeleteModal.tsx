// src/components/admin/ConfirmDeleteModal.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false,
}: ConfirmDeleteModalProps) {


  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log("Dialog onOpenChange:", open);
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-md z-[9999]">

        <DialogHeader>
          <DialogTitle className="text-red-600">
            {title}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-zinc-600">
          {message}
        </p>

        <DialogFooter className="flex justify-end gap-2 mt-4">

          <button
            onClick={() => {
              console.log("CANCEL CLICKED");
              onClose();
            }}
            disabled={isLoading}
            className="px-4 py-2 border rounded-md text-zinc-600 hover:bg-zinc-100"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              console.log("CONFIRM BUTTON CLICKED");
              onConfirm();
            }}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-md"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}