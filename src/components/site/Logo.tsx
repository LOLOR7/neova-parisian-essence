import { Link } from "react-router-dom";
import logo from "@/assets/neova-logo.png";

export const Logo = ({ className = "", inverted = false }: { className?: string; inverted?: boolean }) => (
  <Link to="/" aria-label="Neova Space" className={`inline-flex items-center select-none ${className}`}>
    <img
      src={logo}
      alt="Neova Space"
      draggable={false}
      className={`h-14 md:h-16 w-auto object-contain ${inverted ? "invert brightness-0" : ""}`}
    />
  </Link>
);
