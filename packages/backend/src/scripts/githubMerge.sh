#!/bin/bash

# Variables
REPO_OWNER=$1
REPO_NAME=$2
SOURCE_BRANCH=$3
ACCESS_TOKEN=$4
COMMIT_MESSAGE="Merge branch $SOURCE_BRANCH"

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
