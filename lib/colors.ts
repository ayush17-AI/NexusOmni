// ── ESPORTS NEXUS COLOR TOKENS ────────────────────
export const colors = {
    // Global
    voidBlack: '#050505',
    darkSlate: '#121212',

    // BGMI Zone — Battleground Gold
    bgmiGold: '#F3AF19',
    bgmiBronze: '#B87333',

    // Free Fire Zone — Lava Crimson
    ffRed: '#FF3131',
    ffDark: '#8B0000',

    // COD Zone — Stealth Cyan
    codCyan: '#00F2FF',
    codDeep: '#006066',

    // UI
    glassSlate: 'rgba(26, 26, 26, 0.8)',
    glassBorder: '#444444',
} as const;

export const gradients = {
    global: 'linear-gradient(to bottom, #050505, #121212)',
    bgmi: 'linear-gradient(135deg, #F3AF19 0%, #B87333 100%)',
    ff: 'linear-gradient(135deg, #FF3131 0%, #8B0000 100%)',
    cod: 'linear-gradient(135deg, #00F2FF 0%, #006066 100%)',
} as const;

export const glows = {
    bgmi: '0 0 30px rgba(243, 175, 25, 0.5), 0 0 60px rgba(243, 175, 25, 0.2)',
    ff: '0 0 30px rgba(255, 49, 49, 0.5), 0 0 60px rgba(255, 49, 49, 0.2)',
    cod: '0 0 30px rgba(0, 242, 255, 0.5), 0 0 60px rgba(0, 242, 255, 0.2)',
} as const;
