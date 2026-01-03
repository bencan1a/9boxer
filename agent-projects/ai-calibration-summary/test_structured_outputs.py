"""Test script to validate structured outputs with Anthropic API."""

import json
import os
from pathlib import Path

from dotenv import load_dotenv

# Load environment variables
load_dotenv(Path(".env"))

import anthropic  # noqa: E402

# Test schema - minimal version to start
CALIBRATION_ANALYSIS_SCHEMA = {
    "type": "object",
    "properties": {
        "summary": {
            "type": "string",
            "description": "Executive summary of calibration findings (2-4 paragraphs)",
        },
        "issues": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "type": {
                        "type": "string",
                        "enum": ["anomaly", "recommendation", "time_allocation"],
                    },
                    "category": {
                        "type": "string",
                        "enum": [
                            "location",
                            "function",
                            "level",
                            "tenure",
                            "overall",
                            "distribution",
                        ],
                    },
                    "priority": {"type": "string", "enum": ["high", "medium", "low"]},
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "affected_count": {"type": "integer"},
                    "source_data": {
                        "type": "object",
                        "properties": {
                            "z_score": {"type": "number"},
                            "percentage": {"type": "number"},
                            "expected": {"type": "number"},
                            "actual": {"type": "number"},
                            "count": {"type": "integer"},
                            "segment": {"type": "string"},
                        },
                        "additionalProperties": False,
                        "required": [],  # All fields optional since different insights have different data
                    },
                    "cluster_id": {"type": ["string", "null"]},
                    "cluster_title": {"type": ["string", "null"]},
                },
                "required": [
                    "type",
                    "category",
                    "priority",
                    "title",
                    "description",
                    "affected_count",
                ],
                "additionalProperties": False,
            },
        },
    },
    "required": ["summary", "issues"],
    "additionalProperties": False,
}

# Minimal test data
test_data = {
    "overview": {"total_employees": 10, "high_performers": 5, "low_performers": 2},
    "analyses": {"location": {"status": "red", "message": "NYC has 80% high performers"}},
}

print("Testing Anthropic Structured Outputs...")
print(f"API Key present: {bool(os.getenv('ANTHROPIC_API_KEY'))}")

try:
    client = anthropic.Anthropic()
    print("[OK] Client initialized")

    print("\nSending test request with structured outputs...")
    response = client.beta.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=1024,
        temperature=0.3,
        system="You are an HR consultant analyzing calibration data.",
        betas=["structured-outputs-2025-11-13"],
        messages=[
            {
                "role": "user",
                "content": f"""Analyze this calibration data and return findings in JSON format.

DATA: {json.dumps(test_data, indent=2)}

Return a summary and 1-2 issues.""",
            }
        ],
        output_format={
            "type": "json_schema",
            "schema": CALIBRATION_ANALYSIS_SCHEMA,
        },
    )

    print(f"[OK] Response received: {response.stop_reason}")
    print(f"  Tokens: {response.usage.input_tokens} in, {response.usage.output_tokens} out")

    # Extract and parse JSON
    content = response.content[0].text
    print(f"\nRaw response:\n{content[:500]}...")

    result = json.loads(content)
    print("\n[OK] Valid JSON parsed!")
    print(f"  Summary length: {len(result['summary'])} chars")
    print(f"  Issues count: {len(result['issues'])}")
    print("\nFirst issue:")
    print(json.dumps(result["issues"][0], indent=2))

    print("\n[SUCCESS] Schema works correctly!")

except Exception as e:
    print(f"\n[ERROR] {e}")
    import traceback

    traceback.print_exc()
