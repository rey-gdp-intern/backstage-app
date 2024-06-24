#!/bin/bash

# Variables
REPO_OWNER=$1
REPO_NAME=$2
SOURCE_BRANCH=$3
ACCESS_TOKEN=$4
COMMIT_MESSAGE="Merge branch $SOURCE_BRANCH"

# Function to print error and exit
print_error_and_exit() {
    echo "Error: $1"
    exit 1
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    print_error_and_exit "jq is not installed. Please install jq and try again."
fi

# List pull requests
list_prs_url="https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/pulls"
list_prs_response=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" $list_prs_url)

if [ -z "$list_prs_response" ]; then
    print_error_and_exit "Failed to list pull requests. Check if the repository exists and the access token is correct."
fi

# Find the target pull request
pull_request_number=$(echo $list_prs_response | jq -r ".[] | select(.head.ref==\"$SOURCE_BRANCH\") | .number")

if [ -z "$pull_request_number" ]; then
    print_error_and_exit "No pull request found for branch: $SOURCE_BRANCH"
fi

# Merge the pull request
merge_pr_url="https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/pulls/$pull_request_number/merge"
merge_pr_response=$(curl -s -X PUT -H "Authorization: Bearer $ACCESS_TOKEN" -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" -d "{\"commit_message\":\"$COMMIT_MESSAGE\"}" $merge_pr_url)

if [ -z "$merge_pr_response" ]; then
    print_error_and_exit "Failed to merge pull request"
fi

# Ensure the merge response is valid JSON
if ! echo "$merge_pr_response" | jq empty; then
    print_error_and_exit "Invalid JSON response from merge request"
fi

echo "Pull request merged successfully"
