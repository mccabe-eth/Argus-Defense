import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Upload, 
  FileText, 
  Shield, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Link as LinkIcon
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";

const Reports = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [location, setLocation] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("medium");

  const myReports = [
    {
      id: "R-001",
      title: "Ransomware Attack on Healthcare Network",
      status: "Validated",
      submissions: 3,
      rewards: "45.2 ARGUS",
      timestamp: "2024-01-10",
      ipfsHash: "QmX1Y2Z3..."
    },
    {
      id: "R-002",
      title: "Flood Risk Assessment - Southeast Region",
      status: "Under Review",
      submissions: 1,
      rewards: "Pending",
      timestamp: "2024-01-12",
      ipfsHash: "QmA4B5C6..."
    },
    {
      id: "R-003",
      title: "Supply Chain Vulnerability Analysis",
      status: "Rejected",
      submissions: 2,
      rewards: "0 ARGUS",
      timestamp: "2024-01-08",
      ipfsHash: "QmD7E8F9..."
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Validated": return "text-threat-low bg-threat-low/10";
      case "Under Review": return "text-threat-medium bg-threat-medium/10";
      case "Rejected": return "text-threat-high bg-threat-high/10";
      default: return "text-muted-foreground bg-muted/10";
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = () => {
    // In real implementation, this would:
    // 1. Upload file to IPFS
    // 2. Create blockchain transaction
    // 3. Submit for validation
    console.log("Submitting report...");
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Submit & Manage Reports</h1>
          <p className="text-muted-foreground">Contribute to global threat intelligence and track your submissions</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Submit New Report */}
          <Card className="p-6 bg-card/50 border-primary/20">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Upload className="h-6 w-6 mr-2 text-primary" />
              Submit New Report
            </h2>

            <div className="space-y-6">
              {/* Report Details */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Report Title</Label>
                  <Input
                    id="title"
                    placeholder="Brief descriptive title for the threat"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of the threat or incident"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Geographic location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="severity">Severity Level</Label>
                    <select
                      id="severity"
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                      value={selectedSeverity}
                      onChange={(e) => setSelectedSeverity(e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  accept=".json,.txt,.pdf,.doc,.docx"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  {selectedFile ? (
                    <div>
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">Click to change file</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium mb-2">Upload Threat Intelligence File</p>
                      <p className="text-xs text-muted-foreground">JSON, TXT, PDF, DOC files up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>

              {/* Submission Info */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Submission Process</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• File will be stored on IPFS for immutable access</li>
                      <li>• Report hash will be recorded on blockchain</li>
                      <li>• Community validators will review for accuracy</li>
                      <li>• Earn ARGUS tokens for validated submissions</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSubmit}
                className="w-full" 
                variant="cyber" 
                size="lg"
                disabled={!selectedFile || !reportTitle}
              >
                Submit Report to Network
              </Button>
            </div>
          </Card>

          {/* My Reports */}
          <Card className="p-6 bg-card/50 border-primary/20">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-primary" />
              My Reports
            </h2>

            <div className="space-y-4">
              {myReports.map((report) => (
                <div key={report.id} className="border border-border rounded-lg p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-mono text-muted-foreground">{report.id}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                      <h4 className="font-medium text-sm">{report.title}</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{report.timestamp}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{report.submissions} submissions</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <LinkIcon className="h-3 w-3 text-primary" />
                      <code className="text-xs text-primary">{report.ipfsHash}</code>
                    </div>
                    <span className="text-sm font-medium text-primary">{report.rewards}</span>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-4">
              View All Reports
            </Button>
          </Card>
        </div>

        {/* Validation Network Stats */}
        <Card className="mt-8 p-6 bg-card/50 border-primary/20">
          <h3 className="text-xl font-semibold mb-6">Network Validation Statistics</h3>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <CheckCircle className="h-8 w-8 text-threat-low mx-auto mb-2" />
              <p className="text-2xl font-bold">1,247</p>
              <p className="text-sm text-muted-foreground">Reports Validated</p>
            </div>
            <div>
              <AlertTriangle className="h-8 w-8 text-threat-medium mx-auto mb-2" />
              <p className="text-2xl font-bold">89</p>
              <p className="text-sm text-muted-foreground">Under Review</p>
            </div>
            <div>
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">156</p>
              <p className="text-sm text-muted-foreground">Active Validators</p>
            </div>
            <div>
              <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">98.3%</p>
              <p className="text-sm text-muted-foreground">Accuracy Rate</p>
            </div>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Reports;
