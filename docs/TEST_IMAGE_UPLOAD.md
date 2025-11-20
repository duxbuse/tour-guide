# Manual Test Instructions for Vercel Blob Upload

## Prerequisites
✅ `IMAGES_READ_WRITE_TOKEN` is set in your `.env` file
✅ Development server is running (`npm run dev`)

## Test Steps

### 1. Open the Inventory Page
Navigate to: http://localhost:3000/dashboard/inventory

### 2. Create a New Item
1. Click the **"+ New Item"** button
2. The "Add Merchandise Item" modal will open

### 3. Upload an Image
1. Click the **"📁 Choose Image"** button
2. Select any image file from your computer (JPG, PNG, WebP, or GIF, max 5MB)
3. Watch for the upload progress:
   - Button will change to **"📤 Uploading..."**
   - After a moment, you'll see a 120x120px preview of your image

### 4. Verify the Upload
**Check the Terminal/Console:**
You should see logs like:
```
Upload request received: {
  fileName: 'your-image.jpg',
  fileSize: 123456,
  fileType: 'image/jpeg',
  hasToken: true
}
Uploading to Vercel Blob...
✅ Upload successful to Vercel Blob: https://[your-blob-url].vercel-storage.com/...
```

**Check the Image Preview:**
- The preview should show your uploaded image
- The URL should be a Vercel Blob URL (contains `vercel-storage.com`)
- NOT a placeholder URL (would contain `placeholder.com`)

### 5. Complete the Item Creation
1. Fill in the item name (e.g., "Tour T-Shirt")
2. Add a description (optional)
3. Add at least one variant (size, type, price)
4. Click **"Create Item"**

### 6. Verify the Item
- The modal should close
- Your new item should appear in the grid
- The uploaded image should be displayed on the merch card

## Expected Results

### ✅ Success Indicators:
- Upload completes in 1-3 seconds
- Console shows `hasToken: true`
- Console shows `✅ Upload successful to Vercel Blob:`
- Image URL contains `vercel-storage.com`
- Image preview displays correctly
- Item is created with the image

### ❌ Failure Indicators:
- Console shows `hasToken: false`
- Console shows "No IMAGES_READ_WRITE_TOKEN found"
- Image URL contains `placeholder.com`
- Upload takes longer than 5 seconds
- Error message appears

## Troubleshooting

### If `hasToken: false`:
1. Check your `.env` file has `IMAGES_READ_WRITE_TOKEN=...`
2. Restart the dev server (`Ctrl+C` then `npm run dev`)
3. Verify the token is correct (starts with `vercel_blob_rw_`)

### If upload fails:
1. Check the console for error messages
2. Verify file size is under 5MB
3. Verify file type is JPG, PNG, WebP, or GIF
4. Check your Vercel Blob store is active

### If placeholder URL appears:
- The token is not being read
- Restart the server after adding the token to `.env`
