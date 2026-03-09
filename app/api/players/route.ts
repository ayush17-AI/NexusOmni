import { NextResponse } from 'next/server';
import { scrapeLiquipediaRosters } from '@/lib/scrapers/liquipedia';

// Next.js Incremental Static Regeneration (ISR)
// Automatically purges and re-fetches the server cache every 3600 seconds (1 hour)
export const revalidate = 3600;

export async function GET() {
    try {
        // Fetch from our real-time scraper (which also writes to disk)
        const playersData = await scrapeLiquipediaRosters();
        return NextResponse.json(playersData);
    } catch (error) {
        console.error('Error fetching players:', error);
        return NextResponse.json({ error: 'Players Data Offline' }, { status: 500 });
    }
}
