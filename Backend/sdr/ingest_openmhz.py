#!/usr/bin/env python3
"""
OpenMHz Stream Ingestion Script
Fetches radio system metadata and audio streams from OpenMHz.com
"""

import argparse
import json
import sys
import time
from typing import List, Dict, Optional
from datetime import datetime
import requests


class OpenMHZClient:
    """Client for interacting with the OpenMHz API"""

    BASE_URL = "https://api.openmhz.com"

    def __init__(self, system_id: str, verbose: bool = False):
        """
        Initialize OpenMHz client

        Args:
            system_id: The short name/ID of the radio system (e.g., 'kcers1b', 'rhode-island')
            verbose: Enable verbose debug output
        """
        self.system_id = system_id
        self.verbose = verbose
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Argus-Defense-SDR-Ingest/1.0'
        })

    def get_system_info(self) -> Optional[Dict]:
        """
        Fetch system information from OpenMHz

        Returns:
            Dictionary containing system metadata or None if error
        """
        try:
            # Try to get system info from the main API
            url = f"{self.BASE_URL}/{self.system_id}/system"
            response = self.session.get(url, timeout=10)

            if response.status_code == 200:
                return response.json()
            else:
                print(f"Warning: Could not fetch system info (status {response.status_code})", file=sys.stderr)
                return None
        except requests.RequestException as e:
            print(f"Error fetching system info: {e}", file=sys.stderr)
            return None

    def get_recent_calls(self,
                        talkgroup_ids: Optional[List[int]] = None,
                        group_id: Optional[str] = None,
                        since_time: Optional[float] = None) -> List[Dict]:
        """
        Fetch recent calls from the system

        Args:
            talkgroup_ids: List of talkgroup IDs to filter (comma-separated in API)
            group_id: Single group ID to filter
            since_time: Unix timestamp to get calls newer than (default: last 5 minutes)

        Returns:
            List of call objects with metadata and audio URLs
        """
        if since_time is None:
            # Default to last 5 minutes
            since_time = time.time() - 300

        # Convert timestamp to OpenMHz format (remove decimal point)
        time_param = str(int(since_time * 1000))

        # Build URL
        url = f"{self.BASE_URL}/{self.system_id}/calls/newer"
        params = {'time': time_param}

        # Add filter parameters
        if talkgroup_ids:
            params['filter-type'] = 'talkgroup'
            params['filter-code'] = ','.join(map(str, talkgroup_ids))
        elif group_id:
            params['filter-type'] = 'group'
            params['filter-code'] = group_id

        if self.verbose:
            print(f"DEBUG: Fetching calls from {url} with params {params}", file=sys.stderr)

        try:
            response = self.session.get(url, params=params, timeout=10)

            if self.verbose:
                print(f"DEBUG: Response status: {response.status_code}", file=sys.stderr)
                print(f"DEBUG: Response headers: {dict(response.headers)}", file=sys.stderr)

            response.raise_for_status()

            data = response.json()
            calls = data.get('calls', [])

            if self.verbose:
                print(f"DEBUG: Received {len(calls)} calls", file=sys.stderr)

            # Filter out zero-length calls
            valid_calls = [call for call in calls if call.get('len', 0) > 0]

            if self.verbose and len(calls) != len(valid_calls):
                print(f"DEBUG: Filtered out {len(calls) - len(valid_calls)} zero-length calls", file=sys.stderr)

            return valid_calls
        except requests.RequestException as e:
            print(f"Error fetching calls: {e}", file=sys.stderr)
            if self.verbose:
                import traceback
                traceback.print_exc()
            return []

    def get_talkgroups(self) -> List[Dict]:
        """
        Fetch list of talkgroups for the system

        Returns:
            List of talkgroup objects with IDs, names, and metadata
        """
        try:
            url = f"{self.BASE_URL}/{self.system_id}/talkgroups"
            response = self.session.get(url, timeout=10)

            if response.status_code == 200:
                data = response.json()

                # Handle different response formats
                if isinstance(data, list):
                    # Filter out any non-dict items (strings, etc.)
                    return [item for item in data if isinstance(item, dict)]
                elif isinstance(data, dict):
                    # Some APIs might return {talkgroups: [...]}
                    if 'talkgroups' in data:
                        return [item for item in data['talkgroups'] if isinstance(item, dict)]
                    # Or the dict itself might be the talkgroup info
                    return [data]
                else:
                    print(f"Warning: Unexpected talkgroups format: {type(data)}", file=sys.stderr)
                    return []
            else:
                print(f"Warning: Could not fetch talkgroups (status {response.status_code})", file=sys.stderr)
                return []
        except requests.RequestException as e:
            print(f"Error fetching talkgroups: {e}", file=sys.stderr)
            return []
        except Exception as e:
            print(f"Error parsing talkgroups: {e}", file=sys.stderr)
            return []


class StreamProfileGenerator:
    """Generates stream profiles from OpenMHz data"""

    @staticmethod
    def generate_stream_profile(call: Dict, system_id: str, talkgroup_info: Optional[Dict] = None) -> Dict:
        """
        Generate a stream profile from a call object

        Args:
            call: Call object from OpenMHz API
            system_id: System short name/ID
            talkgroup_info: Optional talkgroup metadata for enhanced descriptions

        Returns:
            Dictionary containing stream profile data
        """
        talkgroup_num = call.get('talkgroupNum', 'unknown')

        # Build descriptive name
        if talkgroup_info and 'description' in talkgroup_info:
            name = talkgroup_info['description']
        elif talkgroup_info and 'alpha' in talkgroup_info:
            name = talkgroup_info['alpha']
        else:
            name = f"Talkgroup {talkgroup_num}"

        # Parse timestamp
        time_str = call.get('time', '')
        try:
            timestamp = datetime.strptime(time_str.split('.')[0], '%Y-%m-%dT%H:%M:%S')
            formatted_time = timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')
        except:
            formatted_time = time_str

        # Build description
        duration = call.get('len', 0)
        src_list = call.get('srcList', [])
        num_radios = len(src_list)

        description_parts = [
            f"System: {system_id}",
            f"Duration: {duration}s",
            f"Radios: {num_radios}",
            f"Time: {formatted_time}"
        ]

        if talkgroup_info and 'tag' in talkgroup_info:
            description_parts.insert(1, f"Category: {talkgroup_info['tag']}")

        description = " | ".join(description_parts)

        # Generate unique stream ID
        stream_id = f"{system_id}-{talkgroup_num}-{call.get('_id', '')}"

        return {
            'stream_id': stream_id,
            'name': name,
            'description': description,
            'audio_url': call.get('url', ''),
            'system_name': system_id,
            'talkgroup_id': talkgroup_num,
            'timestamp': time_str,
            'duration': duration,
            'filename': call.get('filename', ''),
            'src_list': src_list,
            'metadata': {
                'star_count': call.get('star', 0),
                'call_id': call.get('_id', ''),
                'talkgroup_info': talkgroup_info
            }
        }

    @staticmethod
    def generate_system_profile(system_id: str,
                                talkgroups: List[Dict],
                                recent_calls: List[Dict]) -> Dict:
        """
        Generate a complete system profile with all available streams

        Args:
            system_id: System short name/ID
            talkgroups: List of talkgroup metadata
            recent_calls: List of recent call objects

        Returns:
            Dictionary containing system profile and available streams
        """
        # Create talkgroup lookup - handle different possible field names
        tg_lookup = {}
        for tg in talkgroups:
            if not isinstance(tg, dict):
                continue

            # Try different possible ID fields
            tg_id = tg.get('num') or tg.get('decimal') or tg.get('id') or tg.get('talkgroupNum')
            if tg_id is not None:
                tg_lookup[tg_id] = tg

        # Generate stream profiles for each call
        streams = []
        for call in recent_calls:
            talkgroup_num = call.get('talkgroupNum')
            tg_info = tg_lookup.get(talkgroup_num)

            stream = StreamProfileGenerator.generate_stream_profile(
                call, system_id, tg_info
            )
            streams.append(stream)

        # Sort by timestamp (newest first)
        streams.sort(key=lambda x: x['timestamp'], reverse=True)

        return {
            'system_id': system_id,
            'total_streams': len(streams),
            'total_talkgroups': len(talkgroups),
            'talkgroups': talkgroups,
            'streams': streams,
            'generated_at': datetime.utcnow().isoformat() + 'Z'
        }


def ingest_system(system_id: str,
                 talkgroup_ids: Optional[List[int]] = None,
                 group_id: Optional[str] = None,
                 output_format: str = 'json',
                 verbose: bool = False) -> Dict:
    """
    Main ingestion function for OpenMHz systems

    Args:
        system_id: The system short name/ID to ingest
        talkgroup_ids: Optional list of specific talkgroups to fetch
        group_id: Optional group ID to fetch
        output_format: Output format ('json' or 'text')
        verbose: Enable verbose debug output

    Returns:
        Dictionary containing the complete system profile
    """
    print(f"Ingesting OpenMHz system: {system_id}", file=sys.stderr)

    # Initialize client
    client = OpenMHZClient(system_id, verbose=verbose)

    # Fetch system info
    system_info = client.get_system_info()
    if system_info:
        print(f"System info retrieved: {system_info.get('name', system_id)}", file=sys.stderr)

    # Fetch talkgroups
    print("Fetching talkgroups...", file=sys.stderr)
    talkgroups = client.get_talkgroups()
    print(f"Found {len(talkgroups)} talkgroups", file=sys.stderr)

    # Fetch recent calls
    print("Fetching recent calls...", file=sys.stderr)
    recent_calls = client.get_recent_calls(
        talkgroup_ids=talkgroup_ids,
        group_id=group_id
    )
    print(f"Found {len(recent_calls)} recent calls", file=sys.stderr)

    # Generate system profile
    profile = StreamProfileGenerator.generate_system_profile(
        system_id, talkgroups, recent_calls
    )

    return profile


def main():
    """CLI entry point"""
    parser = argparse.ArgumentParser(
        description='Ingest radio streams from OpenMHz.com',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Ingest all recent calls from Rhode Island system
  python ingest_openmhz.py --system rhode-island

  # Ingest specific talkgroups
  python ingest_openmhz.py --system kcers1b --talkgroups 3344,3408,44912

  # Ingest a specific group
  python ingest_openmhz.py --system kcers1b --group fire-dispatch

  # Output as formatted text
  python ingest_openmhz.py --system rhode-island --format text
        """
    )

    parser.add_argument(
        '--system', '-s',
        required=True,
        help='System ID/short name (e.g., "rhode-island", "kcers1b")'
    )

    parser.add_argument(
        '--talkgroups', '-t',
        help='Comma-separated list of talkgroup IDs to filter'
    )

    parser.add_argument(
        '--group', '-g',
        help='Group ID to filter (alternative to --talkgroups)'
    )

    parser.add_argument(
        '--format', '-f',
        choices=['json', 'text'],
        default='json',
        help='Output format (default: json)'
    )

    parser.add_argument(
        '--output', '-o',
        help='Output file (default: stdout)'
    )

    parser.add_argument(
        '--debug', '-d',
        action='store_true',
        help='Enable verbose debug output'
    )

    args = parser.parse_args()

    # Parse talkgroup IDs if provided
    talkgroup_ids = None
    if args.talkgroups:
        try:
            talkgroup_ids = [int(tid.strip()) for tid in args.talkgroups.split(',')]
        except ValueError:
            print("Error: Talkgroup IDs must be integers", file=sys.stderr)
            sys.exit(1)

    # Validate arguments
    if args.talkgroups and args.group:
        print("Error: Cannot specify both --talkgroups and --group", file=sys.stderr)
        sys.exit(1)

    # Perform ingestion
    try:
        profile = ingest_system(
            args.system,
            talkgroup_ids=talkgroup_ids,
            group_id=args.group,
            output_format=args.format,
            verbose=args.debug
        )

        # Format output
        if args.format == 'json':
            output = json.dumps(profile, indent=2)
        else:  # text format
            lines = [
                f"System: {profile['system_id']}",
                f"Total Talkgroups: {profile['total_talkgroups']}",
                f"Total Streams: {profile['total_streams']}",
                f"Generated: {profile['generated_at']}",
                "",
                "Available Streams:",
                "=" * 80
            ]

            for stream in profile['streams']:
                lines.extend([
                    f"\nStream ID: {stream['stream_id']}",
                    f"Name: {stream['name']}",
                    f"Description: {stream['description']}",
                    f"Audio URL: {stream['audio_url']}",
                    "-" * 80
                ])

            output = "\n".join(lines)

        # Write output
        if args.output:
            with open(args.output, 'w') as f:
                f.write(output)
            print(f"Output written to {args.output}", file=sys.stderr)
        else:
            print(output)

        print(f"\nIngestion complete: {profile['total_streams']} streams available", file=sys.stderr)

    except KeyboardInterrupt:
        print("\nIngestion cancelled by user", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error during ingestion: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
