// test-cache.ts
import { fetchYrData } from './src/lib/api';

async function test() {
    console.log('Testing fetchYrData...');
    try {
        const data = await fetchYrData(60.1, 10.2);
        console.log('Successfully fetched data:');
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error during test:', error);
    }
}

test();
