#!/bin/bash

# Script to generate SQL UPDATE statements for wind directions
# Reads wind_directions.txt and generates SQL to update paragliding_locations table

# Check if input file exists
if [ ! -f "wind_directions_new_y_24_23.txt" ]; then
    echo "Error: wind_directions_new_y_24_23.txt not found in current directory"
    exit 1
fi

# Convert Windows line endings to Unix if needed
if command -v dos2unix >/dev/null 2>&1; then
    dos2unix wind_directions_new_y_24_23.txt
fi

# Output file for SQL statements
OUTPUT_FILE="update_wind_directions_new.sql"

# Clear output file and add header
cat > "$OUTPUT_FILE" << 'EOF'
-- SQL UPDATE statements for wind directions
-- Generated from wind_directions_new_y_24_23.txt
-- Each statement sets the appropriate wind direction flags to true for each flightlog_id

EOF

# Process each line from the input file
while IFS= read -r line; do
    # Skip empty lines and header lines
    if [[ -z "$line" ]] || [[ "$line" =~ ^=+$ ]] || [[ "$line" =~ ^Extracting ]]; then
        continue
    fi
    
    # Parse the line: flightlog_id: wind_directions
    if [[ "$line" =~ ^([0-9]+):[[:space:]]*(.*)$ ]]; then
        flightlog_id="${BASH_REMATCH[1]}"
        wind_directions="${BASH_REMATCH[2]}"
        
        # Skip lines with "No wind directions found"
        if [[ "$wind_directions" == "No wind directions found" ]]; then
            continue
        fi
        
        # Initialize all wind direction flags to false
        n="false"
        ne="false"
        e="false"
        se="false"
        s="false"
        sw="false"
        w="false"
        nw="false"
        
        # Set flags to true based on wind directions
        # Use word boundaries to avoid partial matches (e.g., "SE" shouldn't match "E")
        if [[ "$wind_directions" =~ (^|[[:space:]])N($|[[:space:]]) ]]; then
            n="true"
        fi
        if [[ "$wind_directions" =~ (^|[[:space:]])NE($|[[:space:]]) ]]; then
            ne="true"
        fi
        if [[ "$wind_directions" =~ (^|[[:space:]])E($|[[:space:]]) ]]; then
            e="true"
        fi
        if [[ "$wind_directions" =~ (^|[[:space:]])SE($|[[:space:]]) ]]; then
            se="true"
        fi
        if [[ "$wind_directions" =~ (^|[[:space:]])S($|[[:space:]]) ]]; then
            s="true"
        fi
        if [[ "$wind_directions" =~ (^|[[:space:]])SW($|[[:space:]]) ]]; then
            sw="true"
        fi
        if [[ "$wind_directions" =~ (^|[[:space:]])W($|[[:space:]]) ]]; then
            w="true"
        fi
        if [[ "$wind_directions" =~ (^|[[:space:]])NW($|[[:space:]]) ]]; then
            nw="true"
        fi
        
        # Generate SQL UPDATE statement
        cat >> "$OUTPUT_FILE" << EOF
UPDATE paragliding_locations 
SET n = $n, ne = $ne, e = $e, se = $se, s = $s, sw = $sw, w = $w, nw = $nw
WHERE flightlog_id = '$flightlog_id';

EOF
    fi
done < wind_directions_new_y_24_23.txt

echo "SQL UPDATE statements generated in $OUTPUT_FILE"
echo "Total statements generated: $(grep -c "UPDATE paragliding_locations" "$OUTPUT_FILE")"
