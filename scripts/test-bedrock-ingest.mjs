import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function runOpsCheck() {
    console.log('--- Ops Check: AWS Bedrock Adapter ---');
    
    // 1. Force the database into "cloud" mode
    await prisma.adminConfig.upsert({
        where: { id: 'admin' },
        update: { aiMode: 'cloud' },
        create: {
            id: 'admin',
            username: 'admin',
            password: 'password', // fallback
            siteTitle: 'Lunar Gallery',
            aiMode: 'cloud'
        }
    });
    console.log('✅ UI AI Engine toggled to: Cloud AI');

    // 2. Select a test image
    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
    
    if (files.length === 0) {
        console.error('❌ No images found in public/uploads to test with.');
        process.exit(1);
    }
    
    const testImageName = files.find(f => f.includes('highres')) || files[0];
    const testImagePath = path.join(uploadsDir, testImageName);
    console.log(`✅ Selected test image: ${testImageName}`);
    
    // 3. Construct File payload for fetch
    const fileBuffer = fs.readFileSync(testImagePath);
    const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', blob, testImageName);

    // 4. Hit the Ingest API
    console.log('✅ Sending payload to /api/ingest...');
    console.log('   (Watch your Next.js server terminal logs for the Bedrock connection)');
    
    const apiKey = process.env.INGEST_API_KEY || 'super_secret_local_key_123';
    
    const startTime = Date.now();
    const response = await fetch('http://localhost:3000/api/ingest', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`
        },
        body: formData
    });

    const data = await response.json();
    const duration = Date.now() - startTime;

    if (response.ok) {
        console.log(`✅ Ingest Success in ${duration}ms!`);
        console.log('--- Bedrock AI Output ---');
        console.log(`Title: ${data.photo.title}`);
        console.log(`Description: ${data.photo.description}`);
        console.log(`Album ID: ${data.photo.albumId}`);
        console.log('-------------------------');
        
        // Clean up: Delete the test photo from DB to not clutter the gallery
        await prisma.photo.delete({ where: { id: data.photo.id } });
        console.log(`✅ Ops Check Complete. Test photo cleaned up.`);
    } else {
        console.error('❌ Ingest API Error:', data);
    }
}

runOpsCheck()
    .then(() => process.exit(0))
    .catch(e => {
        console.error('❌ Ops Check Exception:', e);
        process.exit(1);
    });
