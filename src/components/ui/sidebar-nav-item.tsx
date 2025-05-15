
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SidebarNavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

export const SidebarNavItem = ({
  href,
  icon,
  label,
  active = false,
}: SidebarNavItemProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-white/10",
        active ? "bg-white/10 text-white" : "text-white/70 hover:text-white"
      )}
    >
      <span className="h-5 w-5">{icon}</span>
      <span>{label}</span>
    </Link>
  );
};
