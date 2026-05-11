"use client";

import {
  SignInButton,
  SignOutButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  useAuth,
} from "@clerk/nextjs";
import { Database, MessageSquareText, UploadCloud } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/chat", label: "Chat", icon: MessageSquareText, adminOnly: true },
  { href: "/upload", label: "Upload", icon: UploadCloud, adminOnly: true },
];

export const Navigation = () => {
  const pathname = usePathname();
  const { isLoaded, sessionClaims } = useAuth();

  // Safely extract role from Clerk session claims
  const userRole = (sessionClaims as any)?.metadata?.role;
  const isAdmin = userRole === "admin";

  // Define which items to show
  const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <nav className="sticky top-0 z-40 glass border-b">
      <div className="container mx-auto flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tighter transition-all hover:opacity-90">
          <Image
            src="/logo.jpeg"
            alt="Logo"
            width={40}
            height={40}
            className="size-10 rounded-xl object-cover shadow-lg"
          />
          <span className="text-xl text-gradient">SpeedBook Assistant</span>
        </Link>

        {visibleItems.length > 0 && (
          <div className="flex items-center gap-1 rounded-full border bg-muted/50 p-1">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Button
                  asChild
                  className={cn(
                    "h-8 px-4 rounded-full text-sm font-medium transition-all",
                    active 
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  key={item.href}
                  size="sm"
                  variant="ghost"
                >
                  <Link href={item.href}>
                    <Icon className="mr-1.5 size-3.5" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        )}

        <div className="flex gap-2">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost">Sign in</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button>Sign up</Button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <SignOutButton redirectUrl="/">
              <Button variant="outline">Sign out</Button>
            </SignOutButton>
          </SignedIn>
        </div>
      </div>
    </nav>
  );
};
