#!/bin/bash

# Source the shared utility script
TOOL_DIR="$(git rev-parse --show-toplevel)/tools"
source "$TOOL_DIR/scripts/utils.sh"

git_commit_handler() {
  echo "ℹ️ Please select commit type:"
  select_from_list "${COMMIT_MSG_TYPES[@]}" selected_type

  echo ""
  if ask_yes_no "ℹ️ Do you have any scope?"; then
    echo ""
    read -rp "ℹ️ Enter your scope (e.g., setup, auth, user ): " scope
  fi

  echo ""
  read -rp "ℹ️ Enter your commit message: " commit_msg

  echo ""
  final_commit="${selected_type}"
  if [[ -n "$scope" ]]; then
    final_commit+="($scope)"
  fi
  final_commit+=": ${commit_msg}"

  echo "💡 Your final commit message:"
  echo -e "\n\t${final_commit}\n"
  if ask_yes_no "ℹ️ Confirm commit?"; then
    git commit -m "${final_commit}"
  else
    exit 0
  fi
}
