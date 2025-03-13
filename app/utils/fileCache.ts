import { writeFile, readFile, mkdir, access } from 'fs/promises';
import { join } from 'path';
import process from 'process';

export class FileCache {
    private cacheDir: string;

    constructor(cacheDirName: string = '.cache') {
        this.cacheDir = join(process.cwd(), cacheDirName);
    }

    private async ensureCacheDir() {
        try {
            await access(this.cacheDir);
        } catch {
            await mkdir(this.cacheDir, { recursive: true });
        }
    }

    private getCacheKey(key: string): string {
        return key.replace(/[^a-zA-Z0-9]/g, '_');
    }

    async get<T>(key: string): Promise<T | null> {
        await this.ensureCacheDir();
        const cacheKey = this.getCacheKey(key);
        const cachePath = join(this.cacheDir, `${cacheKey}.json`);

        try {
            const cachedData = await readFile(cachePath, 'utf-8');
            return JSON.parse(cachedData) as T;
        } catch {
            return null;
        }
    }

    async set<T>(key: string, value: T): Promise<void> {
        await this.ensureCacheDir();
        const cacheKey = this.getCacheKey(key);
        const cachePath = join(this.cacheDir, `${cacheKey}.json`);
        await writeFile(cachePath, JSON.stringify(value));
    }
} 