import logo from "@/assets/neova-logo.png";
import { Link } from "react-router-dom";

export const Logo = ({ className = "", inverted = false }: { className?: string; inverted?: boolean }) => (
  <Link to="/" aria-label="Neova" className={`inline-flex items-center gap-3 ${className}`}>
    <img
      src={logo}
      alt="Neova"
      className={`h-10 md:h-11 w-auto select-none transition-opacity duration-700 ${inverted ? "invert brightness-200 contrast-200" : ""}`}
      draggable={false}
    />
  </Link>
);
