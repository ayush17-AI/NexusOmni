import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Free Fire Zone — Nexus Esports',
    description: 'Free Fire MAX esports hub. Coming soon.',
};

export default function FreeFirePage() {
    return (
        <main
            className="min-h-screen flex flex-col items-center justify-center"
            style={{ background: 'linear-gradient(to bottom, #050505, #1a0000)' }}
        >
            <div className="text-center">
                <p
                    className="text-xs tracking-[0.4em] mb-4"
                    style={{ color: '#FF3131', fontFamily: 'Exo 2, sans-serif' }}
                >
                    ◆ LAVA CRIMSON ZONE
                </p>
                <h1
                    className="text-8xl font-black mb-4"
                    style={{
                        background: 'linear-gradient(135deg, #FF3131 0%, #8B0000 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontFamily: 'Rajdhani, sans-serif',
                    }}
                >
                    FREE FIRE
                </h1>
                <p className="text-white/30 mb-8 tracking-widest text-sm" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                    FREE FIRE MAX DASHBOARD — COMING SOON
                </p>
                <Link
                    href="/"
                    className="text-xs tracking-widest px-6 py-3 rounded-lg border transition-colors duration-200"
                    style={{
                        borderColor: '#FF3131',
                        color: '#FF3131',
                        fontFamily: 'Exo 2, sans-serif',
                    }}
                >
                    ← BACK TO NEXUS
                </Link>
            </div>
        </main>
    );
}
