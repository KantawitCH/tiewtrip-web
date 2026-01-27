#!/bin/bash

TOOL_DIR=$1
TMP_DIR=$2

# Enable dotglob to include hidden files
shopt -s dotglob

# Delete everything except the temp folder
for item in "$TOOL_DIR"/*; do
  [[ "$item" == "$TMP_DIR" || "$item" == "$0" ]] && continue
  rm -rf "$item"
done

cp -r "$TMP_DIR"/tools/* "$TOOL_DIR"

rm -rf "$TMP_DIR"

chmod +x "$TOOL_DIR"/scripts/cleanup-update.sh

exec "$TOOL_DIR"/scripts/cleanup-update.sh
