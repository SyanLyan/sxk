"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // Assuming shadcn-like util, but I need to create it or just use clsx directly

import { Heart, Image, Clock, Sparkles } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home", icon: Heart },
    { href: "/timeline", label: "Timeline", icon: Clock },
    { href: "/gallery", label: "Her", icon: Image },
    { href: "/moments", label: "Moments", icon: Sparkles },
  ];

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/70 dark:bg-black/50 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-full px-6 py-3 flex items-center gap-8 shadow-[0_8px_32px_0_rgba(124,58,237,0.15)] dark:shadow-purple-900/20 transition-all duration-300">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300 hover:text-purple-600 dark:hover:text-white group",
              isActive ? "text-purple-600 dark:text-purple-400 scale-110" : "text-gray-400 dark:text-gray-500"
            )}
          >
            <Icon size={20} className={cn("transition-transform duration-300", isActive && "fill-current")} />
            <span className="hidden sm:block text-[10px] font-mono tracking-widest opacity-0 group-hover:opacity-100 absolute -top-10 transition-all transform translate-y-2 group-hover:translate-y-0 bg-white dark:bg-black px-2 py-1 rounded border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white shadow-lg">
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
