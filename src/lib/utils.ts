import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a product price in Indian Rupees.
 * Safe against undefined / NaN / null — falls back to ₹0.00 so the UI never crashes.
 */
export function formatPrice(price: number | undefined | null): string {
  const n = typeof price === "number" && isFinite(price) && price >= 0 ? price : 0;
  return `₹${n.toFixed(2)}`;
}
