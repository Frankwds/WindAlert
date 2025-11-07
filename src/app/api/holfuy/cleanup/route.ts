import { Server } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.headers.get('token');
  const expectedToken = process.env.CRON_SECRET;
  if (!token || !expectedToken || token !== expectedToken) {
    console.log('Unauthorized Holfuy API attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Cleaning up Holfuy data...');

    const deletedData = await Server.deleteAllOlderThanTwentyFourHours();
    console.log(`Successfully deleted ${deletedData.deleted_records} old station data`);

    return NextResponse.json({
      message: `Successfully deleted ${deletedData.deleted_records} old station data`,
    });
  } catch (error) {
    console.error('Error cleaning up Holfuy data:', error);
    return NextResponse.json({ error: 'Error cleaning up Holfuy data' }, { status: 500 });
  }
}
