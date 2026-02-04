import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function withBasePath(src: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (!basePath) return src;
  return src.startsWith("/") ? `${basePath}${src}` : `${basePath}/${src}`;
}
