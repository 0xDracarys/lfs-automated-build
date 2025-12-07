import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

interface CommandData {
  userId: string;
  command: string;
  category: string;
  success: boolean;
  output?: string;
  executedAt?: Date;
}

// Track command execution
export async function POST(request: NextRequest) {
  try {
    const { userId, command, category, success, output } = (await request.json()) as CommandData;

    if (!userId || !command || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const commandsRef = collection(db, `users/${userId}/commands`);

    await addDoc(commandsRef, {
      command,
      category,
      success,
      output: output || '',
      executedAt: new Date(),
      createdAt: new Date(),
    });

    // Also track as activity
    const activitiesRef = collection(db, `users/${userId}/activities`);
    await addDoc(activitiesRef, {
      eventType: 'command_executed',
      details: { command, category, success },
      timestamp: new Date(),
      createdAt: new Date(),
    });

    return NextResponse.json(
      { success: true, message: 'Command tracked' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error tracking command:', error);
    return NextResponse.json(
      { error: 'Failed to track command' },
      { status: 500 }
    );
  }
}

// Get user commands
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const category = request.nextUrl.searchParams.get('category');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    const commandsRef = collection(db, `users/${userId}/commands`);
    let q;

    if (category) {
      q = query(commandsRef, where('category', '==', category));
    } else {
      q = query(commandsRef);
    }

    const snapshot = await getDocs(q);
    const commands = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      executedAt: doc.data().executedAt?.toDate?.() || new Date(),
    }));

    return NextResponse.json({ commands }, { status: 200 });
  } catch (error) {
    console.error('Error fetching commands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commands' },
      { status: 500 }
    );
  }
}
