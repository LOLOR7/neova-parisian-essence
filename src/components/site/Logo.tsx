import { Link } from "react-router-dom";
import logoOriginal from "@/assets/neova-logo.png";
import wordmark from "@/assets/neova-wordmark.png.asset.json";

export const Logo = ({ className = "", inverted = false }: { className?: string; inverted?: boolean }) => (
  <Link to="/" aria-label="Neova Space" className={`inline-flex items-center select-none ${className}`}>
    <img
      src={wordmark.url}
      alt="Neova Space"
      draggable={false}
      className={`h-7 md:h-8 w-auto object-contain transition-[filter] duration-500 ${
        inverted ? "brightness-0 invert" : ""
      }`}
    />
  </Link>
);
