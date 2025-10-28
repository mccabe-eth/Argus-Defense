import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Image src="/argus-logo.png" alt="Argus Defense" width={32} height={32} className="h-8 w-auto" />
              <div>
                <h3 className="font-bold text-primary">ARGUS DEFENSE</h3>
                <p className="text-xs text-muted-foreground">Global Threat Intelligence</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Decentralized threat intelligence powered by Web3 technology and community validation.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/threats" className="hover:text-primary transition-colors">
                  Threat Map
                </Link>
              </li>
              <li>
                <Link href="/reports" className="hover:text-primary transition-colors">
                  Submit Report
                </Link>
              </li>
              <li>
                <Link href="/governance" className="hover:text-primary transition-colors">
                  Governance
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Web3</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="hover:text-primary transition-colors cursor-pointer">Wallet Integration</span>
              </li>
              <li>
                <span className="hover:text-primary transition-colors cursor-pointer">Staking</span>
              </li>
              <li>
                <Link href="/governance" className="hover:text-primary transition-colors">
                  Governance
                </Link>
              </li>
              <li>
                <span className="hover:text-primary transition-colors cursor-pointer">Treasury</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/documentation"
                  className="hover:text-primary transition-colors flex items-center space-x-2"
                >
                  <span>Documentation</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors flex items-center space-x-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors flex items-center space-x-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Twitter</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Argus Defense. Securing the world through decentralized intelligence.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              Privacy Policy
            </span>
            <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
