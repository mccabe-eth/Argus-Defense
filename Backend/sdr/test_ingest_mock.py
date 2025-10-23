#!/usr/bin/env python3
"""
Mock test for OpenMHz ingestion - demonstrates functionality without API access
"""

import json
from datetime import datetime, timedelta

# Mock data that simulates OpenMHz API responses
MOCK_TALKGROUPS = [
    {
        "num": 3344,
        "decimal": 3344,
        "alpha": "FIRE_DISP",
        "description": "Fire Dispatch",
        "tag": "Fire Dispatch",
        "category": "Emergency Services"
    },
    {
        "num": 3408,
        "decimal": 3408,
        "alpha": "POLICE_1",
        "description": "Police Dispatch 1",
        "tag": "Law Dispatch",
        "category": "Law Enforcement"
    },
    {
        "num": 44912,
        "decimal": 44912,
        "alpha": "EMS_OPS",
        "description": "EMS Operations",
        "tag": "EMS Dispatch",
        "category": "EMS"
    }
]

MOCK_CALLS = [
    {
        "_id": "abc123def456",
        "talkgroupNum": 3344,
        "url": "https://cdn.openmhz.com/example/2025/10/23/3344-1729713045-abc123.m4a",
        "filename": "2025/10/23/3344-1729713045-abc123.m4a",
        "time": (datetime.utcnow() - timedelta(minutes=5)).strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        "srcList": [
            {"src": 123001, "pos": 0.0},
            {"src": 123002, "pos": 5.2},
            {"src": 123003, "pos": 10.5}
        ],
        "star": 2,
        "len": 15
    },
    {
        "_id": "def456ghi789",
        "talkgroupNum": 3408,
        "url": "https://cdn.openmhz.com/example/2025/10/23/3408-1729712910-def456.m4a",
        "filename": "2025/10/23/3408-1729712910-def456.m4a",
        "time": (datetime.utcnow() - timedelta(minutes=8)).strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        "srcList": [
            {"src": 124001, "pos": 0.0},
            {"src": 124002, "pos": 12.3}
        ],
        "star": 0,
        "len": 22
    },
    {
        "_id": "ghi789jkl012",
        "talkgroupNum": 44912,
        "url": "https://cdn.openmhz.com/example/2025/10/23/44912-1729712715-ghi789.m4a",
        "filename": "2025/10/23/44912-1729712715-ghi789.m4a",
        "time": (datetime.utcnow() - timedelta(minutes=12)).strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        "srcList": [
            {"src": 125001, "pos": 0.0}
        ],
        "star": 1,
        "len": 8
    }
]


def test_mock_ingestion():
    """Test the ingestion with mock data"""
    print("=" * 80)
    print("OpenMHz Ingestion Mock Test")
    print("=" * 80)
    print()

    # Import from the actual script
    import sys
    sys.path.insert(0, '.')
    from ingest_openmhz import StreamProfileGenerator

    system_id = "test-system"

    print(f"Testing with mock data for system: {system_id}")
    print(f"Mock talkgroups: {len(MOCK_TALKGROUPS)}")
    print(f"Mock calls: {len(MOCK_CALLS)}")
    print()

    # Generate system profile
    profile = StreamProfileGenerator.generate_system_profile(
        system_id,
        MOCK_TALKGROUPS,
        MOCK_CALLS
    )

    print("✓ Successfully generated system profile")
    print()
    print("Profile Summary:")
    print(f"  System ID: {profile['system_id']}")
    print(f"  Total Talkgroups: {profile['total_talkgroups']}")
    print(f"  Total Streams: {profile['total_streams']}")
    print(f"  Generated At: {profile['generated_at']}")
    print()

    print("Streams:")
    print("-" * 80)
    for i, stream in enumerate(profile['streams'], 1):
        print(f"\n{i}. {stream['name']}")
        print(f"   ID: {stream['stream_id']}")
        print(f"   Description: {stream['description']}")
        print(f"   Audio URL: {stream['audio_url']}")
        print(f"   Talkgroup: {stream['talkgroup_id']}")
        print(f"   Duration: {stream['duration']}s")
        print(f"   Radios: {len(stream['src_list'])}")

    print()
    print("=" * 80)
    print("✓ All tests passed!")
    print()
    print("Full JSON output:")
    print(json.dumps(profile, indent=2))


if __name__ == '__main__':
    test_mock_ingestion()
