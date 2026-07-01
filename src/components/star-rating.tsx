"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  onChange,
  size = 18,
  readOnly = false,
}: {
  value: number | null;
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value ?? 0;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(null)}
          onClick={() => !readOnly && onChange?.(star)}
          className={cn(
            "transition-transform",
            !readOnly && "hover:scale-110 cursor-pointer",
          )}
          aria-label={`${star} estrellas`}
        >
          <Star
            style={{ width: size, height: size }}
            className={cn(
              star <= display
                ? "fill-amber-400 text-amber-400"
                : "text-subtle",
            )}
          />
        </button>
      ))}
    </div>
  );
}
