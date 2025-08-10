import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <header className="w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex items-center justify-between py-4">
        <Link to="/" className="font-semibold text-lg">BarberQ</Link>
        <div className="flex items-center gap-3">
          <Button variant="secondary" asChild>
            <Link to="/login">Book</Link>
          </Button>
          <Button asChild>
            <Link to="/admin">Admin</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
