// src/app/api/admin/threads/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/dbConnect';
import Thread from '../../../../../models/Thread';
import Message from '../../../../../models/Message';
import { verifyToken } from '../../../../../utils/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  console.log('GET request received for thread:', params.id);
  await dbConnect();
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    console.log('Received token:', token);
    
    if (!token) {
      console.log('No token provided');
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }
    
    const decodedToken = await verifyToken(token);
    console.log('Decoded token:', decodedToken);
    
    if (!decodedToken || decodedToken.role !== 'admin') {
      console.log('User is not an admin or invalid token');
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const threadId = params.id;
    const thread = await Thread.findById(threadId);
    console.log('Thread found:', thread);
    
    if (!thread) {
      return NextResponse.json({ success: false, message: 'Thread not found' }, { status: 404 });
    }

    const messages = await Message.find({ threadId })
      .sort('createdAt')
      .populate('sender', 'name')
      .populate('recipient', 'name');
    console.log('Messages found:', messages.length);

    return NextResponse.json({ success: true, data: { thread, messages } });
  } catch (error) {
    console.error('Error in GET /api/admin/threads/[id]:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}