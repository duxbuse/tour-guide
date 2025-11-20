// Test script to verify Vercel Blob image upload
// Run with: node scripts/test-upload.js

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testUpload() {
    try {
        // Create a simple test file
        const testImagePath = path.join(__dirname, 'test-image.txt');
        fs.writeFileSync(testImagePath, 'This is a test image file');

        // Create form data
        const form = new FormData();
        form.append('file', fs.createReadStream(testImagePath), {
            filename: 'test-image.png',
            contentType: 'image/png'
        });

        // Make upload request
        console.log('Testing upload to http://localhost:3000/api/upload...');
        const response = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        const result = await response.json();

        console.log('Response status:', response.status);
        console.log('Response body:', JSON.stringify(result, null, 2));

        if (response.ok) {
            console.log('✅ Upload successful!');
            console.log('Image URL:', result.url);

            // Check if it's a real Vercel Blob URL or placeholder
            if (result.url.includes('vercel-storage')) {
                console.log('✅ Real Vercel Blob upload confirmed!');
            } else if (result.url.includes('placeholder')) {
                console.log('⚠️  Using placeholder URL (IMAGES_READ_WRITE_TOKEN not set)');
            }
        } else {
            console.log('❌ Upload failed:', result.error);
        }

        // Cleanup
        fs.unlinkSync(testImagePath);
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testUpload();
