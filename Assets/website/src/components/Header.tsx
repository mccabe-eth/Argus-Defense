import { Shield, Menu, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import argusLogo from "@/assets/argus-logo.png";

const Header = () => {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <img src={argusLogo} alt="Argus Defense" className="h-8 w-auto" />
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-primary">ARGUS DEFENSE</h1>
            <p className="text-xs text-muted-foreground">Global Threat Intelligence</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link to="/threats" className="text-sm font-medium hover:text-primary transition-colors">
            Threats
          </Link>
          <Link to="/reports" className="text-sm font-medium hover:text-primary transition-colors">
            Reports
          </Link>
          <Link to="/governance" className="text-sm font-medium hover:text-primary transition-colors">
            Governance
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button variant="cyber" size="sm" className="hidden sm:flex items-center space-x-2">
            <Wallet className="h-4 w-4" />
            <span>Connect Wallet</span>
          </Button>
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
