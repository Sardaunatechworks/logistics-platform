import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { respondToAssignment } from '@/features/riders/rider-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assignmentId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { action, notes } = await request.json(); // action = 'accept' | 'reject'

    if (action !== 'accept' && action !== 'reject') {
      return NextResponse.json({ error: "Action must be 'accept' or 'reject'" }, { status: 400 });
    }

    const result = await respondToAssignment({
      assignmentId,
      riderId: user.id,
      action,
      notes,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, action });
  } catch (err) {
    console.error('Assignment response error:', err);
    return NextResponse.json({ error: 'Internal server error processing assignment response' }, { status: 500 });
  }
}

