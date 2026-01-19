// src/app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  const start = Date.now();
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '3306'),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    });
    
    await connection.execute('SELECT 1');
    await connection.end();
    
    const duration = Date.now() - start;
    return NextResponse.json({ 
      status: 'success', 
      dbConnectionTime: `${duration}ms` 
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      error: error.message,
      time: Date.now() - start 
    }, { status: 500 });
  }
}