"use client";

import { useState, useEffect } from "react";
import { User, LogOut, Edit2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProfileDropdown() {
  const [user, setUser] = useState<{ name: string; phone: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // 1. Mark component as mounted so we can safely check localStorage
    setIsMounted(true);

    const saved = localStorage.getItem("trinetra_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure the data isn't empty
        if (parsed && (parsed.name || parsed.fullName)) {
          // Normalize the name field
          setUser({
            ...parsed,
            name: parsed.name || parsed.fullName
          });
        }
      } catch (e) {
        console.error("Failed to parse user data");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("trinetra_user");
    // Force full page reload to clear state completely
    window.location.href = "/";
  };

  // 2. Prevent Hydration Mismatch: Don't render until client-side is ready
  if (!isMounted) {
    return (
      <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 animate-pulse" />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors focus:outline-none overflow-hidden">
          {user ? (
            // Show Initials if logged in
            <span className="font-bold text-lg">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </span>
          ) : (
            // Show Icon if guest
            <User size={20} />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end">
        {user ? (
          <>
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none truncate">
                  {user.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  +91 {user.phone}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <Edit2 className="mr-2 h-4 w-4" />
              <span>Edit Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:bg-destructive/10 cursor-pointer" 
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem disabled>Not Logged In</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}