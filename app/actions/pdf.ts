"use server";

import { spawn } from 'child_process';
import { writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export async function processPDF(file: File): Promise<string> {
  try {
    // Create a temporary file path
    const tempDir = tmpdir();
    const inputPath = join(tempDir, `input-${Date.now()}.pdf`);
    const outputPath = join(tempDir, `output-${Date.now()}.txt`);

    // Convert File to Buffer and write to temp file
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, buffer);

    // Call Python script to process PDF
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        'cli/pdf_converter.py',
        inputPath,
        outputPath
      ]);

      let errorOutput = '';

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on('close', async (code) => {
        if (code !== 0) {
          reject(new Error(`PDF processing failed: ${errorOutput}`));
          return;
        }

        try {
          // Read the output file
          const outputText = await readFile(outputPath, 'utf-8');
          
          // Clean up temporary files
          await Promise.all([
            unlink(inputPath),
            unlink(outputPath)
          ]);

          resolve(outputText);
        } catch (error) {
          console.error('Error reading output file:', error);
          reject(new Error('Failed to read processed text'));
        }
      });
    });
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error('Internal server error');
  }
} 