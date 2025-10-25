import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Code, 
  Shield, 
  Zap, 
  ExternalLink,
  BookOpen,
  Users,
  MessageCircle,
  Github
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";

const Documentation = () => {
  const sections = [
    {
      title: "Getting Started",
      icon: BookOpen,
      description: "Learn the basics of Argus Defense platform",
      links: [
        { name: "Quick Start Guide", href: "#" },
        { name: "Platform Overview", href: "#" },
        { name: "Wallet Setup", href: "#" },
        { name: "First Report Submission", href: "#" }
      ]
    },
    {
      title: "API Reference",
      icon: Code,
      description: "Complete API documentation for developers",
      links: [
        { name: "REST API", href: "#" },
        { name: "GraphQL API", href: "#" },
        { name: "WebSocket Events", href: "#" },
        { name: "Rate Limits", href: "#" }
      ]
    },
    {
      title: "Smart Contracts",
      icon: Shield,
      description: "Blockchain contracts and Web3 integration",
      links: [
        { name: "Contract Addresses", href: "#" },
        { name: "ABI Documentation", href: "#" },
        { name: "Validation Protocol", href: "#" },
        { name: "Staking Mechanics", href: "#" }
      ]
    },
    {
      title: "Integration Guides",
      icon: Zap,
      description: "How to integrate with external systems",
      links: [
        { name: "IPFS Integration", href: "#" },
        { name: "The Graph Subgraph", href: "#" },
        { name: "Push Protocol", href: "#" },
        { name: "Chainlink Functions", href: "#" }
      ]
    }
  ];

  const resources = [
    {
      title: "Developer Discord",
      description: "Join our community for support and discussions",
      icon: MessageCircle,
      href: "#",
      color: "text-blue-400"
    },
    {
      title: "GitHub Repository",
      description: "Explore our open-source codebase",
      icon: Github,
      href: "#",
      color: "text-primary"
    },
    {
      title: "Bug Bounty Program",
      description: "Help secure the platform and earn rewards",
      icon: Shield,
      href: "#",
      color: "text-threat-low"
    },
    {
      title: "Community Forum",
      description: "Discuss features and share ideas",
      icon: Users,
      href: "#",
      color: "text-threat-medium"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to build with Argus Defense platform. 
            From quick start guides to comprehensive API references.
          </p>
        </div>

        {/* Quick Start Banner */}
        <Card className="p-8 bg-gradient-cyber text-center mb-12">
          <h2 className="text-2xl font-bold text-primary-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
            Follow our quick start guide to submit your first threat report and join the global intelligence network.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg">
              <BookOpen className="h-5 w-5 mr-2" />
              Quick Start Guide
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              <ExternalLink className="h-5 w-5 mr-2" />
              API Playground
            </Button>
          </div>
        </Card>

        {/* Documentation Sections */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {sections.map((section, index) => (
            <Card key={index} className="p-6 bg-card/50 border-primary/20 hover:border-primary/40 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <section.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
                  <p className="text-muted-foreground mb-4">{section.description}</p>
                  
                  <div className="space-y-2">
                    {section.links.map((link, linkIndex) => (
                      <a
                        key={linkIndex}
                        href={link.href}
                        className="block text-sm text-primary hover:text-primary-glow transition-colors flex items-center space-x-2"
                      >
                        <FileText className="h-3 w-3" />
                        <span>{link.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* SDK and Tools */}
        <Card className="p-8 bg-card/50 border-primary/20 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">SDKs & Developer Tools</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-4 bg-primary/10 rounded-lg inline-block mb-4">
                <Code className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">JavaScript SDK</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Full-featured SDK for web and Node.js applications
              </p>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View on NPM
              </Button>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-primary/10 rounded-lg inline-block mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Solidity Library</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Smart contract integration utilities
              </p>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                GitHub Repo
              </Button>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-primary/10 rounded-lg inline-block mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">CLI Tools</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Command-line interface for automation
              </p>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Installation
              </Button>
            </div>
          </div>
        </Card>

        {/* Community Resources */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Community & Support</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {resources.map((resource, index) => (
              <Card key={index} className="p-6 bg-card/50 border-primary/20 hover:border-primary/40 transition-colors text-center">
                <resource.icon className={`h-8 w-8 mx-auto mb-3 ${resource.color}`} />
                <h3 className="font-semibold mb-2">{resource.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="p-8 bg-card/50 border-primary/20">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {[
              {
                q: "How do I submit my first threat report?",
                a: "Connect your wallet, navigate to the Reports page, fill out the threat details, upload your supporting file, and submit to IPFS for validation."
              },
              {
                q: "What tokens do I earn for validated reports?",
                a: "Validated reports earn ARGUS tokens based on threat severity and community validation. Rewards range from 10-500 ARGUS per report."
              },
              {
                q: "How does the validation process work?",
                a: "Community validators stake ARGUS tokens and review submitted reports. Consensus-based validation ensures accuracy and prevents spam."
              },
              {
                q: "Can I integrate Argus data into my application?",
                a: "Yes! Use our REST API, GraphQL endpoint, or The Graph subgraph to access verified threat intelligence data."
              }
            ].map((faq, index) => (
              <div key={index} className="border-b border-border pb-4 last:border-b-0">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Documentation;
