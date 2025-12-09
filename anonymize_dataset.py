#!/usr/bin/env python3
"""
Anonymize the talent mapping Excel file by replacing names and locations consistently.
"""

import pandas as pd
import re
from pathlib import Path

# Fake names pool (first and last names)
FIRST_NAMES = [
    "Alice", "Bob", "Charlie", "Diana", "Edward", "Fiona", "George", "Hannah",
    "Isaac", "Julia", "Kevin", "Laura", "Michael", "Natalie", "Oliver", "Patricia",
    "Quinn", "Rachel", "Samuel", "Teresa", "Ulysses", "Victoria", "William", "Xavier",
    "Yolanda", "Zachary", "Amanda", "Brian", "Catherine", "David", "Emma", "Frank",
    "Grace", "Henry", "Isabel", "James", "Karen", "Leonard", "Monica", "Nathan",
    "Olivia", "Peter", "Quentin", "Rebecca", "Steven", "Tina", "Uma", "Vincent",
    "Wendy", "Xander", "Yvonne", "Zane", "Anthony", "Bella", "Carlos", "Danielle",
    "Eric", "Felicia", "Gary", "Heather", "Ivan", "Jessica", "Keith", "Lindsay",
    "Marcus", "Nicole", "Oscar", "Pamela", "Raymond", "Sophia", "Thomas", "Ursula",
    "Victor", "Whitney", "York", "Zelda", "Aaron", "Brenda", "Colin", "Donna",
    "Ethan", "Frances", "Gilbert", "Helen", "Ian", "Jane", "Kyle", "Lisa",
    "Martin", "Nancy", "Owen", "Paula", "Richard", "Sarah", "Timothy", "Valerie"
]

LAST_NAMES = [
    "Anderson", "Baker", "Carter", "Davis", "Evans", "Foster", "Garcia", "Harris",
    "Jackson", "King", "Lee", "Martinez", "Nelson", "O'Brien", "Parker", "Quinn",
    "Roberts", "Smith", "Taylor", "Underwood", "Valdez", "Wilson", "Young", "Zhang",
    "Adams", "Brown", "Clark", "Douglas", "Edwards", "Fisher", "Green", "Hall",
    "Irving", "Johnson", "Kelly", "Lewis", "Moore", "Newman", "Ortiz", "Peterson",
    "Ramirez", "Scott", "Thompson", "Upton", "Vargas", "White", "Xu", "Yang",
    "Allen", "Bell", "Cooper", "Dixon", "Ellis", "Flynn", "Gray", "Hughes",
    "Ives", "Jones", "Knight", "Lopez", "Miller", "Nguyen", "Oliver", "Powell",
    "Reed", "Sullivan", "Turner", "Vaughn", "Walker", "Xavier", "Zimmerman",
    "Armstrong", "Bennett", "Collins", "Dean", "Ferguson", "Graham", "Henderson",
    "Ingram", "Jenkins", "Kennedy", "Long", "Morgan", "Nash", "Owens", "Patterson",
    "Reynolds", "Stone", "Torres", "Vincent", "Ward", "Yates", "Abbott", "Black"
]

# Location mappings (country codes in job titles/profiles)
LOCATION_MAP = {
    "USA": "CAN",  # United States -> Canada
    "IND": "BRA",  # India -> Brazil
    "CZE": "POL",  # Czech Republic -> Poland
    "AUS": "NZL",  # Australia -> New Zealand
    "GBR": "IRL",  # Great Britain -> Ireland
    "DEU": "SWE",  # Germany -> Sweden
    "FRA": "ESP",  # France -> Spain
    "JPN": "KOR",  # Japan -> Korea
    "CHN": "SGP",  # China -> Singapore
}


def generate_fake_name(index: int) -> str:
    """Generate a consistent fake name based on index."""
    first_idx = index % len(FIRST_NAMES)
    last_idx = (index // len(FIRST_NAMES)) % len(LAST_NAMES)
    return f"{FIRST_NAMES[first_idx]} {LAST_NAMES[last_idx]}"


def create_name_mapping(names: set) -> dict:
    """Create a consistent mapping from real names to fake names."""
    # Sort names for consistency
    sorted_names = sorted([n for n in names if pd.notna(n) and n != ""])

    mapping = {}
    for idx, name in enumerate(sorted_names):
        mapping[name] = generate_fake_name(idx)

    return mapping


def replace_locations_in_text(text: str, location_map: dict) -> str:
    """Replace location codes in text (like job titles)."""
    if pd.isna(text) or text == "":
        return text

    result = str(text)
    for old_loc, new_loc in location_map.items():
        result = result.replace(f"-{old_loc}", f"-{new_loc}")

    return result


def anonymize_dataframe(df: pd.DataFrame, name_mapping: dict, location_map: dict) -> pd.DataFrame:
    """Anonymize a dataframe by replacing names and locations."""
    df_anon = df.copy()

    # Replace name columns
    name_columns = [
        "Worker",
        "Worker's Manager",
        "Management Chain - Level 04",
        "Management Chain - Level 05",
        "Management Chain - Level 06"
    ]

    for col in name_columns:
        if col in df_anon.columns:
            df_anon[col] = df_anon[col].map(lambda x: name_mapping.get(x, x) if pd.notna(x) else x)

    # Replace locations in text columns
    location_columns = [
        "Job Title",
        "Job Profile",
        "Business Title"
    ]

    for col in location_columns:
        if col in df_anon.columns:
            df_anon[col] = df_anon[col].map(lambda x: replace_locations_in_text(x, location_map))

    return df_anon


def main():
    """Main function to anonymize the Excel file."""
    input_file = "PUX_ Talent Mapping  IC Review_CONFIDENTIAL.3.xlsx"
    output_file = "Talent_Mapping_ANONYMIZED_Example.xlsx"

    print(f"Reading {input_file}...")

    # Read all sheets
    xl_file = pd.ExcelFile(input_file)
    print(f"Found sheets: {xl_file.sheet_names}")

    # Read the main data sheet
    df_main = pd.read_excel(input_file, sheet_name="PUX ICs")
    print(f"Main sheet has {len(df_main)} rows and {len(df_main.columns)} columns")

    # Collect all unique names from all name columns
    all_names = set()
    name_columns = [
        "Worker",
        "Worker's Manager",
        "Management Chain - Level 04",
        "Management Chain - Level 05",
        "Management Chain - Level 06"
    ]

    for col in name_columns:
        if col in df_main.columns:
            names = df_main[col].dropna().unique()
            all_names.update(names)

    print(f"Found {len(all_names)} unique names")

    # Create name mapping
    name_mapping = create_name_mapping(all_names)
    print(f"Created mapping for {len(name_mapping)} names")

    # Show a few examples
    print("\nExample name mappings:")
    for i, (real, fake) in enumerate(list(name_mapping.items())[:5]):
        print(f"  {real} -> {fake}")

    print("\nLocation mappings:")
    for old_loc, new_loc in LOCATION_MAP.items():
        print(f"  {old_loc} -> {new_loc}")

    # Anonymize all sheets
    with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
        for sheet_name in xl_file.sheet_names:
            print(f"\nProcessing sheet: {sheet_name}")
            df = pd.read_excel(input_file, sheet_name=sheet_name)

            # Only anonymize sheets with data (skip instruction sheets)
            if sheet_name in ["PUX ICs", "Excel Table (Do Not Format)"]:
                df_anon = anonymize_dataframe(df, name_mapping, LOCATION_MAP)
                print(f"  Anonymized {len(df_anon)} rows")
            else:
                df_anon = df
                print(f"  Kept {len(df_anon)} rows as-is (instruction sheet)")

            df_anon.to_excel(writer, sheet_name=sheet_name, index=False)

    print(f"\n✓ Anonymized data saved to: {output_file}")
    print(f"  Total names replaced: {len(name_mapping)}")
    print(f"  Total locations replaced: {len(LOCATION_MAP)}")


if __name__ == "__main__":
    main()
