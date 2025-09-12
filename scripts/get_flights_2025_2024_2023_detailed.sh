#!/bin/bash

# Detailed script to check if flights exist in 2025, 2024, and 2023 for each ID
# Also shows the flight count for each year
# Usage: ./get_flights_2025_2024_2023_detailed.sh

# Input and output files
INPUT_FILE="data/to_delete.txt"
OUTPUT_FILE="flights-to-delete-from-db.txt"

# Base URL for flightlog
BASE_URL="https://flightlog.org/fl.html?l=1&country_id=160&start_id="

# Function to get detailed flight counts for a given ID
get_detailed_flight_counts() {
    local id=$1
    local url="${BASE_URL}${id}&a=93"
    
    # Add a small delay to be respectful to the server
    sleep 0.5
    
    # Fetch the page and extract flight counts for each year
    local html=$(curl -s "$url")
    
    # Extract flight counts for each year
    local flights_2025=$(echo "$html" | \
        grep -o "<td bgcolor=['\"]white['\"]>2025</td><td bgcolor=['\"]white['\"]>[0-9]*</td>" | \
        sed -E "s/<td bgcolor=['\"]white['\"]>2025<\/td><td bgcolor=['\"]white['\"]>([0-9]+)<\/td>/\1/")
    
    local flights_2024=$(echo "$html" | \
        grep -o "<td bgcolor=['\"]white['\"]>2024</td><td bgcolor=['\"]white['\"]>[0-9]*</td>" | \
        sed -E "s/<td bgcolor=['\"]white['\"]>2024<\/td><td bgcolor=['\"]white['\"]>([0-9]+)<\/td>/\1/")
    
    local flights_2023=$(echo "$html" | \
        grep -o "<td bgcolor=['\"]white['\"]>2023</td><td bgcolor=['\"]white['\"]>[0-9]*</td>" | \
        sed -E "s/<td bgcolor=['\"]white['\"]>2023<\/td><td bgcolor=['\"]white['\"]>([0-9]+)<\/td>/\1/")
    
    # Set to 0 if no data found
    if [ -z "$flights_2025" ]; then
        flights_2025=0
    fi
    if [ -z "$flights_2024" ]; then
        flights_2024=0
    fi
    if [ -z "$flights_2023" ]; then
        flights_2023=0
    fi
    
    # Check if all three years exist (have counts > 0)
    local all_years_exist="false"
    if [ "$flights_2025" -gt 0 ] && [ "$flights_2024" -gt 0 ] && [ "$flights_2023" -gt 0 ]; then
        all_years_exist="true"
    fi
    
    echo "$id: 2025:$flights_2025 2024:$flights_2024 2023:$flights_2023 $all_years_exist"
}

# Function to test a single ID (for debugging)
test_single_id() {
    local id=$1
    echo "Testing ID: $id"
    local url="${BASE_URL}${id}&a=93"
    echo "URL: $url"
    
    sleep 2
    
    # Show raw HTML around the years
    echo "Raw HTML around years 2025, 2024, 2023:"
    curl -s "$url" | grep -E "(2025|2024|2023)" -A 1 -B 1
    
    # Get detailed counts
    get_detailed_flight_counts "$id"
    echo "---"
}

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file $INPUT_FILE not found!"
    exit 1
fi

# If first argument is "test", run test mode
if [ "$1" = "test" ]; then
    echo "Running in test mode..."
    echo ""
    test_single_id 1143
    test_single_id 3700
    test_single_id 5842
    exit 0
fi

# Clear output file
> "$OUTPUT_FILE"

# Counter for progress
total_lines=$(wc -l < "$INPUT_FILE")
current=0

echo "Processing $total_lines IDs from $INPUT_FILE"
echo "Output will be written to $OUTPUT_FILE"
echo "Format: [id]: 2025:X 2024:Y 2023:Z [true/false]"
echo ""

# Process each ID
while IFS= read -r id; do

    current=$((current + 1))

    echo "Processing ID $id ($current/$total_lines)..."
    
    # Get detailed flight counts and append to output file
    get_detailed_flight_counts "$id" >> "$OUTPUT_FILE"
    
    # Show progress every 10 IDs
    if [ $((current % 10)) -eq 0 ]; then
        echo "Processed $current/$total_lines IDs..."
    fi
    
done < "$INPUT_FILE"

echo ""
echo "Processing complete!"
echo "Results written to $OUTPUT_FILE"
echo "Total IDs processed: $current"
