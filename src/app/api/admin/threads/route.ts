// src/app/api/admin/threads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import mongoose from 'mongoose';
import { verifyToken } from '../../../../utils/auth';

let Thread: mongoose.Model<any>;
let User: mongoose.Model<any>;
let Message: mongoose.Model<any>;

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await dbConnect();
  Thread = mongoose.models.Thread || mongoose.model('Thread', require('../../../../models/Thread').schema);
  User = mongoose.models.User || mongoose.model('User', require('../../../../models/User').schema);
  Message = mongoose.models.Message || mongoose.model('Message', require('../../../../models/Message').schema);

  try {
    console.log('Otrzymano żądanie GET /api/admin/threads');
    const token = req.headers.get('Authorization')?.split(' ')[1];
    console.log('Received token:', token);
    
    if (!token) {
      console.log('Brak tokenu autoryzacji');
      return NextResponse.json({ success: false, message: 'Brak tokenu autoryzacji' }, { status: 401 });
    }
    
    const decodedToken = verifyToken(token);
    console.log('Decoded token:', decodedToken);
    
    if (!decodedToken) {
      console.log('Nieprawidłowy token');
      return NextResponse.json({ success: false, message: 'Nieprawidłowy token' }, { status: 401 });
    }
    
    if (decodedToken.role !== 'admin') {
      console.log('Brak uprawnień admina. Rola użytkownika:', decodedToken.role);
      return NextResponse.json({ success: false, message: 'Brak uprawnień' }, { status: 403 });
    }


    const threads = await Thread.find().sort('-lastMessageDate');
    const threadsWithLastMessage = await Promise.all(threads.map(async (thread) => {
      const lastMessage = await Message.findOne({ threadId: thread._id })
        .sort('-createdAt')
        .populate('sender', 'name');
      return {
        _id: thread._id,
        subject: thread.subject,
        isOpen: thread.isOpen,
        lastMessage: lastMessage ? {
          sender: { name: lastMessage.sender?.name || 'Unknown' },
          content: lastMessage.content,
          createdAt: lastMessage.createdAt
        } : null
      };
    }));
    
    return NextResponse.json({ success: true, data: threadsWithLastMessage });
  } catch (error) {
    console.error('Error in GET /api/admin/threads:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}