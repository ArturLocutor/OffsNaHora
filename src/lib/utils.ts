import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formata telefone brasileiro a partir de dígitos (DDD + número)
export function formatBrPhone(digits: string) {
  const only = digits.replace(/[^\d]/g, "");
  if (only.length === 11) {
    return `(${only.slice(0, 2)}) ${only.slice(2, 7)}-${only.slice(7)}`;
  }
  if (only.length === 10) {
    return `(${only.slice(0, 2)}) ${only.slice(2, 6)}-${only.slice(6)}`;
  }
  return only;
}
