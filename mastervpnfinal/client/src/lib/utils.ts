import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats bytes to a human-readable format
 */
export function formatBytes(bytes: number | null, decimals = 2): string {
  if (bytes === null || bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Formats seconds to a human-readable duration format (HH:MM:SS)
 */
export function formatDuration(seconds: number | null): string {
  if (seconds === null) return "00:00:00";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return [hours, minutes, remainingSeconds]
    .map(val => val.toString().padStart(2, "0"))
    .join(":");
}

/**
 * Formats a date to a human-readable format
 */
export function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Generates a random integer between min and max (inclusive)
 */
export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Simulates network latency by waiting a specified time
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Truncates a string to a specified length and adds an ellipsis if needed
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

/**
 * Generates a mock IP address
 */
export function generateMockIpAddress(): string {
  return `${getRandomInt(1, 255)}.${getRandomInt(1, 255)}.${getRandomInt(1, 255)}.${getRandomInt(1, 255)}`;
}

/**
 * Calculates a status color based on a value (0-100%)
 */
export function getStatusColor(value: number): string {
  if (value < 30) return "text-green-500";
  if (value < 70) return "text-amber-500";
  return "text-red-500";
}

/**
 * Formats a ping value with appropriate color coding
 */
export function formatPing(ping: number): { value: string; color: string } {
  if (ping < 50) {
    return { value: `${ping}ms`, color: "text-green-500" };
  } else if (ping < 100) {
    return { value: `${ping}ms`, color: "text-amber-500" };
  } else {
    return { value: `${ping}ms`, color: "text-red-500" };
  }
}