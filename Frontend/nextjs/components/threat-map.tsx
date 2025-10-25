"use client";

import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { MapPin, Filter, AlertTriangle, Shield, Zap } from "lucide-react";
import Link from "next/link";

export const ThreatMap = () => {
  const [selectedThreat, setSelectedThreat] = useState<string | null>(null);

  const threats = [
    { id: "1", type: "Cyber", location: "Eastern Europe", severity: "high", title: "State-sponsored APT activity detected" },
    { id: "2", type: "Natural", location: "Pacific Coast", severity: "critical", title: "Category 4 Hurricane approaching" },
    { id: "3", type: "Supply Chain", location: "Southeast Asia", severity: "medium", title: "Manufacturing disruption reported" },
    { id: "4", type: "Geopolitical", location: "Middle East", severity: "high", title: "Border tensions escalating" },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "text-threat-low";
      case "medium": return "text-threat-medium";
      case "high": return "text-threat-high";
      case "critical": return "text-threat-critical";
      default: return "text-muted-foreground";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <AlertTriangle className="h-4 w-4" />;
      case "high": return <Shield className="h-4 w-4" />;
      case "medium": return <Zap className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Global Threat Intelligence</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real-time monitoring of global threats with community validation and blockchain verification.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 bg-card/50 border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Live Threat Map</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="cyber" size="sm">
                  Connect Wallet
                </Button>
              </div>
            </div>
            
            <div className="h-96 bg-background/50 rounded-lg border border-border cyber-grid relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-16 w-16 text-primary mx-auto mb-4 pulse-glow" />
                  <h4 className="text-lg font-semibold mb-2">Interactive Threat Map</h4>
                  <p className="text-muted-foreground">Connect wallet to view live threat intelligence</p>
                </div>
              </div>
              
              <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-threat-high rounded-full animate-pulse"></div>
              <div className="absolute top-2/3 right-1/3 w-3 h-3 bg-threat-critical rounded-full animate-pulse"></div>
              <div className="absolute bottom-1/4 left-1/2 w-3 h-3 bg-threat-medium rounded-full animate-pulse"></div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 border-primary/20">
            <h3 className="text-xl font-semibold mb-4">Active Threats</h3>
            
            <div className="space-y-4">
              {threats.map((threat) => (
                <div 
                  key={threat.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedThreat === threat.id 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedThreat(threat.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {threat.type}
                    </Badge>
                    <div className={`flex items-center space-x-1 ${getSeverityColor(threat.severity)}`}>
                      {getSeverityIcon(threat.severity)}
                      <span className="text-xs uppercase font-medium">{threat.severity}</span>
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-sm mb-1">{threat.title}</h4>
                  <p className="text-xs text-muted-foreground">{threat.location}</p>
                </div>
              ))}
            </div>

            <Link href="/threats">
              <Button variant="outline" className="w-full mt-4">
                View All Reports
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </section>
  );
};