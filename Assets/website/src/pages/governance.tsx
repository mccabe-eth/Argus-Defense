import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Vote, 
  Shield, 
  Users, 
  Coins, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  TrendingUp
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";

const Governance = () => {
  const [selectedTab, setSelectedTab] = useState("proposals");

  const proposals = [
    {
      id: "ADP-001",
      title: "Increase Validator Rewards by 15%",
      description: "Proposal to increase validation rewards to incentivize more community participation and improve network security.",
      status: "Active",
      votesFor: 1247,
      votesAgainst: 234,
      totalVotes: 1481,
      endDate: "2024-01-25",
      quorum: 1200,
      proposer: "0x1234...5678"
    },
    {
      id: "ADP-002", 
      title: "Implement Emergency Response Protocol",
      description: "Establish fast-track validation process for critical threats during emergency situations.",
      status: "Passed",
      votesFor: 2156,
      votesAgainst: 345,
      totalVotes: 2501,
      endDate: "2024-01-15",
      quorum: 1500,
      proposer: "0xABCD...EFGH"
    },
    {
      id: "ADP-003",
      title: "Treasury Allocation for Security Audit",
      description: "Allocate 100,000 ARGUS tokens from treasury for comprehensive smart contract security audit.",
      status: "Failed",
      votesFor: 567,
      votesAgainst: 1234,
      totalVotes: 1801,
      endDate: "2024-01-10",
      quorum: 1200,
      proposer: "0x9876...5432"
    }
  ];

  const treasuryData = {
    totalValue: "2,345,678",
    argusTokens: "1,890,234",
    ethBalance: "234.56",
    usdcBalance: "456,789",
    safeAddress: "0xSafe...Address",
    multisigThreshold: "3/5"
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-primary bg-primary/10";
      case "Passed": return "text-threat-low bg-threat-low/10";
      case "Failed": return "text-threat-high bg-threat-high/10";
      default: return "text-muted-foreground bg-muted/10";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active": return <Clock className="h-4 w-4" />;
      case "Passed": return <CheckCircle className="h-4 w-4" />;
      case "Failed": return <XCircle className="h-4 w-4" />;
      default: return <Vote className="h-4 w-4" />;
    }
  };

  const calculateProgress = (votesFor: number, totalVotes: number) => {
    return totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Governance & Treasury</h1>
          <p className="text-muted-foreground">Participate in protocol governance and monitor treasury operations</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-6">
          {["proposals", "treasury", "validators"].map((tab) => (
            <Button
              key={tab}
              variant={selectedTab === tab ? "cyber" : "outline"}
              onClick={() => setSelectedTab(tab)}
              className="capitalize"
            >
              {tab}
            </Button>
          ))}
        </div>

        {/* Proposals Tab */}
        {selectedTab === "proposals" && (
          <div className="space-y-6">
            {/* Governance Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="p-4 bg-card/50 border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Proposals</p>
                    <p className="text-2xl font-bold">23</p>
                  </div>
                  <Vote className="h-6 w-6 text-primary" />
                </div>
              </Card>
              <Card className="p-4 bg-card/50 border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Voters</p>
                    <p className="text-2xl font-bold">1,847</p>
                  </div>
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </Card>
              <Card className="p-4 bg-card/50 border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Voting Power</p>
                    <p className="text-2xl font-bold">45,678</p>
                  </div>
                  <Shield className="h-6 w-6 text-primary" />
                </div>
              </Card>
              <Card className="p-4 bg-card/50 border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Participation</p>
                    <p className="text-2xl font-bold">73%</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </Card>
            </div>

            {/* Proposals List */}
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <Card key={proposal.id} className="p-6 bg-card/50 border-primary/20">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {proposal.id}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(proposal.status)}`}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(proposal.status)}
                            <span>{proposal.status}</span>
                          </div>
                        </Badge>
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-2">{proposal.title}</h3>
                      <p className="text-muted-foreground mb-4">{proposal.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Votes For</p>
                          <p className="font-semibold text-threat-low">{proposal.votesFor.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Votes Against</p>
                          <p className="font-semibold text-threat-high">{proposal.votesAgainst.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Quorum</p>
                          <p className="font-semibold">{proposal.quorum.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Ends</p>
                          <p className="font-semibold">{proposal.endDate}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 lg:mt-0 lg:ml-6 space-y-2">
                      {proposal.status === "Active" && (
                        <>
                          <Button variant="cyber" size="sm" className="w-full">
                            Vote For
                          </Button>
                          <Button variant="outline" size="sm" className="w-full">
                            Vote Against
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Snapshot
                      </Button>
                    </div>
                  </div>
                  
                  {/* Voting Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Support: {calculateProgress(proposal.votesFor, proposal.totalVotes).toFixed(1)}%</span>
                      <span>{proposal.totalVotes.toLocaleString()} total votes</span>
                    </div>
                    <Progress value={calculateProgress(proposal.votesFor, proposal.totalVotes)} className="h-2" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Treasury Tab */}
        {selectedTab === "treasury" && (
          <div className="space-y-6">
            {/* Treasury Overview */}
            <Card className="p-6 bg-card/50 border-primary/20">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Shield className="h-6 w-6 mr-2 text-primary" />
                Treasury Overview
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <Coins className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">${treasuryData.totalValue}</p>
                  <p className="text-sm text-muted-foreground">Total Value (USD)</p>
                </div>
                <div className="text-center">
                  <div className="h-8 w-8 bg-primary rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-bold">
                    A
                  </div>
                  <p className="text-2xl font-bold">{treasuryData.argusTokens}</p>
                  <p className="text-sm text-muted-foreground">ARGUS Tokens</p>
                </div>
                <div className="text-center">
                  <div className="h-8 w-8 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-bold text-white">
                    ETH
                  </div>
                  <p className="text-2xl font-bold">{treasuryData.ethBalance}</p>
                  <p className="text-sm text-muted-foreground">ETH Balance</p>
                </div>
                <div className="text-center">
                  <div className="h-8 w-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-bold text-white">
                    $
                  </div>
                  <p className="text-2xl font-bold">{treasuryData.usdcBalance}</p>
                  <p className="text-sm text-muted-foreground">USDC Balance</p>
                </div>
              </div>
            </Card>

            {/* Safe Multisig Info */}
            <Card className="p-6 bg-card/50 border-primary/20">
              <h3 className="text-xl font-semibold mb-4">Safe Multisig Configuration</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Safe Address:</span>
                  <code className="text-primary">{treasuryData.safeAddress}</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Threshold:</span>
                  <Badge variant="outline">{treasuryData.multisigThreshold}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Signers:</span>
                  <span>5 authorized signers</span>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4">
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Safe App
              </Button>
            </Card>

            {/* Recent Transactions */}
            <Card className="p-6 bg-card/50 border-primary/20">
              <h3 className="text-xl font-semibold mb-4">Recent Treasury Operations</h3>
              
              <div className="space-y-3">
                {[
                  { type: "Validator Rewards", amount: "15,000 ARGUS", date: "2024-01-14", status: "Executed" },
                  { type: "Security Audit Payment", amount: "50 ETH", date: "2024-01-12", status: "Pending" },
                  { type: "Development Grant", amount: "25,000 ARGUS", date: "2024-01-10", status: "Executed" }
                ].map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <p className="font-medium">{tx.type}</p>
                      <p className="text-sm text-muted-foreground">{tx.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{tx.amount}</p>
                      <Badge className={tx.status === "Executed" ? "text-threat-low bg-threat-low/10" : "text-threat-medium bg-threat-medium/10"}>
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Validators Tab */}
        {selectedTab === "validators" && (
          <div className="space-y-6">
            <Card className="p-6 bg-card/50 border-primary/20">
              <h3 className="text-xl font-semibold mb-4">Validator Network</h3>
              <p className="text-muted-foreground mb-6">
                Stake ARGUS tokens to become a validator and earn rewards for verifying threat intelligence reports.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-sm text-muted-foreground">Active Validators</p>
                </div>
                <div className="text-center">
                  <Coins className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">2.3M</p>
                  <p className="text-sm text-muted-foreground">Total Staked</p>
                </div>
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">12.5%</p>
                  <p className="text-sm text-muted-foreground">APY</p>
                </div>
              </div>

              <Button variant="cyber" size="lg" className="w-full mt-6">
                Become a Validator
              </Button>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Governance;
