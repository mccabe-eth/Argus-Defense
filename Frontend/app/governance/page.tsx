"use client";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Shield, TrendingUp, Users, Vote } from "lucide-react";
import type { NextPage } from "next";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";

const Governance: NextPage = () => {
  const proposals = [
    { id: 1, title: "Increase Validator Stake Requirement", status: "active", votes: 1234, endDate: "2024-12-25" },
    { id: 2, title: "Add New Threat Category: AI/ML Security", status: "active", votes: 892, endDate: "2024-12-30" },
    { id: 3, title: "Update Report Validation Criteria", status: "passed", votes: 2156, endDate: "2024-12-10" },
  ];

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Governance</h1>
          <p className="text-muted-foreground">Participate in decentralized governance through Safe multisig</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-card/50 border-primary/20">
            <Vote className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Active Proposals</h3>
            <p className="text-3xl font-bold">5</p>
          </Card>
          <Card className="p-6 bg-card/50 border-primary/20">
            <Users className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Total Voters</h3>
            <p className="text-3xl font-bold">2,341</p>
          </Card>
          <Card className="p-6 bg-card/50 border-primary/20">
            <Shield className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Treasury</h3>
            <p className="text-3xl font-bold">$1.2M</p>
          </Card>
          <Card className="p-6 bg-card/50 border-primary/20">
            <TrendingUp className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Participation</h3>
            <p className="text-3xl font-bold">67%</p>
          </Card>
        </div>

        <Card className="p-6 bg-card/50 border-primary/20 mb-6">
          <h3 className="text-xl font-semibold mb-4">Safe Multisig</h3>
          <p className="text-muted-foreground mb-4">
            Governance is managed through Safe multisig contracts, ensuring transparent and secure decision-making.
          </p>
          <Button variant="cyber" className="glow-primary">
            Connect to Safe
          </Button>
        </Card>

        <h2 className="text-2xl font-bold mb-4">Active Proposals</h2>
        <div className="grid gap-4">
          {proposals.map(proposal => (
            <Card
              key={proposal.id}
              className="p-6 bg-card/50 border-primary/20 hover:border-primary/40 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={proposal.status === "active" ? "default" : "outline"}
                      className="text-xs capitalize"
                    >
                      {proposal.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Ends: {proposal.endDate}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{proposal.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{proposal.votes} votes</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {proposal.status === "active" && (
                    <Button variant="cyber" size="sm">
                      Vote
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Governance;
