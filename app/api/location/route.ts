import { NextResponse } from 'next/server';

/**
 * Demo API Route for receiving GPS data from an ambulance client.
 * In a real production scenario, this would validate auth tokens and save to a database.
 */

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Basic validation
    if (!data.lat || !data.lng || !data.ambulanceId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    console.log(`[API] Received location for ${data.ambulanceId}: ${data.lat}, ${data.lng}`);

    // In a real app:
    // await db.locations.upsert({ ambulanceId: data.ambulanceId, lat: data.lat, lng: data.lng });
    // await triggerReroutingIfNecessary(data);

    return NextResponse.json({ 
      success: true, 
      timestamp: new Date().toISOString(),
      message: 'Location data received and processed' 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
