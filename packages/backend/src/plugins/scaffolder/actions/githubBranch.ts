import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { z } from 'zod';
import { JsonValue } from '@backstage/types';

export const createGithubBranchAction = (accessToken: string) => {
  return createTemplateAction({
    id: 'custom:github:branch:create',
    schema: {
      input: z.object({
        repoOwner: z.string().describe('The owner of the repository'),
        repoName: z.string().describe('The name of the repository'),
        sourceBranch: z.string().describe('The source branch to branch from'),
        newBranchName: z.string().describe('The name of the new branch'),
      }),
    },
    async handler(ctx) {
      const { repoOwner, repoName, sourceBranch, newBranchName } = ctx.input; 
      const fetch = (await import('node-fetch')).default;

      // Step 1: Get the SHA of the source branch
      const sourceBranchShaUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs/heads/${sourceBranch}`;
      const sourceBranchResponse = await fetch(sourceBranchShaUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      if (!sourceBranchResponse.ok) {
        const error = await sourceBranchResponse.text();
        ctx.logger.error(`Failed to fetch source branch SHA: ${error}`);
        throw new Error(`Failed to fetch source branch SHA: ${error}`);
      }

      const sourceBranchData = await sourceBranchResponse.json();
      const sourceBranchSha = sourceBranchData.object.sha;

      // Step 2: Create the new branch
      const createBranchUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs`;
      const createBranchResponse = await fetch(createBranchUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
          ref: `refs/heads/${newBranchName}`,
          sha: sourceBranchSha,
        }),
      });

      if (!createBranchResponse.ok) {
        const error = await createBranchResponse.text();
        ctx.logger.error(`Failed to create new branch: ${error}`);
        throw new Error(`Failed to create new branch: ${error}`);
      }

      const data = await createBranchResponse.json() as JsonValue;
      ctx.output('branch', data);
    },
  });
};
