import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  Shield, 
  MapPin, 
  Clock,
  ExternalLink,
  FileText,
  Users
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";

const Threats = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const threats = [
    {
      id: "T-001",
      title: "Advanced Persistent Threat Campaign Detected",
      type: "Cyber",
      severity: "critical",
      location: "Eastern Europe",
      timestamp: "2024-01-15T10:30:00Z",
      status: "Active",
      description: "State-sponsored threat actor utilizing zero-day exploits targeting critical infrastructure.",
      attestations: 23,
      ipfsHash: "QmX7Y9Z...",
      validatedBy: "0x1234...5678"
    },
    {
      id: "T-002", 
      title: "Category 4 Hurricane Approaching Coastal Regions",
      type: "Natural",
      severity: "high",
      location: "Gulf of Mexico",
      timestamp: "2024-01-15T08:15:00Z",
      status: "Monitoring",
      description: "Major hurricane system expected to make landfall within 48 hours.",
      attestations: 45,
      ipfsHash: "QmA1B2C...",
      validatedBy: "0xABCD...EFGH"
    },
    {
      id: "T-003",
      title: "Supply Chain Disruption in Manufacturing Sector",
      type: "Supply Chain",
      severity: "medium",
      location: "Southeast Asia",
      timestamp: "2024-01-15T06:45:00Z",
      status: "Investigating",
      description: "Critical component shortages affecting global electronics production.",
      attestations: 12,
      ipfsHash: "QmP3Q4R...",
      validatedBy: "0x9876...5432"
    },
    {
      id: "T-004",
      title: "Border Security Enhancement Protocols",
      type: "Geopolitical",
      severity: "low",
      location: "Central Europe",
      timestamp: "2024-01-15T04:20:00Z",
      status: "Resolved",
      description: "Increased security measures at border crossings following intelligence reports.",
      attestations: 8,
      ipfsHash: "QmS5T6U...",
      validatedBy: "0xDEF0...1234"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "text-threat-low border-threat-low/20 bg-threat-low/5";
      case "medium": return "text-threat-medium border-threat-medium/20 bg-threat-medium/5";
      case "high": return "text-threat-high border-threat-high/20 bg-threat-high/5";
      case "critical": return "text-threat-critical border-threat-critical/20 bg-threat-critical/5";
      default: return "text-muted-foreground border-border";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-threat-high bg-threat-high/10";
      case "Monitoring": return "text-threat-medium bg-threat-medium/10";
      case "Investigating": return "text-primary bg-primary/10";
      case "Resolved": return "text-threat-low bg-threat-low/10";
      default: return "text-muted-foreground bg-muted/10";
    }
  };

  const filteredThreats = threats.filter(threat => {
    const matchesSearch = threat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threat.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threat.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "all" || threat.type.toLowerCase() === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Threat Intelligence Reports</h1>
          <p className="text-muted-foreground">Browse and analyze verified threat intelligence from global sources</p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 bg-card/50 border-primary/20 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search threats, locations, or types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              {["all", "cyber", "natural", "supply chain", "geopolitical"].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? "cyber" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter)}
                  className="capitalize"
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Threat Reports Grid */}
        <div className="grid gap-6">
          {filteredThreats.map((threat) => (
            <Card key={threat.id} className="p-6 bg-card/50 border-primary/20 hover:border-primary/40 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {threat.id}
                    </Badge>
                    <Badge className={`text-xs ${getSeverityColor(threat.severity)}`}>
                      {threat.severity.toUpperCase()}
                    </Badge>
                    <Badge className={`text-xs ${getStatusColor(threat.status)}`}>
                      {threat.status}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">{threat.title}</h3>
                  <p className="text-muted-foreground mb-3">{threat.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{threat.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(threat.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{threat.attestations} attestations</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 mt-4 lg:mt-0 lg:ml-6">
                  <Button variant="cyber" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    IPFS Link
                  </Button>
                </div>
              </div>
              
              {/* Validation Info */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">
                      Validated by: <code className="text-primary">{threat.validatedBy}</code>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">IPFS:</span>
                    <code className="text-xs text-primary">{threat.ipfsHash}</code>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Submit Report CTA */}
        <Card className="mt-8 p-8 bg-gradient-cyber text-center">
          <h3 className="text-2xl font-bold text-primary-foreground mb-4">
            Contribute to Global Security
          </h3>
          <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
            Help protect the world by submitting verified threat intelligence. 
            Earn rewards for validated contributions to the network.
          </p>
          <Button variant="secondary" size="lg">
            Submit Threat Report
          </Button>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Threats;
