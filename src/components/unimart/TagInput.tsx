"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  max?: number;
}

export function TagInput({ value, onChange, placeholder = "Add tag, press Enter", max = 10 }: TagInputProps) {
  const [input, setInput] = useState("");

  function add() {
    const tag = input.trim().toLowerCase();
    if (!tag || value.includes(tag) || value.length >= max) return;
    onChange([...value, tag]);
    setInput("");
  }

  function remove(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
    if (e.key === "Backspace" && !input && value.length) remove(value[value.length - 1]);
  }

  return (
    <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl min-h-[42px]"
      style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
      {value.map((tag) => (
        <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}>
          {tag}
          <button type="button" onClick={() => remove(tag)}><X size={10} /></button>
        </span>
      ))}
      {value.length < max && (
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={add}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
          style={{ color: "var(--color-text-1)" }}
        />
      )}
    </div>
  );
}
