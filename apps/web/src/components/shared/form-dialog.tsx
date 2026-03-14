"use client";

import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

type FormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Override max-width. Default: sm:max-w-lg. Use "sm:max-w-4xl" for 2-column forms. */
  className?: string;
  children: ReactNode;
};

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  className,
  children,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <ScrollArea className="max-h-[calc(100vh-12rem)]">
          {children}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
