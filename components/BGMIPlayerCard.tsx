"use client";

import Image from "next/image";

interface BGMIPlayerCardProps {
  ign: string;
  team: string;
  mvpTitles: number;
  image: string;
}

export function BGMIPlayerCard({ ign, team, mvpTitles, image }: BGMIPlayerCardProps) {
  return (
    <div
      className="group relative flex flex-col items-center overflow-hidden rounded-xl border border-white/10 bg-black/40 p-4 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,170,0,0.6)] hover:border-orange-500/50 backdrop-blur-sm"
    >
      {/* Glow Effect Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-orange-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Image Container */}
      <div className="relative z-10 mb-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-white/20 bg-gray-900 group-hover:border-orange-500/80 transition-colors">
        <Image
          src={image}
          alt={ign}
          width={128}
          height={128}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex w-full flex-col items-center text-center">
        <h3 className="mb-1 text-xl font-bold tracking-wider text-white">
          {ign}
        </h3>
        <p className="mb-3 text-sm font-medium text-gray-400">
          Team: <span className="text-orange-400">{team}</span>
        </p>
        
        <div className="mt-auto flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 border border-white/5">
          <span className="text-xs uppercase tracking-widest text-gray-500">MVP Titles</span>
          <span className="text-lg font-black text-yellow-400">{mvpTitles}</span>
        </div>
      </div>
    </div>
  );
}
