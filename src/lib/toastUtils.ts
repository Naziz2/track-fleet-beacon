
import { toast as sonnerToast } from "sonner";
import { toast as uiToast } from "@/hooks/use-toast";

// Unified toast function that works with both toast libraries
export const toast = {
  success: (title: string, options?: any) => {
    sonnerToast.success(title, options);
    return uiToast({
      title,
      description: options?.description,
      variant: "default",
      className: "bg-theme-deepPurple text-white border-theme-darkPurple"
    });
  },
  error: (title: string, options?: any) => {
    sonnerToast.error(title, options);
    return uiToast({
      title,
      description: options?.description,
      variant: "destructive",
      className: "bg-red-600 text-white border-red-800"
    });
  },
  warning: (title: string, options?: any) => {
    sonnerToast.warning(title, options);
    return uiToast({
      title,
      description: options?.description,
      className: "bg-theme-lightBrown text-white border-theme-terracotta"
    });
  },
  info: (title: string, options?: any) => {
    sonnerToast.info(title, options);
    return uiToast({
      title,
      description: options?.description,
      className: "bg-theme-lightBrown/80 text-white border-theme-terracotta/80"
    });
  }
};
