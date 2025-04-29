import { toast } from "@/components/ui/toast";
import { useCallback } from "react";

export interface ToastProps {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

export function useToast() {
  const showToast = useCallback(
    ({ title, description, variant = "default", duration = 5000 }: ToastProps) => {
      return toast({
        title,
        description,
        variant,
        duration,
      });
    },
    []
  );

  return { toast: showToast };
}