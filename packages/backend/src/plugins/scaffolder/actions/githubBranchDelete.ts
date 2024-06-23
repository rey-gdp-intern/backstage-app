import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { z } from 'zod';

export const deleteGithubBranchAction = (accessToken: string) => {
  return createTemplateAction({
    id: 'custom:github:branch:delete',
    schema: {
      input: z.object({
        repoOwner: z.string().describe('The owner of the repository'),
        repoName: z.string().describe('The name of the repository'),
        branchName: z.string().describe('The name of the branch to delete'),
      }),
    },
    async handler(ctx) {
      const { repoOwner, repoName, branchName } = ctx.input;
      const fetch = (await import('node-fetch')).default;

      // Step 1: Delete the branch
      const deleteBranchUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs/heads/${branchName}`;
      const deleteBranchResponse = await fetch(deleteBranchUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      if (!deleteBranchResponse.ok) {
        const error = await deleteBranchResponse.text();
        ctx.logger.error(`Failed to delete branch: ${error}`);
        throw new Error(`Failed to delete branch: ${error}`);
      }

      ctx.logger.info(`Branch ${branchName} deleted successfully.`);
    },
  });
};
