import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  try {
    const filePath = path.join(process.cwd(), 'storage', 'uploads', ...params.path);
    
    if (!fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const extension = path.extname(filePath).toLowerCase();
    
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeTypes[extension] || 'application/octet-stream',
      },
    });
  } catch (error) {
    return new NextResponse('Error serving file', { status: 500 });
  }
}