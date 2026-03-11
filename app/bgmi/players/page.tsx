import PlayersGrid from "@/components/PlayersGrid"
import Link from 'next/link'

export default function PlayersPage() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-start text-white p-10 pt-24 relative z-10 w-full overflow-y-auto">
            {/* Back Button */}
            <Link
                href="/bgmi"
                className="absolute top-8 left-8 text-xs tracking-[0.3em] text-white/50 hover:text-white transition-colors flex items-center gap-2"
                style={{ fontFamily: 'Exo 2, sans-serif' }}
            >
                <span>◄</span> BACK TO ZONE
            </Link>

            <h1
                className="text-5xl font-black mb-12 tracking-tight uppercase"
                style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    textShadow: '0 0 20px rgba(255,255,255,0.2)'
                }}
            >
                Top BGMI Pro Players
            </h1>

            <PlayersGrid />
        </main>
    )
}
