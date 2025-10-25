# Argus Defense - Frontend Application

Web3-powered global threat intelligence platform with real-time monitoring, decentralized validation, blockchain-verified reporting, and emergency radio stream monitoring.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Pages](#pages)
- [Components](#components)
- [Styling](#styling)
- [Configuration](#configuration)
- [Development](#development)

## Overview

Argus Defense is a comprehensive platform that combines:
- **Threat Intelligence**: Real-time monitoring and validation of global threats
- **Radio Streaming**: Emergency radio stream monitoring powered by libp2p
- **Web3 Integration**: Wallet connection, staking, and governance through Safe multisig
- **Decentralized Storage**: IPFS integration for report storage

## Features

### Threat Intelligence
- Real-time global threat monitoring dashboard
- Threat categorization (Cyber, Natural, Geopolitical, Supply Chain)
- Community-driven threat validation system
- Blockchain-verified intelligence reports
- Interactive threat map visualization

### Radio Streams
- Emergency radio frequency monitoring
- Real-time audio streaming via libp2p
- Listener count tracking
- Reward system for monitoring participation

### Web3 Features
- RainbowKit wallet integration
- Safe multisig governance
- Stake-based validation system
- EAS attestations support
- On-chain treasury management

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (custom cyber theme)
- **Web3**: wagmi, RainbowKit, viem
- **P2P**: libp2p, @chainsafe/libp2p-gossipsub
- **UI Components**: Custom components + lucide-react icons
- **State Management**: Zustand
- **Package Manager**: Yarn 3.2.3

## Project Structure

```
frontend/nextjs/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Landing page (Hero + ThreatMap)
│   ├── dashboard/                # Threat intelligence dashboard
│   ├── threats/                  # Global threats list
│   ├── reports/                  # Intelligence reports
│   ├── governance/               # Governance & voting
│   ├── documentation/            # Platform documentation
│   ├── streams/                  # Radio streams (libp2p)
│   └── layout.tsx                # Root layout with providers
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── button.tsx            # Button variants
│   │   ├── card.tsx              # Card component
│   │   ├── badge.tsx             # Badge component
│   │   └── index.ts              # UI exports
│   ├── argus-header.tsx          # Main navigation header
│   ├── argus-footer.tsx          # Site footer
│   ├── hero.tsx                  # Landing page hero
│   ├── threat-map.tsx            # Threat visualization
│   ├── Libp2pStreamPlayer.tsx    # Audio player for streams
│   └── scaffold-eth/             # Web3 components (preserved)
├── styles/
│   └── globals.css               # Tailwind + Argus cyber theme
├── hooks/
│   └── scaffold-eth/             # Web3 hooks
├── services/
│   ├── store/                    # Zustand state management
│   └── web3/                     # Web3 configuration
└── public/
    └── argus-logo.png            # Argus Defense logo
```

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn 3.2.3
- Git

### Installation

1. **Clone the repository**
   ```bash
   cd frontend/nextjs
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Start development server**
   ```bash
   yarn dev
   ```

4. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_IPFS_BUILD=false
```

## Pages

### `/` - Landing Page
- Hero section with platform overview
- Feature highlights (Global Monitoring, Decentralized Validation, Transparent Intelligence)
- Interactive threat map preview
- Call-to-action buttons

### `/dashboard` - Threat Intelligence Dashboard
- Real-time threat statistics
- Active threats counter with severity levels
- Validator network status
- Global threat map visualization
- Recent threat activity feed
- Network performance metrics

### `/threats` - Global Threats
- Searchable and filterable threat list
- Category filters (Cyber, Natural, Supply Chain, Geopolitical)
- Threat severity indicators (Low, Medium, High, Critical)
- Detailed threat information with location and timestamps
- Validation actions

### `/reports` - Intelligence Reports
- Report submission interface
- IPFS-stored report access
- Community validation status
- Verified reports showcase
- Author attribution with wallet addresses

### `/governance` - Governance
- Active proposal voting
- Safe multisig integration
- Treasury overview
- Participation statistics
- Governance history

### `/documentation` - Documentation
- Platform guides and tutorials
- API documentation
- Developer resources
- Integration guides for threat intelligence, Web3, and radio streams

### `/streams` - Emergency Radio Streams
- Live emergency radio monitoring
- libp2p-powered audio streaming
- Active listener counts
- Stream metadata (talkgroup, system, category)
- Play/stop controls
- Wallet-connected rewards tracking

## Components

### Layout Components

#### ArgusHeader
- Responsive navigation with mobile menu
- Logo and branding
- Navigation links to all pages
- RainbowKit wallet connection button
- Sticky header with backdrop blur

#### ArgusFooter
- Platform information
- Quick links (Platform, Web3, Resources)
- Social media links
- Copyright and legal links

### Feature Components

#### Hero
- Gradient text effects
- Feature cards with icons
- Call-to-action buttons
- Live threat intelligence indicator

#### ThreatMap
- Interactive threat visualization placeholder
- Active threats sidebar
- Threat filtering
- Severity-based color coding
- Click-to-select threat details

### UI Components

All UI components follow the Argus Defense cyber theme with:
- Dark backgrounds with cyan accents
- Glow effects on interactive elements
- Consistent border and spacing
- Responsive design patterns

## Styling

### Argus Defense Cyber Theme

Custom CSS variables in `globals.css`:

```css
--background: 210 30% 8%;         /* Dark background */
--primary: 180 100% 50%;          /* Cyan brand color */
--threat-low: 120 60% 50%;        /* Green */
--threat-medium: 45 100% 60%;     /* Yellow */
--threat-high: 0 85% 60%;         /* Orange-red */
--threat-critical: 340 80% 55%;   /* Red-pink */
```

### Utility Classes

```css
.cyber-grid                /* Grid pattern background */
.glow-primary             /* Primary glow effect */
.pulse-glow               /* Pulsing animation */
.bg-gradient-cyber        /* Cyan gradient */
.text-threat-{level}      /* Threat level colors */
```

## Configuration

### Web3 Configuration

- **Wallet Provider**: RainbowKit with wagmi
- **Supported Networks**: Configured in `services/web3/wagmiConfig.tsx`
- **Safe Integration**: Governance multisig contracts

### libp2p Configuration

- **Protocols**: gossipsub, noise, mplex, webrtc
- **Bootstrap Nodes**: Configured for P2P discovery
- **Audio Streaming**: Real-time audio via libp2p streams

## Development

### Key Scripts

```bash
yarn dev          # Start development server
yarn build        # Production build
yarn start        # Start production server
yarn lint         # Run ESLint
yarn format       # Format code with Prettier
```

### Adding New Pages

1. Create page directory in `app/`
2. Add `page.tsx` with component
3. Import ArgusHeader and ArgusFooter
4. Add route to header navigation in `argus-header.tsx`

### Creating UI Components

1. Add component to `components/ui/`
2. Follow Argus theme patterns
3. Export from `components/ui/index.ts`
4. Use TypeScript for props

### Styling Guidelines

- Use HSL colors for theme consistency
- Apply cyber-grid class for backgrounds
- Use threat-level colors for severity indicators
- Maintain dark-first design approach
- Ensure responsive breakpoints (sm, md, lg)

## Notes

- Original scaffold-eth pages (blockexplorer, debug) have been removed
- Old Header/Footer components backed up as `.backup` files
- Assets/website/ folder preserved for reference
- All pages use consistent Argus branding and navigation

---

Built with Next.js, Web3, and libp2p by Argus Defense
