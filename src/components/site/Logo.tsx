import { Link } from "react-router-dom";

export const Logo = ({ className = "", inverted = false }: { className?: string; inverted?: boolean }) => (
  <Link
    to="/"
    aria-label="Neova"
    className={`inline-flex items-baseline select-none ${className}`}
  >
    <span
      className={`font-display tracking-[0.32em] text-[20px] md:text-[22px] leading-none ${
        inverted ? "text-background" : "text-foreground"
      }`}
    >
      NEOVA
    </span>
  </Link>
);
