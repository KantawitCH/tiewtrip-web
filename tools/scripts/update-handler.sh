#!/bin/bash

# Source the shared utility script
TOOL_DIR="$(git rev-parse --show-toplevel)/tools"
source "$TOOL_DIR/scripts/utils.sh"

GIT_URL="https://github.com/codevilian/codevilian-tool-template.git"

update_handler() {

  echo "⌛️ Start Updating..."

  TMP_DIR="$TOOL_DIR/.tmp_update_$$" # $$ is the script's PID
  git clone "$GIT_URL" "$TMP_DIR" || {
    echo "❌ Clone updated repository failed"
    return 1
  }

  mv "$TOOL_DIR"/scripts/update.sh "$TOOL_DIR"/update.sh

  chmod +x "$TOOL_DIR"/update.sh

  exec "$TOOL_DIR"/update.sh "$TOOL_DIR" "$TMP_DIR"
}
