"use client";

import { Card } from "../../components/ui/card";
import { Book, Code, FileText, Radio, Shield, Wallet } from "lucide-react";
import type { NextPage } from "next";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";

const Documentation: NextPage = () => {
  const sections = [
    {
      icon: Book,
      title: "Getting Started",
      description: "Learn the basics of Argus Defense threat intelligence platform",
      topics: ["Platform Overview", "How It Works", "Quick Start Guide"],
    },
    {
      icon: Shield,
      title: "Threat Intelligence",
      description: "Understanding threat categories, validation, and reporting",
      topics: ["Threat Categories", "Validation Process", "Submitting Reports"],
    },
    {
      icon: Wallet,
      title: "Web3 Integration",
      description: "Connect your wallet and interact with smart contracts",
      topics: ["Wallet Setup", "Staking", "Governance Participation"],
    },
    {
      icon: Radio,
      title: "Radio Streams",
      description: "Monitor emergency radio frequencies and earn rewards",
      topics: ["Stream Setup", "Reward System", "libp2p Integration"],
    },
    {
      icon: Code,
      title: "Developer Guide",
      description: "API documentation and integration guides",
      topics: ["API Reference", "Smart Contracts", "IPFS Integration"],
    },
    {
      icon: FileText,
      title: "Reports & Analytics",
      description: "Understanding threat reports and analytics",
      topics: ["Report Structure", "Analytics Dashboard", "Data Export"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Documentation</h1>
          <p className="text-muted-foreground">Complete guide to using the Argus Defense platform</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, index) => (
            <Card
              key={index}
              className="p-6 bg-card/50 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
            >
              <section.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
              <ul className="space-y-2">
                {section.topics.map((topic, i) => (
                  <li key={i} className="text-sm text-foreground hover:text-primary transition-colors">
                    • {topic}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-6 bg-card/50 border-primary/20">
          <h2 className="text-2xl font-bold mb-4">About Argus Defense</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Argus Defense is a decentralized threat intelligence platform that combines real-time monitoring,
              community validation, and blockchain verification to provide transparent and reliable threat intelligence.
            </p>
            <p>
              The platform monitors global threats including cyber attacks, natural disasters, geopolitical events, and
              supply chain disruptions. Reports are validated by the community through a stake-based system and stored
              on IPFS for permanent accessibility.
            </p>
            <p>
              Additionally, Argus Defense integrates emergency radio stream monitoring powered by libp2p, allowing users
              to monitor critical communications and earn rewards for participation.
            </p>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Documentation;
