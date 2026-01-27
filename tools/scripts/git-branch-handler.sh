#!/bin/bash

# Source the shared utility script
TOOL_DIR="$(git rev-parse --show-toplevel)/tools"
source "$TOOL_DIR/scripts/utils.sh"

KEBAB_CASE_PATTERN="^[a-z0-9]+(-[a-z0-9]+)*$"

git_branch_handler() {
  echo "ℹ️ Please select branch prefix:"
  select_from_list "${BRANCH_PREFIXES[@]}" selected_prefix

  if [[ "$selected_prefix" == "custom" ]]; then
    while true; do
      echo ""
      read -rp "ℹ️ Enter your custom branch prefix: " selected_prefix
      if [[ "$selected_prefix" =~ $KEBAB_CASE_PATTERN ]]; then
        break
      else
        echo "❌ Invalid text format, please enter branch prefix in kebab-case style"
      fi
    done
  fi

  while true; do
    echo ""
    read -rp "ℹ️ Enter your branch name (in kebab-case): " branch_name
    if [[ "$branch_name" =~ $KEBAB_CASE_PATTERN ]]; then
      break
    else
      echo "❌ Invalid text format, please enter branch name in kebab-case style"
    fi
  done

  final_branch_name="${selected_prefix}/${branch_name}"

  echo ""
  echo "💡 Your final branch name:"
  echo -e "\n\t${final_branch_name}\n"
  if ask_yes_no "ℹ️ Confirm branch creation?"; then
    git switch -c "${final_branch_name}"
  else
    exit 0
  fi
}
