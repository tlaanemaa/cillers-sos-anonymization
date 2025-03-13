"use server";

import { writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { runCommand } from '../utils/process';

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

    console.log('Processed PDF:', outputText);

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