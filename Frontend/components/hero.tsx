import Link from "next/link";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Activity, Eye, Globe, Shield } from "lucide-react";

export const Hero = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-card border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Activity className="h-4 w-4 text-primary pulse-glow" />
            <span className="text-sm font-medium">Live Threat Intelligence</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-gradient-cyber">Global Threat Intelligence</span>
            <br />
            <span className="text-foreground">Powered by Web3</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Real-time threat monitoring, decentralized validation, and blockchain-verified intelligence. Secure the
            world with community-driven threat intelligence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button variant="cyber" size="lg" className="glow-primary">
                Launch Dashboard
              </Button>
            </Link>
            <Link href="/documentation">
              <Button variant="outline" size="lg">
                View Documentation
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 bg-card/50 border-primary/20 hover:border-primary/40 transition-colors">
            <div className="mb-4">
              <Globe className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Global Monitoring</h3>
            <p className="text-muted-foreground">
              Real-time threat tracking across geopolitical events, natural disasters, and cyber incidents.
            </p>
          </Card>

          <Card className="p-6 bg-card/50 border-primary/20 hover:border-primary/40 transition-colors">
            <div className="mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Decentralized Validation</h3>
            <p className="text-muted-foreground">
              Community-driven threat verification with stake-based validation and EAS attestations.
            </p>
          </Card>

          <Card className="p-6 bg-card/50 border-primary/20 hover:border-primary/40 transition-colors">
            <div className="mb-4">
              <Eye className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Transparent Intelligence</h3>
            <p className="text-muted-foreground">
              IPFS-stored reports, blockchain verification, and transparent governance through Safe multisig.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};
