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
    console.log('Compressing Holfuy data for yesterday...');

    const data = await Server.compressYesterdayStationData();
    console.log(`Successfully compressed 
      ${data.original_records} original records into 
      ${data.compressed_records} compressed records, for 
      ${data.stations_processed} unique stations`);
    return NextResponse.json({
      message: `Successfully compressed 
      ${data.original_records} original records into 
      ${data.compressed_records} compressed records, for 
      ${data.stations_processed} unique stations`,
    });

  } catch (error) {
    console.error('Error compressing Holfuy data:', error);
    return NextResponse.json({ error: 'Error compressing Holfuy data' }, { status: 500 });
  }
}