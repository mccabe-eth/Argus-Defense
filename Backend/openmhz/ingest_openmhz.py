#!/usr/bin/env python3
"""
OpenMHz Stream Ingestion Script
Fetches streams from OpenMHz.com and assigns blockchain wallets

Usage:
    python3 ingest_openmhz.py --system rhode-island
    python3 ingest_openmhz.py --system rhode-island --assign-wallets --save-registry
"""

import argparse
import json
import sys
import time
import subprocess
import os
from typing import List, Dict, Optional
from datetime import datetime
import requests


# ============================================================================
# OpenMHz API Client
# ============================================================================

class OpenMHZClient:
    """Fetches streams and metadata from OpenMHz API"""

    BASE_URL = "https://api.openmhz.com"

    def __init__(self, system_id: str, verbose: bool = False):
        self.system_id = system_id
        self.verbose = verbose
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': 'Argus-Defense-SDR-Ingest/1.0'})

    def get_recent_calls(self, talkgroup_ids: Optional[List[int]] = None,
                        since_time: Optional[float] = None) -> List[Dict]:
        """Fetch recent calls from the system"""
        if since_time is None:
            since_time = time.time() - 300  # Last 5 minutes

        url = f"{self.BASE_URL}/{self.system_id}/calls/newer"
        params = {'time': str(int(since_time * 1000))}

        if talkgroup_ids:
            params['filter-type'] = 'talkgroup'
            params['filter-code'] = ','.join(map(str, talkgroup_ids))

        try:
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            calls = response.json().get('calls', [])
            return [c for c in calls if c.get('len', 0) > 0]  # Filter zero-length
        except requests.RequestException as e:
            if self.verbose:
                print(f"API Error: {e}", file=sys.stderr)
            return []

    def get_talkgroups(self) -> List[Dict]:
        """Fetch talkgroup metadata"""
        try:
            url = f"{self.BASE_URL}/{self.system_id}/talkgroups"
            response = self.session.get(url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    return [item for item in data if isinstance(item, dict)]
            return []
        except:
            return []


# ============================================================================
# Blockchain Wallet Assignment
# ============================================================================

class WalletAssigner:
    """Assigns blockchain wallets to streams via TypeScript script"""

    def __init__(self, backend_dir: str):
        self.backend_dir = backend_dir
        self.script_path = os.path.join(backend_dir, "scripts", "generateStreamWallet.ts")

    def assign_wallet(self, stream_id: str, stream_name: str) -> Optional[Dict]:
        """Generate or retrieve wallet for a stream"""
        if not os.path.exists(self.script_path):
            return None

        try:
            result = subprocess.run(
                ["ts-node", self.script_path,
                 "--streamId", stream_id,
                 "--streamName", stream_name,
                 "--mode", "simple"],
                capture_output=True,
                text=True,
                timeout=30,
                cwd=self.backend_dir
            )

            if result.returncode != 0:
                return None

            # Parse JSON output between markers
            output = result.stdout
            if "JSON_OUTPUT_START" in output and "JSON_OUTPUT_END" in output:
                start = output.index("JSON_OUTPUT_START") + len("JSON_OUTPUT_START")
                end = output.index("JSON_OUTPUT_END")
                return json.loads(output[start:end].strip())
            return None
        except:
            return None


# ============================================================================
# Stream Profile Generation
# ============================================================================

class StreamProfileGenerator:
    """Generates stream profiles with metadata and wallet info"""

    @staticmethod
    def generate_profile(call: Dict, system_id: str, talkgroup_info: Optional[Dict] = None,
                        wallet_data: Optional[Dict] = None) -> Dict:
        """Create a stream profile from call data"""
        talkgroup_num = call.get('talkgroupNum', 'unknown')

        # Build name from talkgroup info
        if talkgroup_info:
            name = talkgroup_info.get('description') or talkgroup_info.get('alpha') or f"Talkgroup {talkgroup_num}"
        else:
            name = f"Talkgroup {talkgroup_num}"

        # Build description
        duration = call.get('len', 0)
        num_radios = len(call.get('srcList', []))
        time_str = call.get('time', '')

        desc_parts = [
            f"System: {system_id}",
            f"Duration: {duration}s",
            f"Radios: {num_radios}"
        ]
        if talkgroup_info and 'tag' in talkgroup_info:
            desc_parts.insert(1, f"Category: {talkgroup_info['tag']}")

        stream_id = f"{system_id}-{talkgroup_num}-{call.get('_id', '')}"

        profile = {
            'stream_id': stream_id,
            'name': name,
            'description': " | ".join(desc_parts),
            'audio_url': call.get('url', ''),
            'system_name': system_id,
            'talkgroup_id': talkgroup_num,
            'timestamp': time_str,
            'duration': duration,
            'metadata': {
                'call_id': call.get('_id', ''),
                'talkgroup_info': talkgroup_info
            }
        }

        # Add wallet if provided
        if wallet_data:
            profile['wallet'] = {
                'address': wallet_data.get('walletAddress'),
                'mode': wallet_data.get('mode', 'simple'),
                'created_at': wallet_data.get('createdAt')
            }

        return profile

    @staticmethod
    def generate_system_profile(system_id: str, talkgroups: List[Dict], calls: List[Dict],
                                wallet_assigner: Optional[WalletAssigner] = None) -> Dict:
        """Generate complete system profile with all streams"""
        # Build talkgroup lookup
        tg_lookup = {}
        for tg in talkgroups:
            if isinstance(tg, dict):
                tg_id = tg.get('num') or tg.get('decimal') or tg.get('id')
                if tg_id:
                    tg_lookup[tg_id] = tg

        # Generate stream profiles
        streams = []
        for call in calls:
            talkgroup_num = call.get('talkgroupNum')
            tg_info = tg_lookup.get(talkgroup_num)

            # Assign wallet if requested
            wallet_data = None
            if wallet_assigner:
                stream_id = f"{system_id}-{talkgroup_num}-{call.get('_id', '')}"
                stream_name = tg_info.get('description') if tg_info else f"Talkgroup {talkgroup_num}"
                wallet_data = wallet_assigner.assign_wallet(stream_id, stream_name)

            profile = StreamProfileGenerator.generate_profile(
                call, system_id, tg_info, wallet_data
            )
            streams.append(profile)

        # Sort by timestamp (newest first)
        streams.sort(key=lambda x: x['timestamp'], reverse=True)

        return {
            'system_id': system_id,
            'total_streams': len(streams),
            'streams': streams,
            'generated_at': datetime.utcnow().isoformat() + 'Z'
        }


# ============================================================================
# Main Ingestion Function
# ============================================================================

def ingest_system(system_id: str, talkgroup_ids: Optional[List[int]] = None,
                 assign_wallets: bool = False, save_registry: bool = False,
                 verbose: bool = False) -> Dict:
    """
    Main ingestion function

    Args:
        system_id: OpenMHz system ID (e.g., 'rhode-island')
        talkgroup_ids: Optional list of specific talkgroups
        assign_wallets: Whether to assign blockchain wallets
        save_registry: Whether to save to streams.json
        verbose: Enable debug output

    Returns:
        Dictionary with system profile and streams
    """
    print(f"Ingesting: {system_id}", file=sys.stderr)

    # Fetch data from OpenMHz
    client = OpenMHZClient(system_id, verbose)
    talkgroups = client.get_talkgroups()
    calls = client.get_recent_calls(talkgroup_ids)

    print(f"Found: {len(calls)} calls", file=sys.stderr)

    # Initialize wallet assigner if requested
    wallet_assigner = None
    if assign_wallets:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.dirname(script_dir)
        wallet_assigner = WalletAssigner(backend_dir)
        print(f"Wallet assignment enabled", file=sys.stderr)

    # Generate profiles
    profile = StreamProfileGenerator.generate_system_profile(
        system_id, talkgroups, calls, wallet_assigner
    )

    # Save to registry if requested
    if save_registry:
        registry_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'streams.json')

        # Load existing registry
        registry = {}
        if os.path.exists(registry_file):
            with open(registry_file, 'r') as f:
                registry = json.load(f)

        # Update and save
        registry[system_id] = profile
        registry['last_updated'] = datetime.utcnow().isoformat() + 'Z'

        with open(registry_file, 'w') as f:
            json.dump(registry, f, indent=2)

        print(f"Saved to: {registry_file}", file=sys.stderr)

    return profile


# ============================================================================
# CLI
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description='Ingest radio streams from OpenMHz.com',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Basic ingestion
  python3 ingest_openmhz.py --system rhode-island

  # With blockchain wallets and registry
  python3 ingest_openmhz.py --system rhode-island --assign-wallets --save-registry

  # Filter specific talkgroups
  python3 ingest_openmhz.py --system kcers1b --talkgroups 3344,3408
        """
    )

    parser.add_argument('--system', '-s', required=True,
                       help='System ID (e.g., "rhode-island")')
    parser.add_argument('--talkgroups', '-t',
                       help='Comma-separated talkgroup IDs')
    parser.add_argument('--assign-wallets', action='store_true',
                       help='Assign blockchain wallets to streams')
    parser.add_argument('--save-registry', action='store_true',
                       help='Save to streams.json registry')
    parser.add_argument('--output', '-o',
                       help='Output file (default: stdout)')
    parser.add_argument('--debug', '-d', action='store_true',
                       help='Enable debug output')

    args = parser.parse_args()

    # Parse talkgroup IDs
    talkgroup_ids = None
    if args.talkgroups:
        try:
            talkgroup_ids = [int(tid.strip()) for tid in args.talkgroups.split(',')]
        except ValueError:
            print("Error: Talkgroup IDs must be integers", file=sys.stderr)
            sys.exit(1)

    # Run ingestion
    try:
        profile = ingest_system(
            args.system,
            talkgroup_ids=talkgroup_ids,
            assign_wallets=args.assign_wallets,
            save_registry=args.save_registry,
            verbose=args.debug
        )

        # Output JSON
        output = json.dumps(profile, indent=2)

        if args.output:
            with open(args.output, 'w') as f:
                f.write(output)
            print(f"Output written to: {args.output}", file=sys.stderr)
        else:
            print(output)

        print(f"\nComplete: {profile['total_streams']} streams", file=sys.stderr)

    except KeyboardInterrupt:
        print("\nCancelled", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        if args.debug:
            import traceback
            traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
