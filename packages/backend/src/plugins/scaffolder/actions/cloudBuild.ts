import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const createTriggerActions = () => {
  return createTemplateAction({
    id: 'custom:gcp:cloudbuild:trigger:create',
    schema: {
      input: z.object({
        projectId: z.string().describe('The GCP project ID'),
        repoOwner: z.string().describe('The owner of the repository'),
        repoName: z.string().describe('The name of the repository'),
        region: z.string().describe('The GCP region'),
      }),
    },
    async handler(ctx) {
      const { projectId, repoOwner, repoName, region } = ctx.input;
      const scriptPath = './src/scripts/createTrigger.sh'; // Ensure the path is correct

      try {
        const { stdout, stderr } = await execAsync(`bash ${scriptPath} ${projectId} ${repoOwner} ${repoName} ${region}`);
        
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
