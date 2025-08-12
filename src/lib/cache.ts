import { promises as fs } from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.cache', 'yr');

interface CacheData {
    last_modified: string | null;
    expires: string | null;
    data: any;
}

// Ensure the cache directory exists
async function ensureCacheDir() {
    console.log(`Ensuring cache directory exists at: ${CACHE_DIR}`);
    try {
        await fs.mkdir(CACHE_DIR, { recursive: true });
    } catch (error) {
        console.error('Failed to create cache directory:', error);
    }
}

export function getCacheKey(latitude: number, longitude: number): string {
    return `lat=${latitude.toFixed(4)}_lon=${longitude.toFixed(4)}.json`;
}

export async function readCache(key: string): Promise<CacheData | null> {
    await ensureCacheDir();
    const filePath = path.join(CACHE_DIR, key);
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        // If the file doesn't exist or there's a parsing error, return null
        if (error.code === 'ENOENT') {
            return null;
        }
        console.error(`Failed to read cache file ${key}:`, error);
        return null;
    }
}

export async function writeCache(key: string, data: any, headers: Headers): Promise<void> {
    await ensureCacheDir();
    const filePath = path.join(CACHE_DIR, key);
    const cacheData: CacheData = {
        last_modified: headers.get('last-modified'),
        expires: headers.get('expires'),
        data: data,
    };

    try {
        await fs.writeFile(filePath, JSON.stringify(cacheData, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Failed to write to cache file ${key}:`, error);
    }
}
