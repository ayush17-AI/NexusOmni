import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'COD Zone — Nexus Esports',
    description: 'Call of Duty Mobile esports hub. Coming soon.',
};

export default function CODPage() {
    return (
        <main
            className="min-h-screen flex flex-col items-center justify-center"
            style={{ background: 'linear-gradient(to bottom, #050505, #001a1a)' }}
        >
            <div className="text-center">
                <p
                    className="text-xs tracking-[0.4em] mb-4"
                    style={{ color: '#00F2FF', fontFamily: 'Exo 2, sans-serif' }}
                >
                    ◆ STEALTH CYAN ZONE
                </p>
                <h1
                    className="text-8xl font-black mb-4"
                    style={{
                        background: 'linear-gradient(135deg, #00F2FF 0%, #006066 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontFamily: 'Rajdhani, sans-serif',
                    }}
                >
                    COD: MW
                </h1>
                <p className="text-white/30 mb-8 tracking-widest text-sm" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                    CALL OF DUTY MOBILE DASHBOARD — COMING SOON
                </p>
                <Link
                    href="/"
                    className="text-xs tracking-widest px-6 py-3 rounded-lg border transition-colors duration-200"
                    style={{
                        borderColor: '#00F2FF',
                        color: '#00F2FF',
                        fontFamily: 'Exo 2, sans-serif',
                    }}
                >
                    ← BACK TO NEXUS
                </Link>
            </div>
        </main>
    );
}
