#!/bin/bash

# VARIABLE SUPPLIED BY USER
projectId=$1
repoOwner=$2
repoName=$3
region=$4

# VARIABLE JUST TO STORE
authorizerTokenSecretVersion="projects/$projectId/secrets/github-pat/versions/latest"
personalAccessToken="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"
defaultBranch="master"

# Set service account key path based on project ID
if [ "$projectId" == "intern-infra" ]; then
  serviceAccountKeyPath="./secrets/gcp_sa.json"
else
  serviceAccountKeyPath="./secrets/gcp_sa_test.json"
fi

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
  --branch-pattern="$defaultBranch|staging|staging_.*|develop|develop_.*" \
  --build-config="cloudbuild.yaml" \
  --region="$region"

# Get the trigger ID
triggerId=$(gcloud builds triggers list --project="$projectId" --region="$region" --filter="name:$repoName-push" --format="value(id)")

if [ -z "$triggerId" ]; then
  echo "Failed to retrieve the trigger ID."
  exit 1
else
  echo "Trigger ID: $triggerId"
fi

# Trigger the build
gcloud builds triggers run "$triggerId" --branch="$defaultBranch" --project="$projectId" --region="$region"