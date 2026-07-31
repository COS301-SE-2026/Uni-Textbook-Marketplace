import * as dotenv from 'dotenv';
import * as path from 'path';



process.env.NODE_ENV = 'test';

console.log('Loading setup...');
console.log('NODE_ENV:', process.env.NODE_ENV);


const possiblePaths = [
    path.join(__dirname, '../.env.test'),
    path.join(__dirname, '.env.test'),
    path.join(process.cwd(), '.env.test'),
];

let loaded = false;
for (const envPath of possiblePaths) {
    const result = dotenv.config({ path: envPath });
    
    if (!result.error) {
        console.log(`Loaded .env.test from: ${envPath}`);
        loaded = true;
        break;
    } else {
       
        continue;
    }
}

if (!loaded) {
    console.warn('No .env.test file found in any of the expected locations');
}


if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set, using fallback');
    process.env.DATABASE_URL = 'postgres://nexusdev:nexusdev_local@localhost:5433/textbook_marketplace_test';
}  


console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');