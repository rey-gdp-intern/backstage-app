#!/bin/bash

# Usage: ./merge_pull_request.sh

# Variables
REPO_OWNER="rey-gdp-intern"
REPO_NAME="terraform"
SOURCE_BRANCH="compute-engine-test-tf-rey"
ACCESS_TOKEN="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"
COMMIT_MESSAGE="Merge branch $SOURCE_BRANCH"

# Validate input parameters
if [ -z "$REPO_OWNER" ] || [ -z "$REPO_NAME" ] || [ -z "$SOURCE_BRANCH" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo "Missing required variables. Please ensure all variables are set."
  exit 1
fi

# List pull requests
list_prs_url="https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/pulls"
list_prs_response=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" $list_prs_url)

if [ -z "$list_prs_response" ]; then
  echo "Failed to list pull requests"
  exit 1
fi

# Find the target pull request
pull_request_number=$(echo $list_prs_response | jq -r ".[] | select(.head.ref==\"$SOURCE_BRANCH\") | .number")

if [ -z "$pull_request_number" ]; then
  echo "No pull request found for branch: $SOURCE_BRANCH"
  exit 1
fi

merge_pr_url="https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/pulls/$pull_request_number/merge"
merge_pr_response=$(curl -s -X PUT -H "Authorization: Bearer $ACCESS_TOKEN" -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" -d "{\"commit_message\":\"$COMMIT_MESSAGE\"}" $merge_pr_url)

if [ -z "$merge_pr_response" ]; then
  echo "Failed to merge pull request"
  exit 1
fi

# Ensure the merge response is valid JSON
if ! echo "$merge_pr_response" | jq empty; then
  echo "Invalid JSON response from merge request"
  exit 1
fi

echo "Pull request merged successfully"
