import { createBackend } from '@backstage/backend-defaults';
import { GoogleAuth } from 'google-auth-library';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';
import { createBackendModule } from '@backstage/backend-plugin-api';

const scaffolderModuleCustomExtensions = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'custom-extensions',
  register(env) {
    env.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
      },
      async init({ scaffolder }) {
        const { createCloudBuildTriggerAction } = await import('./plugins/scaffolder/actions/cloudBuild');
        const { createGithubBranchAction } = await import('./plugins/scaffolder/actions/githubBranch');
        
        scaffolder.addActions(createCloudBuildTriggerAction());
        scaffolder.addActions(createGithubBranchAction());
      },
    });
  },
});

async function getAccessToken() {
  const keyFile = 'secrets/gcp_sa.json'; // Hardcoded path to your service account key file
  const auth = new GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();

  if (!tokenResponse) {
    throw new Error('Failed to obtain access token');
  }

  const accessToken = tokenResponse.token;

  if (!accessToken) {
    throw new Error('Access token is null or undefined');
  }

  return accessToken;
}

async function refreshAccessToken() {
  try {
    const gcpAccessToken = await getAccessToken();
    process.env.GCP_ACCESS_TOKEN = gcpAccessToken;

    console.log('GCP_ACCESS_TOKEN:', gcpAccessToken); // Log the access token value

    // Set a timeout to refresh the token before it expires (e.g., every 50 minutes)
    setTimeout(refreshAccessToken, 50 * 60 * 1000);
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    // Retry in a minute if there was an error
    setTimeout(refreshAccessToken, 1 * 60 * 1000);
  }
}

async function startBackend() {
  // Initially refresh the token
  await refreshAccessToken();
  
  const backend = createBackend();

  backend.add(import('@backstage/plugin-app-backend/alpha'));
  backend.add(import('@backstage/plugin-proxy-backend/alpha'));
  backend.add(import('@backstage/plugin-scaffolder-backend/alpha'));
  backend.add(import('@backstage/plugin-techdocs-backend/alpha'));

  // auth plugin
  backend.add(import('@backstage/plugin-auth-backend'));
  backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
  backend.add(import('@backstage/plugin-auth-backend-module-github-provider'));

  // catalog plugin
  backend.add(import('@backstage/plugin-catalog-backend/alpha'));
  backend.add(import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'));

  // permission plugin
  backend.add(import('@backstage/plugin-permission-backend/alpha'));
  backend.add(import('@backstage/plugin-permission-backend-module-allow-all-policy'));

  // search plugin
  backend.add(import('@backstage/plugin-search-backend/alpha'));
  backend.add(import('@backstage/plugin-search-backend-module-catalog/alpha'));
  backend.add(import('@backstage/plugin-search-backend-module-techdocs/alpha'));

  // github plugin
  backend.add(import('@backstage/plugin-catalog-backend-module-github/alpha'));
  backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));

  // http request actions plugin
  backend.add(import('@roadiehq/scaffolder-backend-module-http-request/new-backend'));

  // custom plugins
  backend.add(scaffolderModuleCustomExtensions());

  backend.start();
}

startBackend().catch(console.error);
