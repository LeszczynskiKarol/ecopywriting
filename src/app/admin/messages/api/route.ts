// src/app/api/admin/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Thread from '../../../../models/Thread';
import Message from '../../../../models/Message';
import { verifyToken } from '../../../../utils/auth';

console.log('Admin messages route file loaded');

export async function GET(req: NextRequest) {
  console.log('Otrzymano żądanie GET dla wszystkich wiadomości');
  console.log('Nagłówki żądania:', req.headers);

  await dbConnect();
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Brak tokenu autoryzacji');
      return NextResponse.json({ success: false, message: 'Brak tokenu autoryzacji' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    console.log('Otrzymany token:', token);
    
    const decodedToken = await verifyToken(token);
    console.log('Zdekodowany token:', decodedToken);
    
    if (!decodedToken) {
      console.log('Nieprawidłowy token');
      return NextResponse.json({ success: false, message: 'Nieprawidłowy token' }, { status: 401 });
    }
    
    if (decodedToken.role !== 'admin') {
      console.log('Użytkownik nie jest adminem. Rola użytkownika:', decodedToken.role);
      return NextResponse.json({ success: false, message: 'Brak uprawnień' }, { status: 403 });
    }

    console.log('Użytkownik uwierzytelniony jako admin');



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
          sender: { name: lastMessage.sender.name },
          content: lastMessage.content,
          createdAt: lastMessage.createdAt
        } : null
      };
    }));

    console.log('Threads with last message:', threadsWithLastMessage.length);
    return NextResponse.json({ success: true, data: threadsWithLastMessage });
  } catch (error) {
    console.error('Error in GET /api/admin/messages/[id]:', error);
    if (error instanceof Error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ success: false, message: 'An unknown error occurred' }, { status: 500 });
    }
  }
}