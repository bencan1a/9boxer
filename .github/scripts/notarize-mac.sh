#!/bin/bash
set -e

# This script handles the notarization submission and polling for macOS applications.
# It addresses issues with hanging connections by submitting asynchronously and then polling for status.

# Check for required dependencies
if ! command -v jq &> /dev/null; then
  echo "Error: jq is required but not installed. Please install jq to parse JSON output."
  exit 1
fi

# Check for required environment variables
if [ -z "$APPLE_API_KEY" ]; then
  echo "Error: APPLE_API_KEY environment variable is not set."
  exit 1
fi

if [ -z "$APPLE_API_KEY_ID" ]; then
  echo "Error: APPLE_API_KEY_ID environment variable is not set."
  exit 1
fi

if [ -z "$APPLE_API_ISSUER" ]; then
  echo "Error: APPLE_API_ISSUER environment variable is not set."
  exit 1
fi

# Directory containing the artifacts
RELEASE_DIR="frontend/release"

# Find all DMGs and store in an array to handle filenames with spaces
# Using bash 3.2-compatible approach (macOS default bash version)
DMGS=()
while IFS= read -r -d '' file; do
  DMGS+=("$file")
done < <(find "$RELEASE_DIR" -maxdepth 1 -name "*.dmg" -print0)

if [ ${#DMGS[@]} -eq 0 ]; then
  echo "No DMG files found in $RELEASE_DIR to notarize."
  exit 0
fi

echo "Found ${#DMGS[@]} DMG(s) to notarize:"
printf '%s\n' "${DMGS[@]}"

# Function to notarize a single file
notarize_file() {
  local FILE=$1
  echo "---------------------------------------------------"
  echo "Starting validation and notarization for: $FILE"

  # 0. Pre-flight Verification
  echo "=== Pre-flight Verification ==="
  echo "Checking code signature..."
  if ! codesign -dv --verbose=4 "$FILE" 2>&1; then
    echo "Error: Code signature check failed for $FILE"
    return 1
  fi

  echo "Checking spctl assessment..."
  if ! spctl -a -t open --context context:primary-signature -v "$FILE" 2>&1; then
    echo "Warning: spctl assessment failed. This is expected before notarization but might indicate signing issues if certificates are invalid."
    echo "Continuing nonetheless..."
  else
    echo "spctl check passed locally."
  fi

  # 1. Submit the file asynchronously (--wait is omitted on purpose)
  echo "Submitting to Apple Notary Service..."
  SUBMISSION_OUTPUT=$(xcrun notarytool submit "$FILE" \
    --key "$APPLE_API_KEY" \
    --key-id "$APPLE_API_KEY_ID" \
    --issuer "$APPLE_API_ISSUER" \
    --no-wait \
    --output-format json 2>&1)

  SUBMISSION_EXIT_CODE=$?

  if [ $SUBMISSION_EXIT_CODE -ne 0 ]; then
    echo "Submission failed!"
    echo "$SUBMISSION_OUTPUT"
    return 1
  fi

  # Extract Submission ID
  SUBMISSION_ID=$(echo "$SUBMISSION_OUTPUT" | jq -r .id)

  if [ -z "$SUBMISSION_ID" ] || [ "$SUBMISSION_ID" == "null" ]; then
    echo "Failed to extract submission ID from output:"
    echo "$SUBMISSION_OUTPUT"
    return 1
  fi

  echo "Submission successful. ID: $SUBMISSION_ID"

  # 2. Poll for status
  echo "Polling for status..."
  local STATUS="In Progress"
  local ATTEMPTS=0
  local MAX_ATTEMPTS=60  # 30 minutes total (30s interval)

  while [ "$STATUS" == "In Progress" ] && [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
    sleep 30
    ATTEMPTS=$((ATTEMPTS+1))

    # Check status
    STATUS_OUTPUT=$(xcrun notarytool info "$SUBMISSION_ID" \
      --key "$APPLE_API_KEY" \
      --key-id "$APPLE_API_KEY_ID" \
      --issuer "$APPLE_API_ISSUER" \
      --output-format json 2>&1)

    STATUS=$(echo "$STATUS_OUTPUT" | jq -r .status)
    echo "Attempt $ATTEMPTS/$MAX_ATTEMPTS: Status is '$STATUS'"
  done

  if [ "$STATUS" != "Accepted" ]; then
    echo "Notarization finished with status: $STATUS (or timed out)"

    # Retrieve logs if possible
    echo "Fetching logs..."
    if ! xcrun notarytool log "$SUBMISSION_ID" \
      --key "$APPLE_API_KEY" \
      --key-id "$APPLE_API_KEY_ID" \
      --issuer "$APPLE_API_ISSUER" 2>&1; then
      echo "Warning: Failed to retrieve notarization logs"
    fi

    return 1
  fi

  echo "Notarization accepted!"

  # 3. Staple the ticket
  echo "Stapling ticket..."
  xcrun stapler staple "$FILE"

  echo "Successfully notarized and stapled: $FILE"
  return 0
}

# Main loop - iterate over array to handle filenames with spaces
FAILURE_COUNT=0
for DMG in "${DMGS[@]}"; do
  if ! notarize_file "$DMG"; then
    FAILURE_COUNT=$((FAILURE_COUNT+1))
  fi
done

if [ $FAILURE_COUNT -ne 0 ]; then
  echo "Error: $FAILURE_COUNT file(s) failed notarization."
  exit 1
fi

echo "All ${#DMGS[@]} file(s) notarized successfully."
exit 0
