#!/bin/bash

# Script to extract wind directions from flightlog.org
# Usage: ./extract_wind_directions.sh

# Configuration
INPUT_FILE="data/ids_to_keep_flights_at_least_23_24.txt"
OUTPUT_FILE="scripts/wind_directions_new_y_24_23.txt"
BASE_URL="https://www.flightlog.org/fl.html?l=2&country_id=160&a=22&start_id="
USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"

# Function to extract wind directions from HTML content
extract_wind_directions() {
    local html_content="$1"
    local start_id="$2"
    
    # Extract wind directions from img alt text
    # Look for the specific pattern: img with rqtid=17 and wind directions in alt
    # Handle both single and double quotes
    local wind_dirs=$(echo "$html_content" | grep -o "alt=['\"][^'\"]*['\"]" | grep -E "alt=['\"][A-Z ]*[NESW][A-Z ]*['\"]" | sed "s/alt=['\"]//g" | sed "s/['\"]//g" | head -1)
    
    # Clean up the wind directions (remove leading/trailing spaces)
    if [ -n "$wind_dirs" ]; then
        wind_dirs=$(echo "$wind_dirs" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        echo "${start_id}: ${wind_dirs}"
    else
        echo "${start_id}: No wind directions found"
    fi
}

# Function to make respectful HTTP request
make_request() {
    local start_id="$1"
    local url="${BASE_URL}${start_id}"
    
    # Add delay to be respectful to the server
    sleep 0.3
    
    # Make the request with proper headers
    curl -s -L \
        -H "User-Agent: ${USER_AGENT}" \
        -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8" \
        -H "Accept-Language: en-US,en;q=0.5" \
        -H "Accept-Encoding: gzip, deflate" \
        -H "Connection: keep-alive" \
        -H "Upgrade-Insecure-Requests: 1" \
        "$url"
}

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file $INPUT_FILE not found!"
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$(dirname "$OUTPUT_FILE")"

# Initialize output file
echo "Extracting wind directions..." > "$OUTPUT_FILE"
echo "================================" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Counter for progress tracking
total_lines=$(wc -l < "$INPUT_FILE")
current_line=0

echo "Starting extraction process..."
echo "Total IDs to process: $total_lines"
echo ""

# Process each start_id
while IFS= read -r start_id; do
    # Skip empty lines
    if [ -z "$start_id" ]; then
        continue
    fi
    
    current_line=$((current_line + 1))
    echo "Processing ID $start_id ($current_line/$total_lines)..."
    
    # Make the request
    html_content=$(make_request "$start_id")
    
    if [ $? -eq 0 ] && [ -n "$html_content" ]; then
        # Extract wind directions
        result=$(extract_wind_directions "$html_content" "$start_id")
        echo "$result" >> "$OUTPUT_FILE"
        echo "  -> $result"
    else
        echo "${start_id}: Failed to retrieve data" >> "$OUTPUT_FILE"
        echo "  -> Failed to retrieve data"
    fi
    
    # Add a small delay between requests to be respectful
    sleep 0.5
    
done < "$INPUT_FILE"

echo ""
echo "Extraction completed!"
echo "Results saved to: $OUTPUT_FILE"
echo ""

# Show summary
successful=$(grep -c ":" "$OUTPUT_FILE" | tail -1)
failed=$(grep -c "Failed\|No wind directions found" "$OUTPUT_FILE" | tail -1)

echo "Summary:"
echo "  Total processed: $current_line"
echo "  Successful extractions: $successful"
echo "  Failed/No data: $failed"
