"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { RainbowKitCustomConnectButton } from "./scaffold-eth";
import { useOutsideClick } from "../hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
};

export const menuLinks: HeaderMenuLink[] = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Threats", href: "/threats" },
  { label: "Reports", href: "/reports" },
  { label: "Governance", href: "/governance" },
  { label: "Radio Streams", href: "/streams" },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive ? "text-primary" : "text-foreground"
              }`}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </>
  );
};

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  
  useOutsideClick(burgerMenuRef, () => {
    setIsMenuOpen(false);
  });

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/argus-logo.png"
            alt="Argus Defense"
            width={32}
            height={32}
            className="h-8 w-auto"
          />
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-primary">ARGUS DEFENSE</h1>
            <p className="text-xs text-muted-foreground">Global Threat Intelligence</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <ul className="flex items-center space-x-6">
            <HeaderMenuLinks />
          </ul>
        </nav>

        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex">
            <RainbowKitCustomConnectButton />
          </div>
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div
          ref={burgerMenuRef}
          className="md:hidden border-t border-border bg-background/95 backdrop-blur"
        >
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-4">
              <HeaderMenuLinks />
              <li className="pt-4 border-t border-border">
                <RainbowKitCustomConnectButton />
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};