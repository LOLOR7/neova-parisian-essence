import { Link } from "react-router-dom";

export const Logo = ({ className = "", inverted = false }: { className?: string; inverted?: boolean }) => (
  <Link
    to="/"
    aria-label="NEOVA"
    className={`inline-flex items-center select-none font-display ${className}`}
    style={{
      fontSize: "22px",
      fontWeight: 400,
      letterSpacing: "0.1em",
      color: inverted ? "#F4F1EC" : undefined,
    }}
  >
    NEOVA
  </Link>
);
