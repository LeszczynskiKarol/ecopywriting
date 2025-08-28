// src/app/api/messages/route.ts
console.log("API messages route file loaded", new Date().toISOString());
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Thread from '../../../models/Thread';
import Message from '../../../models/Message';
import jwt from 'jsonwebtoken';
import { uploadSingle } from '../../../utils/s3Upload';
import sendEmail from '../../../utils/sendEmail';
import User from '@/models/User';

console.log("API route file loaded");

function verifyToken(token: string): { id: string } | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export async function GET(req: NextRequest) {
    console.log("GET function called");
    return NextResponse.json({ message: "GET route is working" });
  }

export async function POST(req: NextRequest) {
  console.log("POST function called");
  await dbConnect();
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Brak tokenu autoryzacji' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = verifyToken(token);
    if (!decodedToken || !decodedToken.id) {
      return NextResponse.json({ success: false, message: 'Nieprawidłowy token' }, { status: 401 });
    }

    const senderId = decodedToken.id;
    const formData = await req.formData();
    const recipientId = formData.get('recipientId') as string;
    const department = formData.get('department') as string;
    const subject = formData.get('subject') as string;
    const content = formData.get('content') as string;
    const attachments = formData.getAll('attachments') as File[];

    console.log('Creating new thread with data:', { senderId, recipientId, department, subject, content });

    if (!department) {
      return NextResponse.json({ success: false, message: 'Dział jest wymagany' }, { status: 400 });
    }

    let thread = new Thread({
      subject,
      participants: [senderId, recipientId],
      department,
      lastMessageDate: new Date()
    });

    await thread.save();

    const message = new Message({
      threadId: thread._id,
      sender: senderId,
      recipient: recipientId,
      content,
      attachments: []
    });

    if (attachments && attachments.length > 0) {
      for (const file of attachments) {
        try {
          const result = await uploadSingle(file);
          message.attachments.push({
            filename: result.originalname,
            url: result.location
          });
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      }
    }

    await message.save();

    thread.lastMessage = message._id;
    thread.lastMessageDate = message.createdAt;
    await thread.save();

    const sender = await User.findById(senderId);
    const admin = await User.findOne({ role: 'admin' });

    if (admin && admin.email) {
      try {
        await sendEmail({
          email: admin.email,
          subject: `Nowy wątek: ${subject}`,
          message: `
            Nowy wątek został utworzony przez użytkownika ${sender.name} (${sender.email}).
            
            Temat: ${subject}
            Dział: ${department}
            Treść pierwszej wiadomości: ${content}
            
            Aby zobaczyć szczegóły, zaloguj się do panelu administracyjnego:
            ${process.env.FRONTEND_URL}/admin/threads/${thread._id}
          `
        });
        console.log('E-mail do admina wysłany pomyślnie');
      } catch (emailError) {
        console.error('Błąd podczas wysyłania e-maila do admina:', emailError);
      }
    }

    return NextResponse.json({ success: true, data: { thread, message } }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/messages:', error);
    if (error instanceof Error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ success: false, message: 'An unknown error occurred' }, { status: 500 });
    }
  }
}