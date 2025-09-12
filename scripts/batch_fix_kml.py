#!/usr/bin/env python3
"""
Batch script to fix encoding issues in all KML files in the utlandet_kml directory.
Processes all KML files and outputs them to the utlandet_kml_fixed directory.
"""

import os
import sys
from pathlib import Path
from fix_kml_encoding import fix_kml_encoding

def batch_fix_kml_files():
    """
    Process all KML files in data/utlandet_kml and output to data/utlandet_kml_fixed
    """
    # Define directories
    input_dir = Path("data/utlandet_kml")
    output_dir = Path("data/utlandet_kml_fixed")
    
    # Ensure output directory exists
    output_dir.mkdir(exist_ok=True)
    
    # Get all KML files (excluding Zone.Identifier files)
    kml_files = [f for f in input_dir.glob("*.kml") if not f.name.endswith("Zone.Identifier")]
    
    print(f"Found {len(kml_files)} KML files to process")
    print(f"Input directory: {input_dir}")
    print(f"Output directory: {output_dir}")
    print("-" * 50)
    
    processed = 0
    failed = 0
    
    for kml_file in kml_files:
        try:
            # Create output filename with _fixed suffix
            output_file = output_dir / f"{kml_file.stem}_fixed.kml"
            
            print(f"Processing: {kml_file.name} -> {output_file.name}")
            
            # Fix the encoding
            fix_kml_encoding(str(kml_file), str(output_file))
            
            processed += 1
            print(f"✓ Successfully processed {kml_file.name}")
            
        except Exception as e:
            print(f"✗ Failed to process {kml_file.name}: {e}")
            failed += 1
    
    print("-" * 50)
    print(f"Processing complete!")
    print(f"Successfully processed: {processed} files")
    print(f"Failed: {failed} files")
    
    if failed > 0:
        print("Some files failed to process. Check the error messages above.")
        return False
    else:
        print("All files processed successfully!")
        return True

if __name__ == "__main__":
    # Change to the project root directory
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    os.chdir(project_root)
    
    print(f"Working directory: {os.getcwd()}")
    print("Starting batch KML encoding fix...")
    
    success = batch_fix_kml_files()
    sys.exit(0 if success else 1)
