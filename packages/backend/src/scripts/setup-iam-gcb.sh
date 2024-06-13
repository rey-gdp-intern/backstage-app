#!/bin/bash

# Default project ID, can be overridden by command line argument
PROJECT_ID="antrein-ta"

# Function to set variables for the project
set_project_variables() {
  if [ -n "$1" ]; then
    PROJECT_ID=$1
  fi
  PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
  echo "Project ID: $PROJECT_ID"
  echo "Project Number: $PROJECT_NUMBER"
}

# Function to check if IAM binding already exists
iam_binding_exists() {
  local member=$1
  local role=$2
  gcloud projects get-iam-policy $PROJECT_ID \
    --flatten="bindings[].members" \
    --format="table(bindings.members)" \
    --filter="bindings.role:$role AND bindings.members:$member" | grep -q "$member"
}

# Function to add IAM policy bindings
add_iam_policy_bindings() {
  echo "Adding IAM policy bindings..."

  if ! iam_binding_exists "serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" "roles/container.admin"; then
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member=serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com \
        --role=roles/container.admin
  else
    echo "Container admin role already exists for Cloud Build service account."
  fi

  if ! iam_binding_exists "serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" "roles/iam.serviceAccountUser"; then
    gcloud iam service-accounts add-iam-policy-binding \
        $PROJECT_NUMBER-compute@developer.gserviceaccount.com \
        --member=serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com \
        --role=roles/iam.serviceAccountUser
  else
    echo "IAM service account user role already exists for Cloud Build service account."
  fi

  if ! iam_binding_exists "serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" "roles/container.developer"; then
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member=serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com \
        --role=roles/container.developer
  else
    echo "Container developer role already exists for Cloud Build service account."
  fi

  if ! iam_binding_exists "serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" "roles/secretmanager.secretAccessor"; then
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member=serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com \
        --role=roles/secretmanager.secretAccessor
  else
    echo "Secret Manager secret accessor role already exists for Cloud Build service account."
  fi

  echo "IAM policy bindings added successfully."
}

# Main script execution
if [ -n "$1" ]; then
  echo "Using provided project ID: $1"
fi

set_project_variables $1
add_iam_policy_bindings

echo "Script execution completed."
