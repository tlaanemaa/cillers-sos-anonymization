"use server";

import { writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { runCommand } from '../utils/process';
import { Redaction } from '@/ai';

const LOAD_AND_REDACT_STORAGE: PyOutput[] = [];

type PyOutput = {
    filename: string,
    original_text: string,
    censored_text: string,
    original_markdown: string,
    censored_markdown: string,
    tagged_text: string,
    redactions: Redaction[]
}

export async function getCache(): Promise<PyOutput[]> {
    return LOAD_AND_REDACT_STORAGE;
}

export async function processPDF(file: File): Promise<string> {
    // Get the original filename
    const fileName = file.name;

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
        const pyOutput = await readFile(outputPath, 'utf-8');
        const parsedOutput = JSON.parse(pyOutput);
        LOAD_AND_REDACT_STORAGE.push({
            ...parsedOutput,
            filename: fileName
        });

        // Clean up temporary files
        await Promise.all([
            unlink(inputPath),
            unlink(outputPath)
        ]);

        return parsedOutput.original_text;
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