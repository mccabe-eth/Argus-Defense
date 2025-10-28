"use client";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { CheckCircle, Clock, FileText, Upload } from "lucide-react";
import type { NextPage } from "next";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";

const Reports: NextPage = () => {
  const reports = [
    {
      id: 1,
      title: "Q4 2024 Cyber Threat Analysis",
      author: "0x742d...4e8f",
      date: "2024-12-15",
      status: "verified",
      ipfs: "Qm...",
    },
    {
      id: 2,
      title: "Supply Chain Vulnerability Assessment",
      author: "0x8a3c...2d1b",
      date: "2024-12-10",
      status: "pending",
      ipfs: "Qm...",
    },
    {
      id: 3,
      title: "Geopolitical Risk Report - Central Asia",
      author: "0x5f1a...9c7e",
      date: "2024-12-05",
      status: "verified",
      ipfs: "Qm...",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Threat Intelligence Reports</h1>
          <p className="text-muted-foreground">Submit and access verified threat intelligence reports</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-card/50 border-primary/20">
            <FileText className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Total Reports</h3>
            <p className="text-3xl font-bold">3,891</p>
          </Card>
          <Card className="p-6 bg-card/50 border-primary/20">
            <CheckCircle className="h-8 w-8 text-threat-low mb-4" />
            <h3 className="text-xl font-semibold mb-2">Verified</h3>
            <p className="text-3xl font-bold">3,245</p>
          </Card>
          <Card className="p-6 bg-card/50 border-primary/20">
            <Clock className="h-8 w-8 text-threat-medium mb-4" />
            <h3 className="text-xl font-semibold mb-2">Pending</h3>
            <p className="text-3xl font-bold">646</p>
          </Card>
        </div>

        <Card className="p-6 bg-card/50 border-primary/20 mb-6">
          <h3 className="text-xl font-semibold mb-4">Submit New Report</h3>
          <p className="text-muted-foreground mb-4">
            Share threat intelligence with the community. Reports are stored on IPFS and verified through community
            validation.
          </p>
          <Button variant="cyber" className="glow-primary">
            <Upload className="h-4 w-4 mr-2" />
            Submit Report
          </Button>
        </Card>

        <h2 className="text-2xl font-bold mb-4">Recent Reports</h2>
        <div className="grid gap-4">
          {reports.map(report => (
            <Card
              key={report.id}
              className="p-6 bg-card/50 border-primary/20 hover:border-primary/40 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={report.status === "verified" ? "default" : "outline"}
                      className="text-xs capitalize"
                    >
                      {report.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">IPFS: {report.ipfs}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{report.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Author: {report.author}</span>
                    <span>{report.date}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Report
                  </Button>
                  {report.status === "pending" && (
                    <Button variant="cyber" size="sm">
                      Validate
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

export default Reports;
