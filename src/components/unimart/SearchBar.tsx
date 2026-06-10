"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchBarProps {
  defaultValue?: string;
  autoFocus?: boolean;
  onSearch?: (q: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ defaultValue = "", autoFocus, onSearch, placeholder = "Search UniMart…", className }: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) {
      if (onSearch) onSearch(value.trim());
      else router.push(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative flex items-center h-12 rounded-2xl px-4 gap-3 transition-all"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <Search size={18} style={{ color: "var(--color-text-3)", flexShrink: 0 }} />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: "var(--color-text-1)" }}
        />
        {value && (
          <button type="button" onClick={() => { setValue(""); inputRef.current?.focus(); }}>
            <X size={16} style={{ color: "var(--color-text-3)" }} />
          </button>
        )}
        <button type="submit"
          className="px-3 h-7 rounded-xl text-xs font-semibold flex-shrink-0"
          style={{ background: "var(--color-primary)", color: "#fff" }}>
          Search
        </button>
      </div>
    </form>
  );
}