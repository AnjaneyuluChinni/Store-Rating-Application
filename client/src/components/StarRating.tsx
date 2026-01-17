import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface StarRatingProps {
  rating: number; // Current rating (0-5)
  onRate?: (rating: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({ rating, onRate, readOnly = false, size = "md" }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const starSize = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          className={cn(
            "transition-all duration-200 focus:outline-none focus-visible:scale-125",
            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110 active:scale-95"
          )}
          onClick={() => !readOnly && onRate?.(star)}
          onMouseEnter={() => !readOnly && setHoverRating(star)}
          onMouseLeave={() => !readOnly && setHoverRating(0)}
        >
          <Star
            className={cn(
              starSize[size],
              "transition-colors duration-200",
              (hoverRating || rating) >= star
                ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_2px_rgba(250,204,21,0.6)]"
                : "fill-transparent text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
}
