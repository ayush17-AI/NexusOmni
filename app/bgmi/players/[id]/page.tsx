import { headers } from 'next/headers';
import Link from 'next/link';
import Starfield from '@/components/portal/Starfield';

// Fetch the specific player from the Live API
async function getPlayer(id: string) {
    // Utilize the incoming request host to construct an absolute URL for the internal API fetch
    const headersList = await headers();
    const domain = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

    const res = await fetch(`${protocol}://${domain}/api/players`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch player intel');
    const players = await res.json();
    return players.find((p: any) => p.id === id);
}

export default async function PlayerDetail({ params }: { params: { id: string } }) {
    const player = await getPlayer(params.id);

    if (!player) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <Starfield />
                <div className="relative z-10 text-center">
                    <h1 className="text-4xl text-[#F3AF19] font-black tracking-widest mb-4">404: COMMLINK LOST</h1>
                    <p className="text-white/50 mb-8 uppercase text-sm tracking-widest" style={{ fontFamily: 'Exo 2, sans-serif' }}>Player intel not found in active database.</p>
                    <Link href="/bgmi/players" className="px-6 py-2 border border-white/20 hover:bg-white/10 transition-colors uppercase text-xs tracking-widest">
                        Return to Roster
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="relative min-h-screen text-white bg-black">
            <Starfield />

            <div className="absolute top-8 left-8 z-50">
                <Link
                    href="/bgmi/players"
                    className="text-xs tracking-[0.3em] transition-colors hover:text-white flex items-center gap-2"
                    style={{ color: 'rgba(243,175,25,0.5)', fontFamily: 'Exo 2, sans-serif' }}
                >
                    <span className="opacity-50">◄</span> ABORT
                </Link>
            </div>

            <div
                className="relative z-10 w-full min-h-screen flex flex-col md:flex-row items-center justify-center p-6 md:p-24 overflow-hidden"
            >
                {/* Left Panel: Dense Typography & Stats */}
                <div className="w-full md:w-1/2 flex flex-col justify-center z-20 pb-12 md:pb-0 px-4 md:px-0">
                    <div
                        className="text-xs uppercase tracking-[0.4em] text-[#F3AF19] mb-4 animate-pulse"
                        style={{ fontFamily: 'Exo 2, sans-serif' }}
                    >
                        LIVE FEED // {player.team} · {player.role}
                    </div>

                    <h2
                        className="text-7xl md:text-[10rem] font-black leading-none mb-8 uppercase"
                        style={{
                            fontFamily: 'Rajdhani, sans-serif',
                            textShadow: '0 0 40px rgba(243,175,25,0.3)',
                            background: 'linear-gradient(to bottom right, #fff, #a0a0a0)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        {player.name}
                    </h2>

                    <p
                        className="text-lg text-white/60 mb-12 max-w-md leading-relaxed border-l-2 border-[#F3AF19]/50 pl-4"
                        style={{ fontFamily: 'Exo 2, sans-serif' }}
                    >
                        {player.bio}
                    </p>

                    <div className="flex gap-12 bg-white/5 p-6 rounded-xl border border-white/10 backdrop-blur-sm self-start">
                        <div>
                            <div className="text-[10px] text-[#F3AF19] mb-2 tracking-[0.3em] uppercase" style={{ fontFamily: 'Exo 2, sans-serif' }}>Career Elims</div>
                            <div className="text-4xl md:text-5xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{player.total_kills.toLocaleString()}</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-[#F3AF19] mb-2 tracking-[0.3em] uppercase" style={{ fontFamily: 'Exo 2, sans-serif' }}>Headshot Rate</div>
                            <div className="text-4xl md:text-5xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{player.headshot_rate}</div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Character Render */}
                <div
                    className="absolute md:relative right-0 flex-1 h-[60vh] md:h-[80vh] z-10 flex justify-end items-end md:items-center opacity-30 md:opacity-100"
                >
                    <div className="w-full h-full bg-gradient-to-t from-black via-transparent to-transparent absolute inset-0 z-20 md:hidden" />
                    <img
                        src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200"
                        alt={`${player.name} profile`}
                        className="h-full object-cover md:object-contain object-right"
                        style={{ filter: 'drop-shadow(-20px 0 30px rgba(0,0,0,0.8)) hue-rotate(-15deg)' }}
                    />
                </div>
            </div>
        </main>
    );
}
