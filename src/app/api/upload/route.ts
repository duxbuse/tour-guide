import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
        }

        // For development without Vercel Blob token, use a placeholder
        const hasToken = !!process.env.IMAGES_READ_WRITE_TOKEN;
        console.log('Upload request received:', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            hasToken
        });

        if (!hasToken) {
            console.log('No IMAGES_READ_WRITE_TOKEN found, using placeholder');
            // Return a placeholder URL for development
            const placeholderUrl = `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(file.name)}`;
            return NextResponse.json({ url: placeholderUrl });
        }

        console.log('Uploading to Vercel Blob...');

        // Upload to Vercel Blob
        const blob = await put(file.name, file, {
            access: 'public',
            addRandomSuffix: true,
            token: process.env.IMAGES_READ_WRITE_TOKEN,
        });

        console.log('✅ Upload successful to Vercel Blob:', blob.url);
        return NextResponse.json({ url: blob.url });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}
