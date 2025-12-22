"""Initialize database with default user."""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from ninebox.core.database import (
    create_user,
    init_db,
)

if __name__ == "__main__":
    # Initialize database
    init_db()

    # Create default user
    username = "bencan"
    password = "password"  # Change this in production!

    try:
        user_id = create_user(username, password)
        print(f"Created user '{username}' with ID: {user_id}")
        print(f"Password: {password}")
        print("\nYou can now login with these credentials.")
    except ValueError as e:
        print(f"User creation failed: {e}")
        print(f"User '{username}' may already exist.")
