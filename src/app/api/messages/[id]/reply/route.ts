// src/app/api/messages/[id]/reply/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/dbConnect';
import Message from '../../../../../models/Message';
import Thread from '../../../../../models/Thread';
import jwt from 'jsonwebtoken';

function verifyToken(token: string): { id: string } | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    console.log('POST request received in /api/messages/[id]/reply');
    console.log('Thread ID:', params.id);
  
    await dbConnect();
    try {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Authorization header missing or invalid');
        return NextResponse.json({ success: false, message: 'Brak tokenu autoryzacji' }, { status: 401 });
      }
  
      const token = authHeader.split(' ')[1];
      const decodedToken = verifyToken(token);
      if (!decodedToken || !decodedToken.id) {
        console.log('Invalid token');
        return NextResponse.json({ success: false, message: 'Nieprawidłowy token' }, { status: 401 });
      }
  
      console.log('User ID:', decodedToken.id);
  
      const formData = await req.formData();
      console.log('Form data:', Object.fromEntries(formData));
  
      const content = formData.get('content') as string;
      const recipientId = formData.get('recipientId') as string;
  
      console.log('Content:', content);
      console.log('Recipient ID:', recipientId);
  
      if (!content) {
        return NextResponse.json({ success: false, message: 'Treść wiadomości jest wymagana' }, { status: 400 });
      }
  
      if (!recipientId) {
        return NextResponse.json({ success: false, message: 'ID odbiorcy jest wymagane' }, { status: 400 });
      }
  
      const thread = await Thread.findById(params.id);
      if (!thread) {
        return NextResponse.json({ success: false, message: 'Wątek nie znaleziony' }, { status: 404 });
      }
  
      const message = new Message({
        threadId: thread._id,
        sender: decodedToken.id,
        recipient: recipientId,
        content
      });
  
      await message.save();
  
      thread.lastMessageDate = message.createdAt;
      await thread.save();
  
      return NextResponse.json({ success: true, data: message }, { status: 201 });
    } catch (error) {
      console.error('Error in POST /api/messages/[id]/reply:', error);
      if (error instanceof Error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      } else {
        return NextResponse.json({ success: false, message: 'An unknown error occurred' }, { status: 500 });
      }
    }
  }