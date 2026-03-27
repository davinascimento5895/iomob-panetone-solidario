import React from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface LogoutConfirmProps {
  onConfirm: () => Promise<void> | void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

const LogoutConfirm = ({
  onConfirm,
  children,
  title = "Deseja mesmo sair?",
  description = "Você será deslogado da sua conta.",
  confirmLabel = "Sair",
  cancelLabel = "Cancelar",
}: LogoutConfirmProps) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>{confirmLabel}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default LogoutConfirm;
