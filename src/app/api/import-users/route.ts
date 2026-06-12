// ===================================================================
// API Route - טעינת תלמידים והורים
// הנתונים משובצים בקוד (bundle) וזמינים תמיד - גם ב-Vercel
// ===================================================================

import { NextResponse } from 'next/server';
import usersData from '@/data/users.json';

// סוג המשתמש
interface UserRecord {
  id: string;
  name: string;
  role: 'student' | 'parent';
  class: string;
  submitted_flag: boolean;
  voted_flag: boolean;
}

const users: UserRecord[] = usersData as UserRecord[];

export async function GET() {
  try {
    const students = users.filter(u => u.role === 'student').length;
    const parents = users.filter(u => u.role === 'parent').length;

    return NextResponse.json({
      success: true,
      students,
      parents,
      total: users.length,
      users,
    });
  } catch (error) {
    console.error('Error importing users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import users' },
      { status: 500 }
    );
  }
}