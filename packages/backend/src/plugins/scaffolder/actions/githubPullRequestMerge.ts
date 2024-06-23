// packages/backend/src/plugins/scaffolder/actions/githubPullRequestMerge.ts
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { spawn } from 'child_process';
import { resolve } from 'path';
import { z } from 'zod';

export const createGithubPullRequestMergeAction = (accessToken: string) => {
  return createTemplateAction({
    id: 'custom:github:pr:merge',
    schema: {
      input: z.object({
        repoOwner: z.string().describe('The owner of the repository'),
        repoName: z.string().describe('The name of the repository'),
        sourceBranch: z.string().describe('The source branch to merge'),
      }),
    },
    async handler(ctx) {
      const { repoOwner, repoName, sourceBranch } = ctx.input;


      const scriptPath = resolve(__dirname, '../../../scripts/githubMerge.sh');
      const args = [
        repoOwner,
        repoName,
        sourceBranch,
        accessToken,
      ];

      const child = spawn(scriptPath, args, {
        stdio: 'inherit',
        shell: true,
      });

      child.on('close', (code) => {
        if (code !== 0) {
          ctx.logger.error(`githubMerge.sh script exited with code ${code}`);
          throw new Error(`githubMerge.sh script failed with code ${code}`);
        }
      });

      child.on('error', (err) => {
        ctx.logger.error(`Failed to start child process: ${err}`);
        throw new Error(`Failed to start child process: ${err}`);
      });
    },
  });
};
