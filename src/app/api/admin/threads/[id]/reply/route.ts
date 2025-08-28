// src/app/api/admin/threads/[id]/reply/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../../../lib/dbConnect';
import Thread from '../../../../../../models/Thread';
import Message from '../../../../../../models/Message';
import Notification from '../../../../../../models/Notification';
import { verifyToken } from '../../../../../../utils/auth';
import { uploadSingle } from '../../../../../../utils/s3Upload';
import sendEmail from '../../../../../../utils/sendEmail';
import { generateEmailTemplate } from '../../../../../../utils/emailTemplate';

interface ThreadParticipant {
  _id: { toString: () => string };
  email: string;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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
    const thread = await Thread.findById(threadId).populate('participants', 'email');
    if (!thread) {
      return NextResponse.json({ success: false, message: 'Thread not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const content = formData.get('content') as string;
    const recipientId = formData.get('recipientId') as string;
    const attachments = formData.getAll('attachments') as File[];

    const message = new Message({
      threadId,
      sender: decodedToken.id,
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

    thread.lastMessageDate = message.createdAt;
    await thread.save();

    // Tworzenie powiadomienia
    const notification = new Notification({
      user: recipientId,
      type: 'new_message',
      message: `Nowa wiadomość w wątku ${thread.subject}`,
      thread: thread._id,
      subject: thread.subject
    });
    await notification.save();

    // Wysyłanie e-maila
    const recipient = thread.participants.find((p: ThreadParticipant) => p._id.toString() === recipientId);
    if (recipient) {
      const emailSubject = `Nowa wiadomość w wątku: ${thread.subject}`;
      const emailMessage = `
        Otrzymałeś nową wiadomość w wątku "${thread.subject}".
        
        Aby zobaczyć wiadomość, zaloguj się do systemu i przejdź do szczegółów wątku:
        ${process.env.FRONTEND_URL}/dashboard/messages/${thread._id}
      `;
  

      const emailContent = `
      <h2>Nowa wiadomość w wątku</h2>
      <p>Otrzymałeś nową wiadomość w wątku "${thread.subject}".</p>
      <p>Aby zobaczyć wiadomość, <a href="${process.env.FRONTEND_URL}/dashboard/messages/${thread._id}" class="button">zaloguj się do systemu</a> i przejdź do szczegółów wątku.</p>
    `;
    
    const emailData = {
      title: 'eCopywriting.pl',
      headerTitle: 'eCopywriting.pl',
      content: emailContent
    };
    
    const emailHtml = generateEmailTemplate(emailData);
    
    await sendEmail({
      email: recipient.email,
      subject: `eCopywriting.pl - Nowa wiadomość w wątku: ${thread.subject}`,
      message: emailHtml,
      isHtml: true
    });
    
    }

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/threads/[id]/reply:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}