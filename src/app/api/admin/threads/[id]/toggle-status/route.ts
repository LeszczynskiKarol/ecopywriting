// src/app/api/admin/threads/[id]/toggle-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '../../../../../../lib/dbConnect';
import Thread from '../../../../../../models/Thread';
import { verifyToken } from '../../../../../../utils/auth';


export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }
    const decodedToken = await verifyToken(token);
    if (!decodedToken || decodedToken.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const threadId = params.id;
    const thread = await Thread.findById(threadId);
    if (!thread) {
      return NextResponse.json({ success: false, message: 'Thread not found' }, { status: 404 });
    }

    thread.isOpen = !thread.isOpen;
    await thread.save();
     
    return NextResponse.json({ success: true, data: thread });
} catch (error) {
  console.error('Error in PUT /api/admin/threads/[id]/toggle-status:', error);
  const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
  return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
}
}