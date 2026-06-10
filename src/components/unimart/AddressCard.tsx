import { MapPin, Edit2, Trash2 } from "lucide-react";
import type { Address } from "@prisma/client";

interface AddressCardProps {
  address: Address;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function AddressCard({ address, selected, onSelect, onEdit, onDelete }: AddressCardProps) {
  return (
    <div
      onClick={onSelect}
      className="relative p-4 rounded-2xl transition-all"
      style={{
        background: "var(--color-surface)",
        border: `2px solid ${selected ? "var(--color-primary)" : "var(--color-border)"}`,
        cursor: onSelect ? "pointer" : "default",
      }}>
      {selected && (
        <span className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: "var(--color-primary)" }}>
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}

      {address.isDefault && (
        <span className="inline-block mb-2 px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}>Default</span>
      )}

      <div className="flex items-start gap-2">
        <MapPin size={15} style={{ color: "var(--color-text-3)", marginTop: 2, flexShrink: 0 }} />
        <div>
          <p className="font-semibold text-sm">{address.label}</p>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-2)" }}>{address.recipientName}</p>
          {address.hostel && <p className="text-sm" style={{ color: "var(--color-text-2)" }}>{address.hostel}{address.room ? `, Room ${address.room}` : ""}</p>}
          {address.faculty && <p className="text-sm" style={{ color: "var(--color-text-2)" }}>{address.faculty}</p>}
          {address.pickupPoint && <p className="text-sm" style={{ color: "var(--color-text-2)" }}>Pickup: {address.pickupPoint}</p>}
          <p className="text-xs mt-1" style={{ color: "var(--color-text-3)" }}>{address.phone}</p>
        </div>
      </div>

      {(onEdit || onDelete) && (
        <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
          {onEdit && (
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="flex items-center gap-1 text-xs font-semibold px-3 h-7 rounded-lg"
              style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-2)" }}>
              <Edit2 size={11} /> Edit
            </button>
          )}
          {onDelete && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="flex items-center gap-1 text-xs font-semibold px-3 h-7 rounded-lg"
              style={{ border: "1px solid var(--color-danger)", color: "var(--color-danger)" }}>
              <Trash2 size={11} /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
