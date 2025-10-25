"use client";

import { useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { 
  Activity, 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  MapPin,
  Clock,
  Users,
  Database
} from "lucide-react";
import { Header } from "~~/components/Header";
import { Footer } from "~~/components/Footer";
import type { NextPage } from "next";

const Dashboard: NextPage = () => {
  const [timeframe, setTimeframe] = useState("24h");

  const stats = [
    { label: "Active Threats", value: "1,247", change: "+12%", icon: AlertTriangle, color: "text-threat-high" },
    { label: "Verified Reports", value: "3,891", change: "+8%", icon: Shield, color: "text-threat-low" },
    { label: "Validators Online", value: "156", change: "+5%", icon: Users, color: "text-primary" },
    { label: "Data Sources", value: "23", change: "0%", icon: Database, color: "text-muted-foreground" },
  ];

  const recentThreats = [
    { id: 1, type: "Cyber", title: "State-sponsored APT detected", location: "Eastern Europe", time: "2 min ago", severity: "high" },
    { id: 2, type: "Natural", title: "Earthquake monitoring alert", location: "Pacific Ring", time: "15 min ago", severity: "medium" },
    { id: 3, type: "Supply Chain", title: "Port disruption reported", location: "Southeast Asia", time: "1 hour ago", severity: "critical" },
    { id: 4, type: "Geopolitical", title: "Border security update", location: "Central Europe", time: "2 hours ago", severity: "low" },
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

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Threat Intelligence Dashboard</h1>
            <p className="text-muted-foreground">Real-time global threat monitoring and analysis</p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            {["1h", "24h", "7d", "30d"].map((period) => (
              <Button
                key={period}
                variant={timeframe === period ? "cyber" : "outline"}
                size="sm"
                onClick={() => setTimeframe(period)}
              >
                {period}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 bg-card/50 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-threat-low">{stat.change}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 bg-card/50 border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Global Threat Map</h3>
              <Button variant="outline" size="sm">
                <MapPin className="h-4 w-4 mr-2" />
                View Full Map
              </Button>
            </div>
            
            <div className="h-64 bg-background/50 rounded-lg border border-border cyber-grid relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-primary mx-auto mb-3 pulse-glow" />
                  <h4 className="font-semibold mb-1">Live Threat Visualization</h4>
                  <p className="text-sm text-muted-foreground">Interactive global threat monitoring</p>
                </div>
              </div>
              
              <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-threat-high rounded-full animate-pulse"></div>
              <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-threat-critical rounded-full animate-pulse"></div>
              <div className="absolute bottom-1/3 left-2/3 w-2 h-2 bg-threat-medium rounded-full animate-pulse"></div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Recent Threats</h3>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="space-y-4">
              {recentThreats.map((threat) => (
                <div key={threat.id} className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {threat.type}
                    </Badge>
                    <span className={`text-xs uppercase font-medium ${getSeverityColor(threat.severity)}`}>
                      {threat.severity}
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-sm mb-1">{threat.title}</h4>
                  <p className="text-xs text-muted-foreground mb-1">{threat.location}</p>
                  <p className="text-xs text-muted-foreground">{threat.time}</p>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-4">
              View All Activity
            </Button>
          </Card>
        </div>

        <Card className="mt-6 p-6 bg-card/50 border-primary/20">
          <h3 className="text-xl font-semibold mb-4">Network Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">99.8%</p>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
            <div className="text-center">
              <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">1.2s</p>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">45,891</p>
              <p className="text-sm text-muted-foreground">Threats Processed</p>
            </div>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;