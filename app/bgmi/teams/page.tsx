import Link from 'next/link'

export default function TeamsPage() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center text-white p-10 relative z-10 w-full">
            {/* Back Button */}
            <Link
                href="/bgmi"
                className="absolute top-8 left-8 text-xs tracking-[0.3em] text-white/50 hover:text-white transition-colors flex items-center gap-2"
                style={{ fontFamily: 'Exo 2, sans-serif' }}
            >
                <span>◄</span> BACK TO ZONE
            </Link>

            <h1
                className="text-5xl md:text-7xl font-black mb-6 tracking-tight uppercase"
                style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    textShadow: '0 0 20px rgba(255,255,255,0.2)'
                }}
            >
                Teams
            </h1>
            <p className="text-zinc-400 max-w-xl text-center tracking-wide leading-relaxed">
                Discover the top esports organizations and squads dominating the Battlegrounds. Roster data and team statistics coming soon.
            </p>
            
            <div className="mt-12 opacity-50 flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-zinc-700 border-t-white rounded-full animate-spin mb-4" />
                <p className="text-xs tracking-[0.3em] font-['Exo 2']">INITIALIZING DATABASE...</p>
            </div>
        </main>
    )
}
