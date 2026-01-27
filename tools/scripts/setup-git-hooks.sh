#!/bin/bash

# Source the shared utility script
TOOL_DIR="$(git rev-parse --show-toplevel)/tools"
source "$TOOL_DIR/scripts/utils.sh"

# Define constants and variables
HOOKS_DIR="$(git rev-parse --git-dir)/hooks"

HOOK_FILE="commit-msg"
HOOK_SOURCE="$TOOL_DIR/git/hooks/$HOOK_FILE"
HOOK_DESTINATION="$HOOKS_DIR/$HOOK_FILE"

log.Whisper "Setting up Git hooks..."

# Check if .git/hooks exists
if [ ! -d "$HOOKS_DIR" ]; then
  log.Whisper "Error: $HOOKS_DIR directory not found! Are you in the root of a Git repository?"
  exit 1
fi

# Check if the commit-msg hook file exists
if [ ! -f "$HOOK_SOURCE" ]; then
  log.Whisper "Error: $HOOK_FILE hook file not found in $HOOK_SOURCE!"
  exit 1
fi

# Copy the commit-msg hook to the .git/hooks directory
log.Whisper "Copying $HOOK_FILE hook to $HOOKS_DIR directory..."
cp "$HOOK_SOURCE" "$HOOK_DESTINATION"

# Make the hook executable
log.Whisper "Making the $HOOK_FILE hook executable..."
chmod +x "$HOOK_DESTINATION"

log.Whisper "Git hook setup complete."
