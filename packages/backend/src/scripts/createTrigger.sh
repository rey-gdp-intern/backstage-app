#!/bin/bash

# VARIABLE SUPPLIED BY USER
projectId=$1
repoOwner=$2
repoName=$3
region=$4

# VARIABLE JUST TO STORE
authorizerTokenSecretVersion="projects/$projectId/secrets/github-pat/versions/latest"
personalAccessToken="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"
serviceAccountKeyPath="./secrets/gcp_sa.json"

# Authenticate with GCP using service account
gcloud auth activate-service-account --key-file="$serviceAccountKeyPath"
gcloud config set project "$projectId"

# Get the installation ID for the app installed in the repository
installationId=$(curl -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $personalAccessToken" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/orgs/$repoOwner/installations | jq -r '.installations[] | select(.app_slug == "google-cloud-build") | .id')

# Check if installationId is empty
if [ -z "$installationId" ]; then
  echo "Failed to retrieve the installation ID."
  exit 1
else
  echo "Installation ID: $installationId"
fi

# Function to check if a connection exists
function check_connection_exists() {
  gcloud builds connections list --project="$projectId" --region="$region" --filter="name:$repoOwner" --format="value(name)"
}

existing_connection=$(check_connection_exists)

if [ -z "$existing_connection" ]; then
  echo "Creating a new Cloud Build connection..."
  gcloud builds connections create github "$repoOwner" \
    --project="$projectId" \
    --region="$region" \
    --authorizer-token-secret-version="$authorizerTokenSecretVersion" \
    --app-installation-id="$installationId"
else
  echo "Connection already exists: $existing_connection"
fi

# Create Cloud Build repository
gcloud builds repositories create "$repoName" \
  --project="$projectId" \
  --remote-uri="https://github.com/$repoOwner/$repoName.git" \
  --connection="$repoOwner" \
  --region="$region"

# Create Cloud Build trigger
gcloud builds triggers create github \
  --project="$projectId" \
  --name="$repoName-push" \
  --description="Build trigger for $repoName repository" \
  --repository="projects/$projectId/locations/$region/connections/$repoOwner/repositories/$repoName" \
  --branch-pattern=".*" \
  --build-config="cloudbuild.yaml" \
  --region="$region"
