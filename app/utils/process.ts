import { spawn } from 'child_process';

/**
 * Runs a command and returns its output as a promise
 * @param command The command to run
 * @param args Array of command arguments
 * @param timeoutMs Timeout in milliseconds (default: 180000ms = 3 minutes)
 * @returns Promise that resolves with the command output
 */
export async function runCommand(
    command: string,
    args: string[],
    timeoutMs: number = 180000
): Promise<string> {
    return new Promise((resolve, reject) => {
        const process = spawn(command, args, {
            stdio: ['inherit', 'inherit', 'pipe'] // Inherit stdin/stdout, pipe stderr for error handling
        });
        let errorOutput = '';
        const timeoutId = setTimeout(() => {
            process.kill(); // Kill the process if it exceeds the timeout
            reject(new Error(`Command timed out after ${timeoutMs / 1000} seconds`));
        }, timeoutMs);

        process.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        process.on('close', async (code) => {
            clearTimeout(timeoutId); // Clear the timeout if the process completes
            if (code !== 0) {
                reject(new Error(`Command failed: ${errorOutput}`));
                return;
            }
            resolve(errorOutput);
        });

        // Handle process errors
        process.on('error', (error) => {
            clearTimeout(timeoutId);
            reject(new Error(`Failed to start command: ${error.message}`));
        });
    });
} 