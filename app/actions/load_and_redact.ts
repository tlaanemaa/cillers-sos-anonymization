"use server";

import { writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { runCommand } from '../utils/process';
import { Redaction } from '@/ai';
import { FileCache } from '../utils/fileCache';

const LOAD_AND_REDACT_STORAGE: PyOutput[] = [];
const fileCache = new FileCache();

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

    // Try to read from cache first
    const cachedData = await fileCache.get<Omit<PyOutput, 'filename'>>(fileName);
    if (cachedData) {
        LOAD_AND_REDACT_STORAGE.push({
            ...cachedData,
            filename: fileName
        });
        return cachedData.original_text;
    }

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

        // Store in memory for BART and file cache for persistence
        LOAD_AND_REDACT_STORAGE.push({
            ...parsedOutput,
            filename: fileName
        });
        await fileCache.set(fileName, parsedOutput);

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