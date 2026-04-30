import logo from "@/assets/neova-logo.png";
import { Link } from "react-router-dom";

export const Logo = ({ className = "" }: { className?: string }) => (
  <Link to="/" aria-label="Neova — accueil" className={`inline-flex items-center ${className}`}>
    <img src={logo} alt="Neova" className="h-10 w-auto md:h-12 select-none" draggable={false} />
  </Link>
);
