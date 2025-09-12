#!/bin/bash

# Script to clean up failed Gemini workflows
# This script will delete all failed workflows with "Gemini" in the name

echo "🧹 Starting cleanup of failed Gemini workflows..."
echo "Repository: Frankwds/WindAlert"
echo "================================================"

# Get all failed workflows with Gemini in the name
echo "📋 Fetching failed workflow runs..."
WORKFLOWS=$(gh run list --status completed --limit 2000 --json databaseId,name,conclusion | \
    jq -r '.[] | select(.conclusion == "failure" and (.name | contains("Gemini"))) | .databaseId')

# Count total workflows
TOTAL=$(echo "$WORKFLOWS" | wc -l)
echo "📊 Found $TOTAL failed Gemini workflows to delete"

if [ "$TOTAL" -eq 0 ]; then
    echo "✅ No failed Gemini workflows found. Nothing to clean up."
    exit 0
fi

# Confirm deletion
echo ""
echo "⚠️  WARNING: This will permanently delete $TOTAL workflow runs!"
echo "This action cannot be undone."
echo ""
read -p "Do you want to proceed? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled by user."
    exit 1
fi

# Delete workflows one by one
echo ""
echo "🗑️  Starting deletion process..."
echo "Processing workflows one by one..."

DELETED=0
FAILED=0
CURRENT=0

# Convert to array for processing
WORKFLOW_ARRAY=($WORKFLOWS)

# Process each workflow
for WORKFLOW_ID in "${WORKFLOW_ARRAY[@]}"; do
    if [ -z "$WORKFLOW_ID" ]; then
        continue
    fi
    
    ((CURRENT++))
    echo "🔄 Processing workflow $CURRENT/$TOTAL (ID: $WORKFLOW_ID)"
    
    # Try to delete the workflow
    if echo "y" | gh run delete "$WORKFLOW_ID" 2>/dev/null; then
        ((DELETED++))
        echo "  ✅ Deleted workflow $WORKFLOW_ID"
    else
        ((FAILED++))
        echo "  ❌ Failed to delete workflow $WORKFLOW_ID"
    fi
    
    # Progress update every 10 workflows
    if [ $((CURRENT % 10)) -eq 0 ]; then
        PERCENTAGE=$((CURRENT * 100 / TOTAL))
        echo "📈 Progress: $CURRENT/$TOTAL ($PERCENTAGE%) - Deleted: $DELETED, Failed: $FAILED"
    fi
    
    # Small delay to avoid rate limiting
    sleep 0.5
done

echo "================================================"
echo "🎉 Cleanup completed!"
echo "📊 Final results:"
echo "   ✅ Successfully deleted: $DELETED workflows"
echo "   ❌ Failed to delete: $FAILED workflows"
echo "   📋 Total processed: $TOTAL workflows"

if [ $FAILED -gt 0 ]; then
    echo ""
    echo "⚠️  Some workflows failed to delete. This might be due to:"
    echo "   - Workflows being too recent (GitHub has a retention period)"
    echo "   - API rate limiting"
    echo "   - Network issues"
    echo ""
    echo "You can run this script again to retry failed deletions."
fi

echo ""
echo "✨ Repository cleanup complete!"
