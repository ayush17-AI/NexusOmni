'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Starfield from '@/components/portal/Starfield';

interface Tournament {
    id: string;
    name: string;
    status: 'Upcoming' | 'Ongoing' | 'Finished';
    prize_pool: string;
    start_date: string;
    teams: number;
    location: string;
}

export default function TournamentsPage() {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const res = await fetch('/api/tournaments', { cache: 'no-store' });
                if (!res.ok) throw new Error('Failed to fetch format data');
                const data = await res.json();

                // Sort by date prioritizing Ongoing > Upcoming > Finished
                const sorted = data.sort((a: Tournament, b: Tournament) => {
                    const rank = { 'Ongoing': 1, 'Upcoming': 2, 'Finished': 3 };
                    return rank[a.status] - rank[b.status];
                });

                setTournaments(sorted);
            } catch (err) {
                console.error('Timeline fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTournaments();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Ongoing': return 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]';
            case 'Upcoming': return 'bg-[#F3AF19] shadow-[0_0_15px_rgba(243,175,25,0.6)]';
            case 'Finished': return 'bg-white/20';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="w-screen min-h-screen bg-black" style={{ width: '100vw' }}>
            <main className="relative min-h-screen text-white w-full">
                <Starfield />

                {/* Breadcrumbs */}
                <div className="absolute top-8 left-8 z-30">
                    <Link
                        href="/bgmi"
                        className="text-xs tracking-[0.3em] transition-colors hover:text-white flex items-center gap-2"
                        style={{ color: 'rgba(243,175,25,0.5)', fontFamily: 'Exo 2, sans-serif' }}
                    >
                        <span className="opacity-50">◄</span> COMMAND CENTER
                    </Link>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 md:py-32">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-20 text-center md:text-left">
                        <h1
                            className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4"
                            style={{ fontFamily: 'Rajdhani, sans-serif' }}
                        >
                            Circuit <span style={{ color: '#F3AF19' }}>Timeline</span>
                        </h1>
                        <p className="text-white/50 tracking-widest text-sm uppercase" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                            LIVE TOURNAMENT SCHEDULE AND PRIZE POOL TRACKER
                        </p>
                    </motion.div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mb-4" />
                            <p className="text-[10px] tracking-[0.3em] font-['Exo 2']">DOWNLOADING CALENDAR...</p>
                        </div>
                    ) : (
                        <div className="relative border-l border-white/10 ml-4 md:ml-8 space-y-12">
                            {tournaments.map((trn, idx) => (
                                <motion.div
                                    key={trn.id}
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.15 }}
                                    className={`relative pl-8 md:pl-12 py-2 group ${trn.status === 'Finished' ? 'opacity-50 hover:opacity-100 transition-opacity' : ''}`}
                                >
                                    {/* Glowing Dot */}
                                    <div className={`absolute -left-[5px] top-4 w-[9px] h-[9px] rounded-full ${getStatusColor(trn.status)} transition-all duration-300 group-hover:scale-150`} />

                                    {/* Status Chip */}
                                    <div className="mb-3">
                                        <span
                                            className="text-[9px] tracking-[0.3em] uppercase py-1 px-3 rounded-full border"
                                            style={{
                                                fontFamily: 'Exo 2, sans-serif',
                                                borderColor: trn.status === 'Ongoing' ? 'rgba(239,68,68,0.5)' : trn.status === 'Upcoming' ? 'rgba(243,175,25,0.5)' : 'rgba(255,255,255,0.2)',
                                                color: trn.status === 'Ongoing' ? '#ef4444' : trn.status === 'Upcoming' ? '#F3AF19' : 'rgba(255,255,255,0.5)'
                                            }}
                                        >
                                            • {trn.status}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 group-hover:border-white/30 transition-colors">
                                        <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-wide mb-4" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                            {trn.name}
                                        </h3>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                                            <div>
                                                <p className="text-[9px] text-[#F3AF19] tracking-widest mb-1" style={{ fontFamily: 'Exo 2, sans-serif' }}>PRIZE POOL</p>
                                                <p className="font-bold text-lg">{trn.prize_pool}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-[#F3AF19] tracking-widest mb-1" style={{ fontFamily: 'Exo 2, sans-serif' }}>START DATE</p>
                                                <p className="font-bold">{new Date(trn.start_date).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-white/50 tracking-widest mb-1" style={{ fontFamily: 'Exo 2, sans-serif' }}>LOCATION</p>
                                                <p className="font-light text-sm text-white/80">{trn.location}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-white/50 tracking-widest mb-1" style={{ fontFamily: 'Exo 2, sans-serif' }}>ROSTERS</p>
                                                <p className="font-light text-sm text-white/80">{trn.teams} Teams</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
