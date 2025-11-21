import { put } from '@vercel/blob';

export async function uploadImage(file: File) {
    const blob = await put(file.name, file, {
        access: 'public',
        addRandomSuffix: true,
        token: process.env.IMAGES_READ_WRITE_TOKEN,
    });
    return blob.url;
}
