"use server";

import { spawn } from 'child_process';
import { writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

/**
 * Runs a command and returns its output as a promise
 * @param command The command to run
 * @param args Array of command arguments
 * @param timeoutMs Timeout in milliseconds (default: 180000ms = 3 minutes)
 * @returns Promise that resolves with the command output
 */
async function runCommand(
  command: string,
  args: string[],
  timeoutMs: number = 180000
): Promise<string> {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args);
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

export async function processPDF(file: File): Promise<string> {
  const tempDir = tmpdir();
  const inputPath = join(tempDir, `input-${Date.now()}.pdf`);
  const outputPath = join(tempDir, `output-${Date.now()}.txt`);

  try {
    // Convert File to Buffer and write to temp file
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, buffer);

    // Run the PDF conversion command with a 3-minute timeout
    await runCommand('python', [
      'cli/pdf_converter.py',
      inputPath,
      outputPath
    ]);

    // Read the output file
    const outputText = await readFile(outputPath, 'utf-8');

    // Clean up temporary files
    await Promise.all([
      unlink(inputPath),
      unlink(outputPath)
    ]);

    return outputText;
  } catch (error) {
    console.error('Error processing PDF:', error);
    // Clean up temporary files even if there's an error
    try {
      await Promise.all([
        unlink(inputPath).catch(() => { }),
        unlink(outputPath).catch(() => { })
      ]);
    } catch (cleanupError) {
      console.error('Error cleaning up temporary files:', cleanupError);
    }
    throw new Error('Failed to process PDF file');
  }
} 