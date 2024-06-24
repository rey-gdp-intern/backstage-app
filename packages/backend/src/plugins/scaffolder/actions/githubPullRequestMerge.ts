// packages/backend/src/plugins/scaffolder/actions/githubPullRequestMerge.ts
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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
      const scriptPath = './src/scripts/githubMerge.sh'; // Ensure the path is correct

      try {
        const { stdout, stderr } = await execAsync(`bash ${scriptPath} ${repoOwner} ${repoName} ${sourceBranch} ${accessToken}`);
        
        if (stderr) {
          ctx.logger.error(`Error: ${stderr}`);
        }
        
        ctx.logger.info(`Output: ${stdout}`);
      } catch (error) {
        ctx.logger.error(`Error executing script: ${(error as Error).message}`);
        throw new Error(`Failed to execute script: ${(error as Error).message}`);
      }
    },
  });
};
