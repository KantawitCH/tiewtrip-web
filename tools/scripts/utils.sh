#!/bin/bash

# Define constants and variables
ORG_NAME="Codevilian"
COMMIT_MSG_TYPES=("feat" "fix" "docs" "style" "refactor" "perf" "test" "build" "ops" "revert" "chore")
BRANCH_PREFIXES=("feature" "fix" "hotfix" "test" "custom")

# Codevilian standard log functions
log.Whisper() {
  echo "ℹ️  $ORG_NAME Whisper | $1"
}

log.Guard() {
  echo "🛡️  $ORG_NAME Guard | $1"
}

# Utility functions
join_by() {
  local separator="$1"
  shift
  local array=("$@")
  local joined_string=""

  # Iterate through the array and concatenate elements with the separator
  for element in "${array[@]}"; do
    if [[ -n "$joined_string" ]]; then
      joined_string+="$separator"
    fi
    joined_string+="$element"
  done

  echo "$joined_string"
}

# Function to create choices base on input
# Usage: select_from_list "${your_array[@]}" output_var
select_from_list() {

  if [[ $# -lt 2 ]]; then
    echo "Error: You must provide at least two arguments: a list of items and a variable to store the selected item."
    return 1
  fi

  local items=("${@:1:$(($# - 1))}") # n - 1 args is list of items
  local choice selected

  for i in "${!items[@]}"; do
    echo "$((i + 1)). ${items[$i]}"
  done

  while true; do
    read -p "Enter number (1-${#items[@]}): " choice

    # input must be number and it must be within available choices
    if [[ "$choice" =~ ^[0-9]+$ ]] && ((choice >= 1 && choice <= ${#items[@]})); then
      selected="${items[$((choice - 1))]}"
      break
    else
      echo "❌ Invalid choice. Try again."
    fi
  done

  eval "${!#}=\"$selected\"" # assign answer to n th arg
}

# Function to ask yes or no question
# Usage: ask_yes_no "your question?"
ask_yes_no() {
  local question="$1"
  while true; do
    read -rp "$question (y/n): " answer

    answer_lower=$(echo "$answer" | tr '[:upper:]' '[:lower:]')
    case "$answer_lower" in
    y | yes)
      return 0
      ;;
    n | no)
      return 1
      ;;
    *)
      echo "❌ Invalid input. Please enter y/n or yes/no."
      ;;
    esac
  done
}
