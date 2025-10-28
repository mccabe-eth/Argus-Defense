"use client";

import { useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Filter, MapPin, Search } from "lucide-react";
import type { NextPage } from "next";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";

const Threats: NextPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const threats = [
    {
      id: 1,
      type: "Cyber",
      title: "State-sponsored APT campaign targeting critical infrastructure",
      location: "Eastern Europe",
      time: "2 hours ago",
      severity: "critical",
      status: "active",
    },
    {
      id: 2,
      type: "Natural",
      title: "Severe weather system approaching coastal regions",
      location: "Pacific Coast",
      time: "5 hours ago",
      severity: "high",
      status: "monitoring",
    },
    {
      id: 3,
      type: "Supply Chain",
      title: "Major port disruption affecting global logistics",
      location: "Southeast Asia",
      time: "1 day ago",
      severity: "high",
      status: "active",
    },
    {
      id: 4,
      type: "Geopolitical",
      title: "Border tensions escalating in disputed territory",
      location: "Central Asia",
      time: "2 days ago",
      severity: "medium",
      status: "monitoring",
    },
    {
      id: 5,
      type: "Cyber",
      title: "Ransomware campaign targeting healthcare sector",
      location: "North America",
      time: "3 days ago",
      severity: "high",
      status: "active",
    },
    {
      id: 6,
      type: "Natural",
      title: "Seismic activity increase in volcanic region",
      location: "Pacific Ring of Fire",
      time: "1 week ago",
      severity: "low",
      status: "resolved",
    },
  ];

  const categories = ["all", "cyber", "natural", "supply chain", "geopolitical"];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "text-threat-low";
      case "medium":
        return "text-threat-medium";
      case "high":
        return "text-threat-high";
      case "critical":
        return "text-threat-critical";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Global Threats</h1>
          <p className="text-muted-foreground">Monitor and analyze threats from around the world</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search threats..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "cyber" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="grid gap-4">
          {threats.map(threat => (
            <Card
              key={threat.id}
              className="p-6 bg-card/50 border-primary/20 hover:border-primary/40 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {threat.type}
                    </Badge>
                    <Badge variant={threat.status === "active" ? "default" : "outline"} className="text-xs capitalize">
                      {threat.status}
                    </Badge>
                    <span className={`text-xs uppercase font-medium ${getSeverityColor(threat.severity)}`}>
                      {threat.severity}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{threat.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {threat.location}
                    </span>
                    <span>{threat.time}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="cyber" size="sm">
                    Validate
                  </Button>
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

export default Threats;
