import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { z } from 'zod';
import { JsonValue } from '@backstage/types';

export const createCloudBuildTriggerAction = () => {
  return createTemplateAction({
    id: 'custom:cloudBuildTrigger:create',
    schema: {
      input: z.object({
        triggerName: z.string().describe('The name of the Cloud Build trigger'),
        projectId: z.string().describe('GCP Project ID'),
        repoName: z.string().describe('Repository name'),
        repoOwner: z.string().describe('Repository owner'),
        branchName: z.string().describe('Branch name'),
      }),
    },
    async handler(ctx) {
      const { triggerName, projectId, repoName, repoOwner, branchName } = ctx.input;
      const accessToken = process.env.GCP_ACCESS_TOKEN;

      const fetch = (await import('node-fetch')).default;

      // Step 1: Create GitHub Connection
      const connectionBody = {
        name: `projects/${projectId}/connections/github`,
        githubConfig: {
          appId: process.env.GITHUB_APP_ID,
          installationId: process.env.GITHUB_INSTALLATION_ID,
          privateKey: process.env.GITHUB_PRIVATE_KEY,
          authorizerCredential: {
            oauthCredential: {
              oauthTokenSecretVersion: `projects/${projectId}/secrets/GITHUB_OAUTH_TOKEN/versions/latest`,
            },
          },
        },
      };

      const connectionResponse = await fetch(`https://cloudbuild.googleapis.com/v1/projects/${projectId}/connections`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connectionBody),
      });

      if (!connectionResponse.ok) {
        const error = await connectionResponse.text();
        ctx.logger.error(`Failed to create GitHub connection: ${error}`);
        throw new Error(`Failed to create GitHub connection: ${error}`);
      }

      await connectionResponse.json();

      // Step 2: Create Cloud Build Trigger
      const triggerBody = {
        name: triggerName,
        description: 'Automatically created trigger from Backstage template',
        github: {
          name: repoName,
          owner: repoOwner,
          push: {
            branch: branchName,
          },
        },
        build: {
          steps: [
            {
              name: 'gcr.io/cloud-builders/docker',
              args: ['build', '-t', 'gcr.io/$PROJECT_ID/$REPO_NAME:$COMMIT_SHA', '.'],
            },
            {
              name: 'gcr.io/cloud-builders/docker',
              args: ['push', 'gcr.io/$PROJECT_ID/$REPO_NAME:$COMMIT_SHA'],
            },
            {
              name: 'gcr.io/cloud-builders/gcloud',
              entrypoint: 'bash',
              args: [
                '-c',
                `
                  PROJECT=$$(gcloud config get-value core/project)
                  gke-gcloud-auth-plugin --version
                  export USE_GKE_GCLOUD_AUTH_PLUGIN=True
                  gcloud container clusters get-credentials $CLUSTER --project $PROJECT --zone $ZONE
                  kubectl apply -f /k8s/production.yml.yaml
                `,
              ],
            },
          ],
          substitutions: {
            _REGISTRY_URL: 'docker.io/reyshazni',
            _PROJECT: 'intern-infra',
            _CLUSTER: 'sandbox',
            _ZONE: 'asia-southeast2-a',
          },
        },
      };

      const triggerResponse = await fetch(
        `https://cloudbuild.googleapis.com/v1/projects/${projectId}/triggers`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(triggerBody),
        },
      );

      if (!triggerResponse.ok) {
        const error = await triggerResponse.text();
        ctx.logger.error(`Failed to create Cloud Build trigger: ${error}`);
        throw new Error(`Failed to create Cloud Build trigger: ${error}`);
      }

      const triggerData = await triggerResponse.json() as JsonValue;
      ctx.output('trigger', triggerData);
    },
  });
};