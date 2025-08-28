// src/app/api/admin/articles/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../../utils/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('Admin article GET request received with params:', params);
  console.log('Request headers:', Object.fromEntries(req.headers));
  console.log('Request URL:', req.url);
  console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

  try {
    // Sprawdź czy mamy ID
    if (!params?.id) {
      console.log('No ID provided in params');
      return NextResponse.json(
        { success: false, message: 'No ID provided' },
        { status: 400 }
      );
    }

    // Sprawdź token
    const token = req.headers.get('Authorization')?.split(' ')[1];
    console.log('Extracted token:', token?.substring(0, 10) + '...');

    if (!token) {
      console.log('No token provided');
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    // Weryfikuj token
    console.log('Verifying token...');
    const decodedToken = await verifyToken(token);
    console.log('Decoded token:', {
      role: decodedToken?.role,
      userId: decodedToken?.id,
    });

    if (!decodedToken || decodedToken.role !== 'admin') {
      console.log('Unauthorized access attempt:', {
        role: decodedToken?.role,
      });
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Wykonaj zapytanie do backendu
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/articles/${params.id}`;
    console.log('Sending request to:', backendUrl);

    const response = await fetch(backendUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Backend response status:', response.status);
    const data = await response.json();
    console.log('Backend response data:', data);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Detailed error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('Admin article PUT request received with params:', params);
  console.log('Request headers:', Object.fromEntries(req.headers));

  try {
    if (!params?.id) {
      console.log('No ID provided in PUT request');
      return NextResponse.json(
        { success: false, message: 'No ID provided' },
        { status: 400 }
      );
    }

    const token = req.headers.get('Authorization')?.split(' ')[1];
    console.log('Extracted token:', token?.substring(0, 10) + '...');

    if (!token) {
      console.log('No token provided in PUT request');
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    console.log('Verifying token for PUT request...');
    const decodedToken = await verifyToken(token);
    console.log('Decoded token for PUT:', {
      role: decodedToken?.role,
      userId: decodedToken?.id,
    });

    if (!decodedToken || decodedToken.role !== 'admin') {
      console.log('Unauthorized PUT attempt:', {
        role: decodedToken?.role,
      });
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    console.log('FormData fields:', Array.from(formData.keys()));

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/articles/${params.id}`;
    console.log('Sending PUT request to:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    console.log('Backend PUT response status:', response.status);
    const data = await response.json();
    console.log('Backend PUT response data:', data);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Detailed PUT error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
