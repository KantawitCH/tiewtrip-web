#!/bin/bash

# Source the shared utility script
TOOL_DIR="$(git rev-parse --show-toplevel)/tools"
source "$TOOL_DIR/scripts/utils.sh"

# Clean up old version update script
rm "$TOOL_DIR/update.sh"

echo ""
echo "⌛️ Setup Codevilian tools..."
bash "$TOOL_DIR"/setup

echo ""
echo "✅ Update successfully"

exit 0
