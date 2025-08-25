#!/usr/bin/env python3
"""
Script to fix encoding issues in KML files.
Handles HTML entities, double-encoded entities, and UTF-8 issues.
"""

import re
import html
import sys
from pathlib import Path

def fix_kml_encoding(input_file, output_file=None):
    """
    Fix encoding issues in a KML file.
    
    Args:
        input_file (str): Path to input KML file
        output_file (str): Path to output file (optional, defaults to input_file)
    """
    if output_file is None:
        output_file = input_file
    
    print(f"Reading file: {input_file}")
    
    # Read the file
    with open(input_file, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    original_size = len(content)
    print(f"Original file size: {original_size:,} characters")
    
    # Step 1: Fix double-encoded HTML entities (e.g., &amp;#281; -> &#281;)
    print("Fixing double-encoded HTML entities...")
    content = re.sub(r'&amp;#(\d+);', r'&#\1;', content)
    
    # Step 2: Decode HTML entities (e.g., &#281; -> ę, &lt; -> <)
    print("Decoding HTML entities...")
    content = html.unescape(content)
    
    # Step 3: Fix common UTF-8 encoding issues based on actual context found
    print("Fixing UTF-8 encoding issues...")
    # Norwegian/Danish character fixes based on actual words found:
    utf8_fixes = {
        'Ã¸': 'ø',  # ø (e.g., "nÃ¸ye" -> "nøye" meaning "carefully")
        'Ã¥': 'å',  # å (e.g., "Ã¥ bli" -> "å bli" meaning "to become")
        'Ã¦': 'æ',  # æ (e.g., "populÃ¦rt" -> "populært" meaning "popular")
        'Ã': 'Ø',  # Ø (capital Ø)
        'Ã': 'Å',  # Å (capital Å)
        'Ã': 'Æ',  # Æ (capital Æ)
        # Swedish/German character fixes:
        'Ã¶': 'ö',  # ö (e.g., "KÃ¶r" -> "Kör" meaning "drive")
        'Ã¤': 'ä',  # ä (e.g., "RÃ¤tt" -> "Rätt" meaning "right")
        'Ã¼': 'ü',  # ü (German ü)
        'Ã¯': 'ï',  # ï (i with diaeresis)
        # Additional characters that might appear
        'Ã©': 'é',  # é
        'Ã¨': 'è',  # è
        'Ã¡': 'á',  # á
        'Ã ': 'à',  # à (note: space after Ã)
        'Ã³': 'ó',  # ó
        'Ã²': 'ò',  # ò
        'Ãº': 'ú',  # ú
        'Ã¹': 'ù',  # ù
        'Ã±': 'ñ',  # ñ
        'Ã§': 'ç',  # ç
    }
    
    for wrong, correct in utf8_fixes.items():
        content = content.replace(wrong, correct)
    
    # Step 4: Clean up any remaining broken entities
    print("Cleaning up remaining broken entities...")
    # Remove any remaining broken HTML entities that couldn't be decoded
    content = re.sub(r'&[a-zA-Z0-9#]+;', '', content)
    
    final_size = len(content)
    print(f"Final file size: {final_size:,} characters")
    print(f"Size change: {final_size - original_size:,} characters")
    
    # Write the fixed content
    print(f"Writing fixed file to: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Done! File encoding has been fixed.")
    return True

def main():
    if len(sys.argv) < 2:
        print("Usage: python fix_kml_encoding.py <input_file> [output_file]")
        print("Example: python fix_kml_encoding.py public/country_160.kml")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    if not Path(input_file).exists():
        print(f"Error: Input file '{input_file}' does not exist.")
        sys.exit(1)
    
    try:
        fix_kml_encoding(input_file, output_file)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
