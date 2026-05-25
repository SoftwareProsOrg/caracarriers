import {
  MessageSquare,
  Mail,
  Phone,
  Notebook,
  Bell,
  type LucideIcon,
} from "lucide-react";

export type CommunicationType = "note" | "email" | "sms" | "call" | "system";
export type CommunicationDirection = "inbound" | "outbound";

export interface CommunicationTypeConfig {
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export const COMMUNICATION_TYPES: Record<CommunicationType, CommunicationTypeConfig> = {
  note: { label: "Note", icon: Notebook, color: "text-blue-600", bg: "bg-blue-100" },
  email: { label: "Email", icon: Mail, color: "text-purple-600", bg: "bg-purple-100" },
  sms: { label: "SMS", icon: MessageSquare, color: "text-green-600", bg: "bg-green-100" },
  call: { label: "Call", icon: Phone, color: "text-orange-600", bg: "bg-orange-100" },
  system: { label: "System", icon: Bell, color: "text-gray-600", bg: "bg-gray-100" },
} as const;

export const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "note", label: "Notes" },
  { value: "email", label: "Emails" },
  { value: "sms", label: "SMS" },
  { value: "call", label: "Calls" },
  { value: "system", label: "System" },
];

export function getDateGroup(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === yesterday.getTime()) return "Yesterday";

  const diffDays = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) return "This Week";

  return "Older";
}
