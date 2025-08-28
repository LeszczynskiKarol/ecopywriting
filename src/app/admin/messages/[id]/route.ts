// src/app/api/admin/messages/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Thread from '../../../../models/Thread';
import Message from '../../../../models/Message';
import { verifyToken } from '../../../../utils/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  console.log('GET request received for message:', params.id);
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

    const messages = await Message.find({ threadId })
      .sort('createdAt')
      .populate('sender', 'name')
      .populate('recipient', 'name');

    return NextResponse.json({ success: true, data: { thread, messages } });
  } catch (error) {
    console.error('Error in GET /api/admin/messages/[id]:', error);
    if (error instanceof Error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ success: false, message: 'An unknown error occurred' }, { status: 500 });
    }
  }
}