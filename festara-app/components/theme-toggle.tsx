"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "system", label: "System", Icon: Monitor },
  { value: "dark", label: "Dark", Icon: Moon },
] as const;

const subscribe = () => () => {};

/** Three-way theme switch. Renders unselected until mounted so server and client markup match. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  return (
    <div role="radiogroup" aria-label="Theme" className={cn("inline-flex rounded-full border p-0.5", className)}>
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={mounted && theme === value}
          aria-label={label}
          onClick={() => setTheme(value)}
          className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-[background-color,color,transform] duration-100 active:scale-95 aria-checked:bg-secondary aria-checked:text-foreground"
        >
          <Icon className="size-3.5" aria-hidden />
        </button>
      ))}
    </div>
  );
}
