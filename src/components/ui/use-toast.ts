
import { useToast, toast } from "@/hooks/use-toast";

// Customize default toast options
toast.success = (title, options) => {
  return toast({
    title,
    ...options,
    variant: "default",
    className: "bg-theme-deepPurple text-white border-theme-darkPurple"
  });
};

toast.error = (title, options) => {
  return toast({
    title,
    ...options,
    variant: "destructive",
    className: "bg-red-600 text-white border-red-800"
  });
};

toast.warning = (title, options) => {
  return toast({
    title,
    ...options,
    className: "bg-theme-lightBrown text-white border-theme-terracotta"
  });
};

toast.info = (title, options) => {
  return toast({
    title,
    ...options,
    className: "bg-theme-lightBrown/80 text-white border-theme-terracotta/80"
  });
};

export { useToast, toast };
