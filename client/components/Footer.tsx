import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background/60">
      <div className="container py-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Cosmos Haven — Naturaleza y tecnología.</p>
        <div className="flex items-center gap-4 text-xs">
          <Link to="/privacy" className="hover:text-primary transition-colors">Privacidad</Link>
          <Link to="/terms" className="hover:text-primary transition-colors">Términos</Link>
          <a href="mailto:soporte@cosmoshaven.com" className="hover:text-primary transition-colors">Contacto</a>
        </div>
      </div>
    </footer>
  );
}
