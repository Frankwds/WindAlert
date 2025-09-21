import { StationDataService } from '@/lib/supabase/stationData';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
  const token = request.headers.get('token');
  const expectedToken = process.env.CRON_SECRET;
  if (!token || !expectedToken || token !== expectedToken) {
    console.log('Unauthorized Holfuy API attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Compressing Holfuy data for yesterday...');

    const data = await StationDataService.compressYesterdayStationData();

    console.log('Successfully compressed Holfuy data:', data);
    return NextResponse.json({
      message: 'Successfully compressed Holfuy data',
      stats: data && data.length > 0 ? data[0] : null
    });

  } catch (error) {
    console.error('Error compressing Holfuy data:', error);
    return NextResponse.json({ error: 'Error compressing Holfuy data' }, { status: 500 });
  }
}