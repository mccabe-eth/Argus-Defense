import { Shield, Github, Twitter, ExternalLink } from "lucide-react";
import argusLogo from "@/assets/argus-logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img src={argusLogo} alt="Argus Defense" className="h-8 w-auto" />
              <div>
                <h3 className="font-bold text-primary">ARGUS DEFENSE</h3>
                <p className="text-xs text-muted-foreground">Global Threat Intelligence</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Decentralized threat intelligence powered by Web3 technology and community validation.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Dashboard</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Threat Map</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Submit Report</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Validation</a></li>
            </ul>
          </div>

          {/* Web3 Features */}
          <div>
            <h4 className="font-semibold mb-4">Web3</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Wallet Integration</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Staking</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Governance</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Treasury</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors flex items-center space-x-2">
                  <span>Documentation</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors flex items-center space-x-2">
                  <span>API Reference</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors flex items-center space-x-2">
                  <span>GitHub</span>
                  <Github className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors flex items-center space-x-2">
                  <span>Twitter</span>
                  <Twitter className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Argus Defense. Securing the world through decentralized intelligence.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
